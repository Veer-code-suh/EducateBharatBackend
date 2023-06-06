const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const Subject = mongoose.model('Subject');
const Chapter = mongoose.model('Chapter');

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

app.post('/addCourse', async (req, res) => {
    // later add authentication

    const { coursePrice, courseName, courseDescription, courseImage } = req.body;

    // let updatedSubjects = [];
    // for (const subjectName of courseSubjects) {
    //     const newSubject = new Subject({
    //         subjectName
    //     });

    //     const savedSubject = await newSubject.save();
    //     updatedSubjects.push({ subjectName: savedSubject.subjectName, _id: savedSubject._id });
    // }

    const newCourse = new Course({
        coursePrice,
        // courseSubjects: updatedSubjects,
        courseName,
        courseDescription,
        courseImage,
    });

    newCourse.save().then(course => {
        res.json({ message: "Course added successfully", course }).status(200);
    }).catch(err => {
        res.json({ error: "Error in adding course" }).status(500);
        console.log(err);
    });


});
app.get('/allCourses', async (req, res) => {
    const courses = await Course.find();
    res.json({ courses }).status(200);
});
app.post('/coursebycourseid', async (req, res) => {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    res.json({ course, message: 'success' }).status(200);
});
app.post('/saveEditedCourseById', async (req, res) => {
    const { _id, courseName, coursePrice, courseDescription, courseImage } = req.body;
    const course = await Course.findById(_id);

    course.courseName = courseName;
    course.coursePrice = coursePrice;
    course.courseDescription = courseDescription;
    course.courseImage = courseImage;

    course.save().then(course => {
        res.json({ message: "success", course }).status(200);
    }
    ).catch(err => {
        res.json({ error: "Error in editing course" }).status(500);
        console.log(err);
    }
    );

});

// add subject to course
app.post('/addSubjectToCourse', async (req, res) => {
    const { subjectName, courseId } = req.body;

    const course = await Course.findById(courseId);

    const newSubject = new Subject({
        subjectName
    });

    const savedSubject = await newSubject.save();

    course.courseSubjects.push({ subjectName: savedSubject.subjectName, _id: savedSubject._id });

    course.save().then(course => {
        res.json({ message: "success", course }).status(200);
    }).catch(err => {
        res.json({ error: "Error in adding subject to course" }).status(500);
        console.log(err);
    });

});

// delete subject from course
app.post('/deleteSubjectFromCourse', async (req, res) => {
    // subjectId, courseId
    const { subjectId, courseId } = req.body;

    const course = await Course.findById(courseId);

    const updatedSubjects = course.courseSubjects.filter(subject => subject._id != subjectId);

    course.courseSubjects = updatedSubjects;

    course.save().then(course => {
        res.json({ message: "success", course }).status(200);
    }
    ).catch(err => {
        res.json({ error: "Error in deleting subject from course" }).status(500);
        console.log(err);
    }
    );
});


// chapter to subject
app.post('/addChapterToSubject', async (req, res) => {
    // chapterName, subjectId
    const { chapterName, subjectId } = req.body;
    const subject = await Subject.findById(subjectId);

    const newChapter = new Chapter({
        chapterName,
        subjectId,
    });

    const savedChapter = await newChapter.save();

    subject.subjectChapters.push({ chapterName: savedChapter.chapterName, _id: savedChapter._id });

    subject.save().then(subject => {
        res.json({ message: "success", subject }).status(200);
    }).catch(err => {
        res.json({ error: "Error in adding chapter to subject" }).status(500);
        console.log(err);
    });

});

app.post('/getChaptersBySubjectId', async (req, res) => {
    const { subjectId } = req.body;
    console.log(subjectId);
    const subject = await Subject.findById(subjectId);
    res.json({ subject , message: "success"}).status(200);

});


// delete chapter from subject
app.post('/deleteChapterFromSubject', async (req, res) => {
    const { chapterId, subjectId } = req.body;

    const subject = await Subject.findById(subjectId);
    const updatedChapters = subject.subjectChapters.filter(chapter => chapter._id != chapterId);
    
    subject.subjectChapters = updatedChapters;

    subject.save().then(subject => {
        res.json({ message: "success", subject }).status(200);
    }).catch(err => {
        res.json({ error: "Error in deleting chapter from subject" }).status(500);
        console.log(err);
    });

});



// upload intro video to course
app.post('/uploadIntroVideoToCourse', async (req, res) => {
    const { courseId, introVideo } = req.body;

    const course = await Course.findById(courseId);

    course.introVideo = introVideo;

    course.save().then(course => {
        res.json({ message: "success", course }).status(200);
    }).catch(err => {
        res.json({ error: "Error in uploading intro video to course" }).status(500);
        console.log(err);
    });

});


module.exports = app;
