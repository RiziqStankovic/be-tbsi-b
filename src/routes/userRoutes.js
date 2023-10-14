const router = require('express').Router();
const User = require('../controllers/userController');
const checkAuth = require('../middlewares/checkAuth');
const checkRole = require('../middlewares/checkRole');

router.post('/create-user', User.createUser);
router.get('/get-rep', checkAuth, checkRole('User'), User.getReport);

module.exports = router;
