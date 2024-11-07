// script.js

// Register Logic (register.html)
if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent form submission

        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        // Create user object
        const user = {
            username: username,
            email: email,
            password: password
        };

        // Save user to local storage
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));

        alert('Registration successful! You can now log in.');
        window.location.href = 'login.html'; // Redirect to Login Page
    });
}

// Login Logic (login.html)
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent form submission

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Retrieve users from local storage
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Find user with matching email and password
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            // Save the logged-in user's name in localStorage
            localStorage.setItem('loggedInUser', user.username);
            window.location.href = 'home.html'; // Redirect to Home Page
        } else {
            document.getElementById('login-message').textContent = "Invalid email or password.";
        }
    });
}

// Display User's Name on Home Page (home.html)
if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = localStorage.getItem('loggedInUser') || 'Guest';
}

// Display the logged-in user's name on the home page
window.onload = function () {
    const userName = localStorage.getItem('loggedInUser') || 'Guest';
    document.getElementById('user-name').textContent = userName;
};