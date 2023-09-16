const router = require('express').Router();
const FAP = require('../controllers/fapController');
const checkAuth = require('../middlewares/checkAuth');

router.post('/create-fap', checkAuth, FAP.createFAP);
router.get('/get-faps', FAP.getFAPs);
router.get('/:id/show-fap', FAP.showFAP);
router.patch('/:id/update-fap', FAP.updateFAP);
router.delete('/:id/remove-fap', FAP.removeFAP);

module.exports = router;
