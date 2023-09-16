const router = require('express').Router();

/* Import routes */
const User = require('./userRoutes');
const Branch = require('./branchRoutes');
const Employee = require('./employeeRoutes');
const Role = require('./roleRoutes');
const Admin = require('./adminRoutes');
const Joki = require('./jokiRoutes');
const FAP = require('./fapRoutes');

/* Use routes */

/* Router nasabah / client */
router.use('/user', User);

/* Router cabang dan alamat cabang */
router.use('/branch', Branch);

/* Router karyawan internal */
router.use('/employee', Employee);

/* Router role */
router.use('/role', Role);

/* Router role admin */
router.use('/admin', Admin);

/* Router role joki */
router.use('/joki', Joki);

/* Router form analyst pinjol */
router.use('/fap', FAP);

module.exports = router;
