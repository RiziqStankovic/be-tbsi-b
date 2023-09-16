const router = require('express').Router();
const Joki = require('../controllers/jokiController');
const checkAuth = require('../middlewares/checkAuth');
const checkRole = require('../middlewares/checkRole');

router.get(
    '/joki-monit-work',
    checkAuth,
    checkRole('Joki'),
    Joki.jokiMonitoringWork
);
router.patch('/:id/joki-appr', checkAuth, checkRole('Joki'), Joki.jokiApproval);

module.exports = router;
