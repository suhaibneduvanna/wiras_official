var express = require('express');
var router = express.Router();
var studentHelper = require("../helpers/student-helpers")
var fs =require('fs')

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  res.render('user/index',{index:true})
});

router.get('/about',(req,res)=>{
  let user= req.session.user
  res.render('user/about',{user})
})

router.get('/courses-boys',(req,res)=>{
  let user= req.session.user
  res.render('user/courses-boys',{user})
})

router.get('/courses-girls',(req,res)=>{
  let user= req.session.user
  res.render('user/courses-girls',{user})
})

router.get('/events',(req,res)=>{
  res.render('user/events')
})

router.get('/faculties',(req,res)=>{
  res.render('user/faculties')
})

router.get('/contact',(req,res)=>{
  res.render('user/contact')
})

router.get('/login',(req,res)=>{
  if(req.session.user){
    let student = req.session.user
    res.render('admin/view-student',{student})
  }
  else{
    res.render('user/login',{login:true})
  }
  
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.post('/login',(req,res)=>{
  
  studentHelper.loginFunction(req.body).then((response)=>{
    
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      let student = response.user
      res.render('admin/view-student',{student})
    } else{
      req.session.loginError="Invalid username or password"
      
    }
  })
})



module.exports = router;
