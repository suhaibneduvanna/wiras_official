var express = require('express');
var router = express.Router();
var studentHelper = require("../helpers/student-helpers")
var fs =require('fs')
let admin =true
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/dashboard',{admin});

});

router.get('/search-student',(req,res)=>{
  res.render('admin/search-student',{admin})
})


router.post('/search-student',(req,res)=>{
  let query=req.body
  let searchData={};
  if(query.AdmissionNo!=""){
    searchData.AdmissionNo=query.AdmissionNo
  }
  if(query.Name!=""){
    searchData.Name=query.Name
  }
  if(query.Class!=""){
    searchData.Class=query.Class
  }
  if(query.Mobile!=""){
    searchData.Mobile=query.Mobile
  }
  if(query.BloodGroup!=""){
    searchData.BloodGroup=query.BloodGroup
  }
  studentHelper.getStudents(searchData).then(async(students)=>{
    res.render("admin/search-result",{students,admin})

 })
 

})

router.get('/add-student',(req,res)=>{
  res.render('admin/add-student',{admin})
})

router.post('/add-student',(req,res)=>{
  
  studentHelper.addStudent(req.body,(id)=>{
    let image = req.files.StudentImage
    console.log(image)
    image[0].mv('./public/images/students-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.json({status:true})
      } else {
        res.json({status:false})
      }
    })
   
  })

})

router.get('/edit-student',async(req,res)=>{
  let studentId = req.query.id
  let student=await studentHelper.getStudentDetails(studentId)
  res.render('admin/edit-student',{student,admin})
})

router.post('/edit-student/',(req,res)=>{
  console.log(req.body.studentId)
  studentHelper.updateStudent(req.body.studentId,req.body).then(()=>{
    if(req.files){
    let image = req.files.StudentImage
    image[0].mv('./public/images/students-images/'+req.body.studentId+'.jpg',(err,done)=>{
      if(!err){
        res.json({status:true})
      } else{
        res.json({status:false})
      }
    }) 
    
  } else
  {
    res.json({status:true})
  }

  })
})

router.get('/delete-student/',async(req,res)=>{
  let studentId = req.query.id
  
  await studentHelper.deleteStudent(studentId).then((response)=>{
    
    fs.unlink('./public/images/students-images/'+req.query.id+'.jpg',()=>{})
    
  })
  
  studentHelper.deleteStudentMark(studentId).then(()=>{
    res.redirect('/admin/search-student')
  })

})



router.get('/add-marks/',(req,res)=>{
  let studentId=req.query.id
  res.render('admin/add-marks',{studentId,admin})
})

router.post('/add-marks/',(req,res)=>{
  let studentId = req.body.studentId
  delete req.body.studentId
  let marks = req.body;
  let subject = req.body.Subject
  let arrayofMarks=[]
  if(Array.isArray(subject) ){
    
    for (i = 0; i <subject.length; i++) {
  
      let sub = marks.Subject[i]
      let mark = marks.Mark[i]
      let object= {
        Semester:marks.Semester,
        Subject:sub,
        Mark:mark
      }
  
      arrayofMarks.push(object)
      
    }
    
    studentHelper.addMarks(arrayofMarks,studentId).then((data)=>{
      res.json({status:true})
    })
  
    
  
  } else{
  arrayofMarks.push(marks)
  studentHelper.addMarks(arrayofMarks,studentId).then((data)=>{
    res.json({status:true})
  })
  
  }
})


router.get('/view-student/',async(req,res)=>{
  let studentId = req.query.id
  let student=await studentHelper.getStudentDetails(studentId)

  let marks=await studentHelper.getMarks(studentId)
  res.render('admin/view-student',{student,marks,admin})
})

router.get('/view-marks/',async(req,res)=>{

  let studentId= req.query.id;
  let marks=await studentHelper.getMarks(studentId)
    res.json(marks)
  

})


router.post('/edit-marks/',async(req,res)=>{
  let marks = req.body;
  let studentId = req.body.studentId
  let subject = req.body.Subject
  console.log(req.body)
  if(Array.isArray(subject) ){
    let arrayofMarks=[]
    for (i = 0; i <subject.length; i++) {
  
      let sub = marks.Subject[i]
      let mark = marks.Mark[i]
      let object= {
        Semester:marks.Semester,
        Subject:sub,
        Mark:mark
  
      }
  
      arrayofMarks.push(object)
      
    }
     studentHelper.editMarks(studentId,arrayofMarks).then(()=>{
      res.json({status:true})
     })
     
    
  
  } else{

   studentHelper.editMarks(studentId,marks).then(()=>{
    res.json({status:true})
   })
   
  
  }

})

router.post('/delete-mark/',(req,res)=>{
  console.log(req.body)
  let studentId = req.body.studentId;
  studentHelper.deleteMark(studentId,req.body).then(()=>{
    res.json({status:true})
  })
  
})



module.exports = router;
