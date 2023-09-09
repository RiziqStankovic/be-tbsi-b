const router = require('express').Router();

/* Import routes */
const User = require('./userRoutes');
const Branch = require('./branchRoutes');
const Employee = require('./employeeRoutes');
const Role = require('./roleRoutes');

router.use('/user', User);
router.use('/branch', Branch);
router.use('/employee', Employee);
router.use('/role', Role);

module.exports = router;
