const router = require('express').Router();
const Branch = require('../controllers/branchController');

router.post('/create-branch', Branch.createBranch);
router.get('/get-branches', Branch.getBranches);
router.get('/:id/show-branch', Branch.showBranch);
router.patch('/:id/update-branch', Branch.updateBranch);
router.delete('/:id/remove-branch', Branch.removeBranch);

module.exports = router;
