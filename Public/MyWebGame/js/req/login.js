const form = document.getElementById('login-Form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // User name fetched from the input fields
  const username = form.elements['uname'].value;
  const password = form.elements['psw'].value;

  // Request made to the server
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const responseData = await response.json();

    if (responseData.status === 'ok') {
      console.log('token received: ', responseData.data);
      alert(`Login Successful, Welcome ${username}`);
      localStorage.setItem('userToken', responseData.data);
      // Load game
      window.location.href = '/html/Game.html';
    } else {
      alert(`${responseData.error}`);
    }
  } catch (error) {
    console.error('Error during login:', error);
    // Handle error as needed
    alert('An error occurred during login. Please try again.');
  }
});
