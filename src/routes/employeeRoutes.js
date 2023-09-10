const router = require('express').Router();
const Employee = require('../controllers/employeeControlller');

/* Middlewares */
const upload = require('../middlewares/upload');

router.post(
    '/create-employee',
    upload.single('photo'),
    Employee.createEmployee
);
router.get('/get-employees', Employee.getEmployees);
router.get('/:id/show-employee', Employee.showEmploye);
router.patch('/:id/update-employee', Employee.updateEmployee);
router.delete('/:id/remove-employee', Employee.removeEmployee);

module.exports = router;
