const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
const app = express();

connectDB();

// Init Middlewares
app.use(express.json({ extended: false }));
app.use(cookieParser('your-secret-key'));
app.use(cors());
// app.use(bodyParser.json());

// Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/surveys', require('./routes/api/surveys'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
