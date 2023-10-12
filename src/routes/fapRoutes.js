const router = require('express').Router();
const FAP = require('../controllers/fapController');
const checkAuth = require('../middlewares/checkAuth');
const checkRole = require('../middlewares/checkRole');

router.post('/create-fap', checkAuth, FAP.createFAP);
router.get('/generate-skpp', checkAuth, checkRole('User'), FAP.generateSkpp);
router.get(
    '/:id/get-report',
    checkAuth,
    checkRole(['Joki', 'Admin']),
    FAP.getReportFap
);

module.exports = router;
