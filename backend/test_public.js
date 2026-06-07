async function testPublic() {
  try {
    const statsRes = await fetch('http://localhost:5000/api/public/stats');
    console.log('Public Stats status:', statsRes.status);
    const statsData = await statsRes.json();
    console.log('Public Stats data:', JSON.stringify(statsData, null, 2));

    const storesRes = await fetch('http://localhost:5000/api/public/stores');
    console.log('Public Stores status:', storesRes.status);
    const storesData = await storesRes.json();
    console.log('Public Stores data length:', Array.isArray(storesData) ? storesData.length : 'NOT AN ARRAY', storesData);
  } catch (err) {
    console.error('Error:', err);
  }
}

testPublic();
