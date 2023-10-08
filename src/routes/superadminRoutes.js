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
    '/:id/leave-req-appr',
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

module.exports = router;
