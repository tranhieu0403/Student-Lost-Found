async function test() {
  try {
    console.log('Logging in as 22110001@student.edu.vn...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '22110001@student.edu.vn',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login success:', loginData.success);
    const token = loginData.data?.token;
    console.log('Token exists:', !!token);

    console.log('\n--- Fetching /api/posts without token ---');
    const resNoToken = await fetch('http://localhost:5000/api/posts');
    const dataNoToken = await resNoToken.json();
    console.log('Total posts:', dataNoToken.data?.total);

    console.log('\n--- Fetching /api/posts with token ---');
    const resWithToken = await fetch('http://localhost:5000/api/posts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataWithToken = await resWithToken.json();
    console.log('Total posts:', dataWithToken.data?.total);

    console.log('\n--- Fetching /api/posts?mine=true with token ---');
    const resMine = await fetch('http://localhost:5000/api/posts?mine=true', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataMine = await resMine.json();
    console.log('Total posts:', dataMine.data?.total);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
