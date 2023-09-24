const router = require('express').Router();
const Admin = require('../controllers/adminController');

/* middleware */
const checkAuth = require('../middlewares/checkAuth');
const checkBranch = require('../middlewares/checkBranch');
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
router.get('/:id/det-fap', checkAuth, checkRole('Admin'), Admin.detailFAP);
router.get('/adm-info', checkAuth, checkRole('Admin'), Admin.getAdminInfo);

module.exports = router;
