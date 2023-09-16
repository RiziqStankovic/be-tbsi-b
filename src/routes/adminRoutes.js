const router = require('express').Router();
const Admin = require('../controllers/adminController');

/* middleware */
const checkAuth = require('../middlewares/checkAuth');
const checkRole = require('../middlewares/checkRole');

router.get(
    '/monit-pend-reg',
    checkAuth,
    checkRole('Admin'),
    Admin.monitoringPendingRegistration
);
router.post(
    '/:id/admin-appr',
    checkAuth,
    checkRole('Admin'),
    Admin.adminApproval
);

module.exports = router;
