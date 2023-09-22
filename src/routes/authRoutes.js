const router = require('express').Router();
const Auth = require('../controllers/authController');

router.post('/login', Auth.authenticateCredentials);

module.exports = router;
