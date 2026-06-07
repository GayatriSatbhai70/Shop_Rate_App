const { Store, Rating, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const getPublicStats = async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: { [Op.ne]: 'admin' } } });
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    return res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve public statistics', error: error.message });
  }
};

const listStoresPublic = async (req, res) => {
  try {
    const { search, name, address, sortBy, sortOrder } = req.query;

    const whereClause = {};
    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (address) whereClause.address = { [Op.like]: `%${address}%` };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
      ];
    }

    let orderClause = [['name', 'ASC']];
    const direction = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    if (sortBy) {
      if (['name', 'address'].includes(sortBy)) {
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

const getStoreDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id, {
      attributes: ['id', 'name', 'email', 'address', 'imageUrl', 'createdAt'],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    const ratings = await Rating.findAll({
      where: { storeId: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const avgRatingResult = await Rating.findOne({
      where: { storeId: id },
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('rating')), 0), 'avgRating'],
      ],
      raw: true,
    });

    const averageRating = parseFloat(parseFloat(avgRatingResult.avgRating).toFixed(2));

    return res.status(200).json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        imageUrl: store.imageUrl,
        createdAt: store.createdAt,
        owner: store.owner ? { name: store.owner.name, email: store.owner.email } : null,
        averageRating,
      },
      ratings: ratings.map(r => ({
        id: r.id,
        rating: r.rating,
        createdAt: r.createdAt,
        reviewerName: r.user ? r.user.name : 'Verified Customer',
        reviewerEmail: r.user ? r.user.email : null,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve store details', error: error.message });
  }
};

module.exports = {
  getPublicStats,
  listStoresPublic,
  getStoreDetails,
};
