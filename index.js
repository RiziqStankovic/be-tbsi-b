const app = require('./src/server');
const mongoInit = require('./src/config/database_connect');
require('dotenv').config();

mongoInit();

const port = process.env.PORT;

app.listen(port, () => {
    console.log('Server at http://localhost:' + port);
});
