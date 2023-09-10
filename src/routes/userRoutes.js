const router = require('express').Router();
const User = require('../controllers/userController');

router.post('/create-user', User.createUser);
router.post('/login', User.authenticateUser);
router.get('/get-users', User.getUsers);
router.get('/:id/show-user', User.showUser);
router.patch('/:id/update-user', User.updateUser);
router.delete('/:id/remove-user', User.removeUser);

module.exports = router;
