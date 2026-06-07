const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { initializeDatabase, sequelize } = require('./config/database');
const { User, Store, Rating } = require('./models');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRoutes);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Shop Rate App Backend is running smoothly.' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

async function seedDatabase() {
  try {
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('Database already populated. Skipping seeding.');
      return;
    }

    console.log('Seeding database with default test accounts...');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('AdminPass123!', salt);
    const userPassword = await bcrypt.hash('UserPass123!', salt);
    const ownerPassword = await bcrypt.hash('OwnerPass123!', salt);

    const admin = await User.create({
      name: 'System Administrator User Account',
      email: 'admin@shoprate.com',
      password: adminPassword,
      address: '123 Admin Headquarter St, Cityville',
      role: 'admin',
    });

    const user = await User.create({
      name: 'Jane Margaret Doe Doe Doe',
      email: 'jane@shoprate.com',
      password: userPassword,
      address: '456 User Residential Ave, Townsville',
      role: 'user',
    });

    const owner = await User.create({
      name: 'Organic Grocer Store Owner',
      email: 'grocer@shoprate.com',
      password: ownerPassword,
      address: '789 Fresh Organic Food Way, Farmtown',
      role: 'owner',
    });

    const store = await Store.create({
      name: 'Super Organic Grocery Store',
      email: 'grocer@shoprate.com',
      address: '789 Fresh Organic Food Way, Farmtown',
      ownerId: owner.id,
    });

    await Rating.create({
      userId: user.id,
      storeId: store.id,
      rating: 5,
    });

    console.log('Seeding completed successfully!');
    console.log('Default Accounts Seeding Info:');
    console.log('----------------------------------------------------');
    console.log('1. Admin: admin@shoprate.com / AdminPass123!');
    console.log('2. User:  jane@shoprate.com / UserPass123!');
    console.log('3. Owner: grocer@shoprate.com / OwnerPass123!');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
}

async function startServer() {
  try {
    await initializeDatabase();

    await sequelize.authenticate();
    console.log('Connection to MySQL database has been established.');

    await sequelize.sync({ alter: true });
    console.log('Database models synchronized with MySQL.');

    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`Shop Rate App Backend server is active on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Local URL: http://localhost:${PORT}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start the application server:', error);
    process.exit(1);
  }
}

startServer();
