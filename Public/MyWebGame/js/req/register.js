const form = document.getElementById('register-Form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // User name fetched from the input fields
  const username = form.elements['uname'].value;
  const password = form.elements['psw'].value;

  // Request made to the server
  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const result = await response.json();

    if (result.status === 'ok') {
      alert(`Registration Successful, Welcome ${username}`);
      window.location.href = '/html/login.html';
    } else {
      alert(`Registration Failed, ${result.error}`);
    }
  } catch (error) {
    console.error('Error during registration:', error);
    alert('An error occurred during registration. Please try again.');
  }
});

