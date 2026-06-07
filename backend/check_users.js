const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  try {
    const users = await User.findAll();
    console.log(`Found ${users.length} users in database:`);
    for (const u of users) {
      console.log(`ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role}`);
      const isAdminPass = await bcrypt.compare('AdminPass123!', u.password);
      const isUserPass = await bcrypt.compare('UserPass123!', u.password);
      const isOwnerPass = await bcrypt.compare('OwnerPass123!', u.password);
      
      console.log(`  - Password match AdminPass123!: ${isAdminPass}`);
      console.log(`  - Password match UserPass123!: ${isUserPass}`);
      console.log(`  - Password match OwnerPass123!: ${isOwnerPass}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error querying DB:', err.message);
    process.exit(1);
  }
}

checkUsers();
