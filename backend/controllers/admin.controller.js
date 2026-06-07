const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Store, Rating, sequelize } = require('../models');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    return res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve dashboard statistics', error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (role === 'owner') {
      return res.status(400).json({
        message: 'To add a Store Owner, please use the Add Store endpoint.',
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role,
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

const createStore = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, email, password, address } = req.body;
    let imageUrl = req.body.imageUrl || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already in use by another user.' });
    }

    const existingStore = await Store.findOne({ where: { email } });
    if (existingStore) {
      return res.status(400).json({ message: 'Email address is already in use by another store.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newOwner = await User.create({
      name, // Store Name acts as Owner Name for registration fields
      email,
      password: hashedPassword,
      address,
      role: 'owner',
    }, { transaction });

    const newStore = await Store.create({
      name,
      email,
      address,
      imageUrl,
      ownerId: newOwner.id,
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      message: 'Store and Owner created successfully',
      store: {
        id: newStore.id,
        name: newStore.name,
        email: newStore.email,
        address: newStore.address,
        imageUrl: newStore.imageUrl,
        ownerId: newStore.ownerId,
      },
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: 'Failed to create store', error: error.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const { search, name, email, address, role, sortBy, sortOrder } = req.query;

    const whereClause = {
      role: {
        [Op.in]: ['admin', 'user', 'owner'],
      },
    };

    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (email) whereClause.email = { [Op.like]: `%${email}%` };
    if (address) whereClause.address = { [Op.like]: `%${address}%` };
    if (role) {
      if (['admin', 'user', 'owner'].includes(role)) {
        whereClause.role = role;
      } else {
        return res.status(400).json({ message: 'Role filter must be admin, user, or owner.' });
      }
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    let orderClause = [['name', 'ASC']];
    const allowedSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      const direction = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderClause = [[sortBy, direction]];
    }

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
      where: whereClause,
      order: orderClause,
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve users list', error: error.message });
  }
};

const listStores = async (req, res) => {
  try {
    const { search, name, email, address, sortBy, sortOrder } = req.query;

    const whereClause = {};
    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (email) whereClause.email = { [Op.like]: `%${email}%` };
    if (address) whereClause.address = { [Op.like]: `%${address}%` };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    let orderClause = [['name', 'ASC']];
    const direction = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    if (sortBy) {
      if (['name', 'email', 'address', 'createdAt'].includes(sortBy)) {
        orderClause = [[sortBy, direction]];
      } else if (sortBy === 'rating') {
        orderClause = [[sequelize.literal('rating'), direction]];
      }
    }

    const stores = await Store.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'address',
        'imageUrl',
        'createdAt',
        [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('ratings.rating')), 0), 'rating'],
      ],
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: [],
        },
      ],
      where: whereClause,
      group: ['Store.id'],
      order: orderClause,
      subQuery: false,
    });

    const formattedStores = stores.map(store => {
      const data = store.get({ plain: true });
      data.rating = parseFloat(parseFloat(data.rating).toFixed(2));
      return data;
    });

    return res.status(200).json(formattedStores);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve stores list', error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userData = user.get({ plain: true });

    if (userData.role === 'owner') {
      // Find the store owned by this user and calculate average rating
      const store = await Store.findOne({
        where: { ownerId: id },
        attributes: [
          'id',
          'name',
          [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('ratings.rating')), 0), 'rating'],
        ],
        include: [
          {
            model: Rating,
            as: 'ratings',
            attributes: [],
          },
        ],
        group: ['Store.id'],
      });

      userData.rating = store ? parseFloat(parseFloat(store.get('rating')).toFixed(2)) : 0;
      userData.storeId = store ? store.id : null;
      userData.storeName = store ? store.name : null;
    }

    return res.status(200).json(userData);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve user details', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  listUsers,
  listStores,
  getUserDetails,
};
