const express = require("express");
const router = express.Router();
const userController = require('../controllers/users');

//User
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/cpass', userController.cpass);
router.post('/apply', userController.apply);
router.post('/userShowTask',userController.isLoggedIn, userController.userShowTask);
router.post('/updatelink',userController.isLoggedIn, userController.updatelink);
router.post('/updateTaskStatus',userController.isLoggedIn, userController.updateTaskStatus);







//Admin
router.post('/adminlogin', userController.adminlogin);
router.post('/addskills',userController.isAdminLoggedIn, userController.addskills);
router.post('/addjob',userController.isAdminLoggedIn, userController.addjob);
router.post('/showapplication',userController.isAdminLoggedIn, userController.showapplication);
router.post('/application',userController.isAdminLoggedIn, userController.application);
router.post('/loademp',userController.isAdminLoggedIn, userController.loademp);
router.post('/addproject',userController.isAdminLoggedIn, userController.addproject);
router.post('/showinfofortask',userController.isAdminLoggedIn, userController.showinfofortask);
router.post('/addtask',userController.isAdminLoggedIn, userController.addtask);
router.post('/showtask',userController.isAdminLoggedIn, userController.showtask);
router.post('/showprogress',userController.isAdminLoggedIn, userController.showprogress);
router.post('/addcomment',userController.isAdminLoggedIn, userController.addcomment);
router.post('/closetask',userController.isAdminLoggedIn, userController.closetask);











module.exports = router;