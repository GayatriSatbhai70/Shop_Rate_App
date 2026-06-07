async function testAdmin() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@shoprate.com',
        password: 'AdminPass123!'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login Token retrieved:', token ? 'YES' : 'NO');

    const statsRes = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Stats status:', statsRes.status);
    const statsData = await statsRes.json();
    console.log('Stats data:', JSON.stringify(statsData, null, 2));

    const usersRes = await fetch('http://localhost:5000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Users status:', usersRes.status);
    const usersData = await usersRes.json();
    console.log('Users data length:', Array.isArray(usersData) ? usersData.length : 'NOT AN ARRAY', usersData);

  } catch (err) {
    console.error('Error:', err);
  }
}

testAdmin();
