const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

app.use((_, res) => {
    return res.status(404).json('API not found');
});

module.exports = app;
