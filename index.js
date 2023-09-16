const { default: mongoose } = require('mongoose');
const app = require('./src/server');
require('dotenv').config();

const port = process.env.PORT;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Mongodb ready');
        app.listen(port, () => {
            console.log('Server at http://localhost:' + port);
        });
    })
    .catch((error) => {
        console.log(error);
    });
