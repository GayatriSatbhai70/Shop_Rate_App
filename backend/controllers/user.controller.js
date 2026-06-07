const { Op } = require('sequelize');
const { Store, Rating, User, sequelize } = require('../models');

const listStoresForUser = async (req, res) => {
  try {
    const { search, name, address, sortBy, sortOrder } = req.query;
    const userId = req.user.id;

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
      } else if (sortBy === 'overallRating') {
        orderClause = [[sequelize.literal('overallRating'), direction]];
      }
    }

    const stores = await Store.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'address',
        'imageUrl',
        [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('ratings.rating')), 0), 'overallRating'],
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

    const userRatings = await Rating.findAll({
      where: { userId },
    });

    const userRatingsMap = {};
    userRatings.forEach(r => {
      userRatingsMap[r.storeId] = {
        id: r.id,
        rating: r.rating,
      };
    });

    const formattedStores = stores.map(store => {
      const data = store.get({ plain: true });
      const userRatingDetails = userRatingsMap[data.id];

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        address: data.address,
        imageUrl: data.imageUrl,
        overallRating: parseFloat(parseFloat(data.overallRating).toFixed(2)),
        userSubmittedRating: userRatingDetails ? userRatingDetails.rating : null,
        userRatingId: userRatingDetails ? userRatingDetails.id : null,
        hasSubmitted: !!userRatingDetails,
      };
    });

    return res.status(200).json(formattedStores);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve store listings', error: error.message });
  }
};

const submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    const existingRating = await Rating.findOne({
      where: { userId, storeId },
    });

    if (existingRating) {
      return res.status(400).json({
        message: 'You have already rated this store. Please modify your rating instead.',
        ratingId: existingRating.id,
      });
    }

    // Create the rating
    const newRating = await Rating.create({
      userId,
      storeId,
      rating,
    });

    return res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit rating', error: error.message });
  }
};

const modifyRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const ratingRecord = await Rating.findByPk(id);
    if (!ratingRecord) {
      return res.status(404).json({ message: 'Rating record not found.' });
    }

    if (ratingRecord.userId !== userId) {
      return res.status(403).json({ message: 'Permission denied. You can only modify your own ratings.' });
    }

    ratingRecord.rating = rating;
    await ratingRecord.save();

    return res.status(200).json({
      message: 'Rating updated successfully',
      rating: ratingRecord,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to modify rating', error: error.message });
  }
};

module.exports = {
  listStoresForUser,
  submitRating,
  modifyRating,
};
