const router = require('express').Router();
const Superadmin = require('../controllers/superadminController');

/* Middlewares */
const checkAuth = require('../middlewares/checkAuth');
const checkRole = require('../middlewares/checkRole');

router.get(
    '/monit-leave-reqs',
    checkAuth,
    checkRole('Superadmin'),
    Superadmin.monitoringLeaveReq
);
router.patch(
    '/:id/leave-appr',
    checkAuth,
    checkRole('Superadmin'),
    Superadmin.leaveReqAppr
);
router.get(
    '/get-profile',
    checkAuth,
    checkRole('Superadmin'),
    Superadmin.getProfile
);
router.get(
    '/monit-usr',
    checkAuth,
    checkRole('Superadmin'),
    Superadmin.monitoringNasabah
);
router.get(
    '/:id/det-usr',
    checkAuth,
    checkRole('Superadmin'),
    Superadmin.getDetailNasabah
);
router.get(
    '/get-stats',
    checkAuth,
    checkRole('Superadmin'),
    Superadmin.getStatistics
);
router.get('/rep', Superadmin.getReportTesting);
router.get('/fap', Superadmin.getFap);

module.exports = router;
