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
router.get(
    '/get-dest-branches',
    checkAuth,
    checkRole('Admin'),
    checkBranch('Mampang'),
    Admin.getDestBranches
);
router.get('/adm-get-joki', checkAuth, checkRole('Admin'), Admin.getJoki);
router.patch(
    '/:id/upd-rep-stat',
    checkAuth,
    checkRole('Admin'),
    Admin.updateReportStatus
);
router.post('/create-joki', checkAuth, checkRole('Admin'), Admin.createJoki);

module.exports = router;
