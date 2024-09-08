const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const flash = require('express-flash');
const session = require('express-session');

const app = express();
const port = 3000;

// MySQL database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'enter_your_user_name',
    password: 'enter_your_password',
    database: 'eenter_your_database'
});

// Configure session and flash
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(flash());

// Serve static files from the public folder
app.use(express.static('public'));

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sign In logic
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // Check the provided credentials against the database
    connection.query(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Internal Server Error');
            }

            if (results.length > 0) {
                // Sign In successful
                // Redirect to index.html
                res.redirect('/index.html');
            } else {
                // Invalid credentials
                res.status(401).send('Invalid email or password. If you have not signed up yet then signup first!');
            }
        }
    );
});

// Sign Up logic
app.post('/signup', (req, res) => {
    const { fullname, email, password } = req.body;

    // Check if the email is already registered
    connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Internal Server Error');
            }

            if (results.length > 0) {
                // Email already exists
                req.flash('error', 'Email already registered');
                return res.redirect('/signup.html'); // Redirect to signup page
            }

            // If email is not registered, insert the new user
            connection.query(
                'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)',
                [fullname, email, password],
                (error, results) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).send('Internal Server Error');
                    }

                    // Flash success message
                    req.flash('success', `Sign Up successful - Welcome, ${fullname}!`);
                    
                    // Redirect to index.html
                    res.redirect('/index.html');
                }
            );
        }
    );
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});