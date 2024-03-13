const express = require("express");
const router = express.Router();
const userController = require('../controllers/users');


//User Section
// router.get("/register", (req,res)=>{
//     res.render("register");
// });

router.get("/login", (req,res)=>{
    res.render("login");
});
router.get("/cpass", (req,res)=>{
    res.render("cpass");
});

router.get("/logout",userController.logout, (req,res)=>{
    res.render('login', {
        message: 'You have successfully logged outtt!'
    });
});

router.get("/",(req,res)=>{
    res.render('index');
});

router.get("/index",userController.isLoggedIn,(req,res)=>{
    const userEmail = req.user.email;
    res.render('index', {message:userEmail});
});

router.get("/career",userController.career, (req,res)=>{
    res.render("career");
});

router.get("/apply", (req,res)=>{
    res.render("apply");
});

router.get("/user-project", userController.isLoggedIn, (req, res) => {    
    if (req.user) {
        console.log("User login found");
        res.render("user-project", { user: req.user });
    } else {
        console.log("User login not found");
        res.redirect("/login");
    }
});

router.get("/project",userController.isLoggedIn, userController.project, (req,res)=>{
    res.render('login', {
        message: 'You have successfully logged outtt!'
    });
});

router.get("/user-task",userController.isLoggedIn, userController.userShowTask, (req,res)=>{
    res.render('login', {
        message: 'You have successfully logged outtt!'
    });
});














//Admin Section
router.get("/adminlogin",  (req,res)=>{
    res.render("adminlogin");
});

router.get("/adminlogout",userController.adminlogout, (req,res)=>{
    res.render('adminlogin', {
        message: 'You have successfully logged outtt!'
    });
});

router.get("/home", userController.isAdminLoggedIn,userController.admindash,(req,res)=>{
    if(req.email){
        res.render("home",{email: req.email});
    }else{
        res.redirect("/adminlogin");
    }
});

router.get("/add-skills", userController.isAdminLoggedIn,userController.showskills,(req,res)=>{
    if(req.email){
        res.render("add-skills",{skills: allSkills});
    }else{
        res.redirect("/adminlogin");
    }
});
router.get("/add-jobs", userController.isAdminLoggedIn,userController.loadskills,(req,res)=>{
    if(req.email){
        res.render("add-jobs",{email: req.email});
    }else{
        res.redirect("/adminlogin");
    }
});
router.get("/jobs", userController.isAdminLoggedIn,userController.loadjobs,(req,res)=>{
    if(req.email){
        res.render("jobs",{email: req.email});
    }else{
        res.redirect("/adminlogin");
    }
});

router.get("/applicant", userController.isAdminLoggedIn,(req,res)=>{
    if(req.email){
        res.render("applicant",{email: req.email});
    }else{
        res.redirect("/adminlogin");
    }
});

router.get("/add-project", userController.isAdminLoggedIn,userController.loadjobs2,(req,res)=>{
    if(req.email){
        res.render("add-project",{email: req.email});
    }else{
        res.redirect("/adminlogin");
    }
});

router.get("/add-project2", userController.isAdminLoggedIn,userController.loademp,(req,res)=>{
    if(req.email){
        res.render("add-project2",{email: req.email});
    }else{
        res.redirect("/adminlogin");
    }
});

router.get("/showprojects", userController.isAdminLoggedIn,userController.showprojects,(req,res)=>{
    if(req.email){
        res.render("showprojects",{email: req.email});
    }else{
        res.redirect("/adminlogin");
    }
});

router.get("/add-task", userController.isAdminLoggedIn,userController.addtask,(req,res)=>{
    if(req.email){
        res.render("add-task",{email: req.email});
    }else{
        res.redirect("/adminlogin");
    }
});
router.get("/task", userController.isAdminLoggedIn,userController.showtask,(req,res)=>{
    if(req.email){
        res.render("task",{email: req.email});
    }else{
        res.redirect("/adminlogin");
    }
});
router.get("/task-progress", userController.isAdminLoggedIn,userController.showprogress,(req,res)=>{
    if(req.email){
        res.render("task-progress",{email: req.email});
    }else{
        res.redirect("/adminlogin");
    }
});



module.exports = router;