const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const Subject = mongoose.model('Subject');
const Chapter = mongoose.model('Chapter');
const ChapterQuiz = mongoose.model('ChapterQuiz');
const SubjectQuiz = mongoose.model('SubjectQuiz');
const CourseQuiz = mongoose.model('CourseQuiz');
const QuestionSchema = mongoose.model('QuestionSchema');
const User = mongoose.model('User');

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// add quiz to chapter
app.post('/createQuizForChapter', async (req, res) => {
    //chapterId, quizName
    const { chapterId, chapterQuizName , access} = req.body;
    const chapter = await Chapter.findById(chapterId);

    const newChapterQuiz = new ChapterQuiz({
        chapterQuizName,
        chapterId,
        access
    });

    const savedChapterQuiz = await newChapterQuiz.save();

    chapter.chapterQuizzes.push({ chapterQuizName: savedChapterQuiz.chapterQuizName, _id: savedChapterQuiz._id , access: savedChapterQuiz.access});

    chapter.save().then(chapter => {
        res.json({ message: "success", chapter }).status(200);
    }).catch(err => {
        res.json({ error: "Error in adding quiz to chapter" }).status(500);
        console.log(err);
    });
});
app.post('/createQuizForSubject', async (req, res) => {
    // same as above
    const { subjectId, subjectQuizName , access} = req.body;
    const subject = await Subject.findById(subjectId);

    const newSubjectQuiz = new SubjectQuiz({
        subjectQuizName,
        subjectId,
        access
    });

    const savedSubjectQuiz = await newSubjectQuiz.save();

    // console.log(subject);

    subject.subjectQuizzes.push({ subjectQuizName: savedSubjectQuiz.subjectQuizName, _id: savedSubjectQuiz._id , access: savedSubjectQuiz.access});

    subject.save().then(subject => {
        res.json({ message: "success", subject }).status(200);
    }
    ).catch(err => {
        res.json({ error: "Error in adding quiz to subject" }).status(500);
        console.log(err);
    }
    );




});
app.post('/createQuizForCourse', async (req, res) => {
    // same as above
    const { courseId, courseQuizName, access } = req.body;
    const course = await Course.findById(courseId);

    const newCourseQuiz = new CourseQuiz({
        courseQuizName,
        courseId,
        access
    });

    const savedCourseQuiz = await newCourseQuiz.save();

    course.courseQuizzes.push({ courseQuizName: savedCourseQuiz.courseQuizName, _id: savedCourseQuiz._id, access: savedCourseQuiz.access });

    course.save().then(course => {
        res.json({ message: "success", course }).status(200);
    }
    ).catch(err => {
        res.json({ error: "Error in adding quiz to course" }).status(500);
        console.log(err);
    }
    );

});


// add question to quiz
// {
// question , type , options , answer , marks , negativeMarks
// }
app.post('/addQuestionToQuiz', async (req, res) => {

    const { questionName, questionType, quizType, quizId, questionOptions, questionAnswer, questionMarks, questionNegativeMarks, questionSubject } = req.body;

    if (quizType == "chapter") {
        const quiz = await ChapterQuiz.findById(quizId);

        quiz.chapterQuizQNA.push(req.body);

        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }).catch(err => {
            res.json({ error: "Error in adding question to quiz" }).status(500);
            console.log(err);
        });
    }
    else if (quizType == "subject") {
        // same as above
        const quiz = await SubjectQuiz.findById(quizId);


        quiz.subjectQuizQNA.push(req.body);

        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }
        ).catch(err => {
            res.json({ error: "Error in adding question to quiz" }).status(500);
            console.log(err);
        }
        );

    }
    else if (quizType == "fullquiz") {
        // same as above
        const quiz = await CourseQuiz.findById(quizId);

        quiz.courseQuizQNA.push(req.body);

        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }
        ).catch(err => {
            res.json({ error: "Error in adding question to quiz" }).status(500);
            console.log(err);
        }
        );

    }
});
app.post('/getQuizData', async (req, res) => {
    const { quizId, quizType } = req.body;

    if (quizType == "chapter") {
        const quiz = await ChapterQuiz.findById(quizId);
        res.json({ message: "success", quiz }).status(200);
    }
    else if (quizType == "subject") {
        const quiz = await SubjectQuiz.findById(quizId);
        res.json({ message: "success", quiz }).status(200);
    }
    else if (quizType == "fullquiz") {
        const quiz = await CourseQuiz.findById(quizId);
        console.log(quiz);
        res.json({ message: "success", quiz }).status(200);
    }

});
app.post('/deleteQuestion', async (req, res) => {
    const { quizId, quizType, questionName } = req.body;

    if (quizType == "chapter") {
        const quiz = await ChapterQuiz.findById(quizId);
        quiz.chapterQuizQNA = quiz.chapterQuizQNA.filter((question) => {
            return question.questionName != questionName;
        }
        );
        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }).catch(err => {
            res.json({ error: "Error in deleting question from quiz" }).status(500);
            console.log(err);
        });
    }
    else if (quizType == "subject") {
        const quiz = await SubjectQuiz.findById(quizId);
        quiz.subjectQuizQNA = quiz.subjectQuizQNA.filter((question) => {
            return question.questionName != questionName;
        }
        );
        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }
        ).catch(err => {
            res.json({ error: "Error in deleting question from quiz" }).status(500);
            console.log(err);
        }
        );

    }
    else if (quizType == "fullquiz") {
        const quiz = await CourseQuiz.findById(quizId);
        quiz.courseQuizQNA = quiz.courseQuizQNA.filter((question) => {
            return question.questionName != questionName;
        }
        );
        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }
        ).catch(err => {
            res.json({ error: "Error in deleting question from quiz" }).status(500);
            console.log(err);
        }
        );
    }

});

app.post('/submitQuiz', async (req, res) => {
    // quizId: thisQuiz._id,
    // quizType: thisQuiz.quizType,
    // score: score,
    // total: thisQuiz.courseQuizQNA.length,
    // quizData : thisQuiz

    const { quizId, quizType, score, total, quizData } = req.body;
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decoded;


    //  find user
    User.findById(_id).then(user => {
        user.testScores.push({ quizId, quizType, score, total, quizData });
        user.save().then(user => {
            res.json({ message: "success"}).status(200);
        }).catch(err => {
            res.json({ error: "Error in finding user" }).status(500);
            console.log(err);
        });
    }).catch(err => {
        res.json({ error: "Error in finding user" }).status(500);
        console.log(err);
    });



    });



    module.exports = app;