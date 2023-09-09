const router = require('express').Router();
const Role = require('../controllers/roleController');

router.post('/create-role', Role.createRole);
router.get('/get-roles', Role.getRoles);
router.get('/:id/show-role', Role.showRole);
router.patch('/:id/update-role', Role.updateRole);
router.delete('/:id/remove-role', Role.removeRole);

module.exports = router;
