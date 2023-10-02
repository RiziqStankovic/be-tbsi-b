const router = require('express').Router();
const Joki = require('../controllers/jokiController');
const checkAuth = require('../middlewares/checkAuth');
const checkRole = require('../middlewares/checkRole');

router.get(
    '/joki-monit-fap',
    checkAuth,
    checkRole('Joki'),
    Joki.jokiMonitoringWork
);
router.patch('/:id/joki-appr', checkAuth, checkRole('Joki'), Joki.jokiApproval);
router.post('/:id/send-fap-rep', checkAuth, checkRole('Joki'), Joki.sendReport);
router.get('/:id/joki-info', checkAuth, checkRole('Joki'), Joki.getJokiInfo);

module.exports = router;
