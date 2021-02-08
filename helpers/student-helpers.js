var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID
const { response } = require('express')
module.exports = {



    addStudent: (student, callback) => {
        db.get().collection(collection.STUDENTS_COLLECTIONS).insertOne(student).then((data) => {
            callback(data.ops[0]._id)

        })
    },

    getStudents: (query) => {
        return new Promise(async (resolve, reject) => {
            let students = await db.get().collection(collection.STUDENTS_COLLECTIONS).find(query).toArray()

            resolve(students)
        })

    },

    deleteStudent: (studentId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENTS_COLLECTIONS).removeOne({ _id: objectId(studentId) }).then((response) => {
                resolve(response)
            })
        })
    },

    deleteStudentMark :(studentId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.MARKS_COLLECTIONS).removeOne({ studentId: studentId}).then((response) => {
                resolve(response)
            })
        })
    },

    getStudentDetails: (studentId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.STUDENTS_COLLECTIONS).findOne({ _id: objectId(studentId) }).then((student) => {
                resolve(student)
            })
        })
    },

    updateStudent: (studentId, studentDetails) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.STUDENTS_COLLECTIONS).updateOne({ _id: objectId(studentId) }, {

                $set: {
                    AdmissionNo: studentDetails.AdmissionNo,
                    Name: studentDetails.Name,
                    Dob: studentDetails.Dob,
                    Address: studentDetails.Address,
                    Mobile: studentDetails.Mobile,
                    Email: studentDetails.Email,
                    BloodGroup: studentDetails.BloodGroup,
                    State: studentDetails.State,
                    Country: studentDetails.Country,
                    Pincode: studentDetails.Pincode,
                    Class: studentDetails.Class,
                    Gname: studentDetails.Gname,
                    Goccupation: studentDetails.Goccupation,
                    Gmobile: studentDetails.Gmobile,
                    Gemail: studentDetails.Gemail

                }
            }).then((response) => {
                resolve()
            })
        })
    },

    addMarks: (marks, studentId) => {

        
        let marksObject = {
            studentId: studentId,
            Marks: marks
        }
        return new Promise(async (resolve, reject) => {

            let studentMark = await db.get().collection(collection.MARKS_COLLECTIONS).findOne({ studentId: studentId })
            
           
            if (studentMark) {
                let markArray = studentMark.Marks
                var filtered = [];

                for (var arr in markArray) {
                    for (var filter in marks) {
                        if (markArray[arr].Semester == marks[filter].Semester && markArray[arr].Subject == marks[filter].Subject) {
                            filtered.push(markArray[arr].Mark);
                        }
                    }
                }
                console.log(filtered);
                console.log("Student exist")
                db.get().collection(collection.MARKS_COLLECTIONS).updateOne({ studentId: studentId }, {

                    $push: { Marks: { $each: marks } }

                }).then(() => {
                    resolve()
                })

            } else {
                console.log("student not exist")
                db.get().collection(collection.MARKS_COLLECTIONS).insertOne(marksObject).then(() => {
                    resolve()
                })
            }
        })
    },




    getMarks: (studentId) => {
        return new Promise(async (resolve, reject) => {
            let marks = await db.get().collection(collection.MARKS_COLLECTIONS).aggregate([
                {
                    $match: { studentId }
                },
                {
                    $unwind: '$Marks'

                },

                {
                    $project: {
                        Semester: '$Marks.Semester',
                        Subject: '$Marks.Subject',
                        Marks: '$Marks.Mark'

                    }
                }

            ]).toArray()

            resolve(marks)

        })

    },

    editMarks: (studentId, marks) => {
        return new Promise(async (resolve, reject) => {
            if (Array.isArray(marks)) {
                console.log("not object")
                
                for (i = 0; i < marks.length; i++) {
                    await db.get().collection(collection.MARKS_COLLECTIONS).findOneAndUpdate(
                        { studentId: studentId },
                        { $set: { "Marks.$[elem].Mark": marks[i].Mark } },
                        { arrayFilters: [{ "elem.Semester": marks[i].Semester, "elem.Subject": marks[i].Subject }] }
                    )
                }

                resolve();
            } else {
                console.log("object")
                await db.get().collection(collection.MARKS_COLLECTIONS).findOneAndUpdate(
                    { studentId: studentId },
                    { $set: { "Marks.$[elem].Mark": marks.Mark } },
                    { arrayFilters: [{ "elem.Semester": marks.Semester, "elem.Subject": marks.Subject }] }
                )

                resolve();
            }

           

        })

    },

    deleteMark: (studentId,query) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.MARKS_COLLECTIONS).update(
                {studentId: studentId},
                {
                    $pull: { Marks: { Semester: query.Semester , Subject: query.Subject, Mark: query.Mark} }
                },
                {
                    multi:true
                }
            ).then((response) => {
                resolve(response)
            })
        })
    },



    loginFunction: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.STUDENTS_COLLECTIONS).findOne({ Email: userData.Email })
            if (user.AdmissionNo == userData.Password) {
                console.log("Login Success")
                response.user = user
                response.status = true
                resolve(response)
            } else {
                console.log("login failed")
                resolve({ status: false })
            }

        })
    },





}
