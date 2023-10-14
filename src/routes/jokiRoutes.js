const router = require('express').Router();
const Joki = require('../controllers/jokiController');
const checkAuth = require('../middlewares/checkAuth');
const checkRole = require('../middlewares/checkRole');
const upload = require('../middlewares/upload');

router.get(
    '/joki-monit-fap',
    checkAuth,
    checkRole('Joki'),
    Joki.jokiMonitoringWork
);
router.patch('/:id/joki-appr', checkAuth, checkRole('Joki'), Joki.jokiApproval);
router.post(
    '/send-fap-rep',
    checkAuth,
    checkRole('Joki'),
    upload.single('file'),
    Joki.sendReport
);
router.get('/get-joki-info', checkAuth, checkRole('Joki'), Joki.getJokiInfo);
router.get('/:id/det-fap', checkAuth, checkRole('Joki'), Joki.getDetailFap);
router.get(
    '/download-template',
    checkAuth,
    checkRole('Joki'),
    Joki.downloadTemplate
);

module.exports = router;
