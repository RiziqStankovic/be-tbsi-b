const router = require('express').Router();
const Admin = require('../controllers/adminController');

/* middleware */
const checkAuth = require('../middlewares/checkAuth');
const checkRole = require('../middlewares/checkRole');

router.get('/monit-fap', checkAuth, checkRole('Admin'), Admin.monitorFAP);
router.post(
    '/:id/admin-appr',
    checkAuth,
    checkRole('Admin'),
    Admin.adminApproval
);
router.patch(
    '/:id/adm-respond-fap',
    checkAuth,
    checkRole('Admin'),
    Admin.respondFAP
);

module.exports = router;
