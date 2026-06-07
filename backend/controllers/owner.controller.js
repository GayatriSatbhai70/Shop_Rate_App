const { Store, Rating, User, sequelize } = require('../models');

const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy, sortOrder } = req.query;

    const store = await Store.findOne({
      where: { ownerId },
    });

    if (!store) {
      return res.status(404).json({ message: 'Store record not found for this user.' });
    }

    let orderClause = [['createdAt', 'DESC']];
    const direction = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    if (sortBy) {
      if (['name', 'email'].includes(sortBy)) {
        orderClause = [[{ model: User, as: 'user' }, sortBy, direction]];
      } else if (['rating', 'createdAt'].includes(sortBy)) {
        orderClause = [[sortBy, direction]];
      }
    }

    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'address'],
        },
      ],
      order: orderClause,
    });

    const avgRatingResult = await Rating.findOne({
      where: { storeId: store.id },
      attributes: [
        [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('rating')), 0), 'avgRating'],
      ],
      raw: true,
    });

    const averageRating = parseFloat(parseFloat(avgRatingResult.avgRating).toFixed(2));

    const reviewers = ratings.map(r => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      user: r.user ? {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      } : null,
    }));

    return res.status(200).json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
      },
      reviewers,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve owner dashboard data', error: error.message });
  }
};

module.exports = {
  getOwnerDashboard,
};
