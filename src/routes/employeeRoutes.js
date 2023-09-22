/* 
    Router untuk service employee secara keseluruhan, seperti pendataan, pengajuan cuti dll.
    Router ini bisa diakses oleh Employee dengan role Admin maupun Joki, atau Superadmin.
*/
const router = require('express').Router();
const Employee = require('../controllers/employeeControlller');

/* Middlewares */
const upload = require('../middlewares/upload');
const checkAuth = require('../middlewares/checkAuth');
const checkRole = require('../middlewares/checkRole');

router.post(
    '/create-employee',
    upload.single('photo'),
    Employee.createEmployee
);
router.post('/login', Employee.authenticateEmploye);
router.post(
    '/create-leave-req',
    checkAuth,
    checkRole(['Admin', 'Joki']),
    Employee.createLeaveReq
);
router.get(
    '/get-employees',
    checkAuth,
    checkRole('Superadmin'),
    Employee.getEmployees
);
router.get('/:id/show-employee', checkAuth, Employee.showEmploye);
router.patch(
    '/:id/update-employee',
    checkAuth,
    checkRole('Superadmin'),
    Employee.updateEmployee
);
router.delete(
    '/:id/remove-employee',
    checkAuth,
    checkRole('Superadmin'),
    Employee.removeEmployee
);

module.exports = router;
