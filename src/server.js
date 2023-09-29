const express = require('express');
const cors = require('cors');

require('dotenv').config();

const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', routes);

app.use((_, res) => {
    return res.status(404).json('API not found');
});

module.exports = app;
