const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const Subject = mongoose.model('Subject');
const Chapter = mongoose.model('Chapter');
const ChapterQuiz = mongoose.model('ChapterQuiz');
const SubjectQuiz = mongoose.model('SubjectQuiz');
const CourseQuiz = mongoose.model('CourseQuiz');
const Question = mongoose.model('Question');
const User = mongoose.model('User');

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// add quiz to chapter
app.post('/createQuizForChapter', async (req, res) => {
    //chapterId, quizName
    const { chapterId, chapterQuizName, access } = req.body;
    const chapter = await Chapter.findById(chapterId);

    const newChapterQuiz = new ChapterQuiz({
        chapterQuizName,
        chapterId,
        access
    });

    const savedChapterQuiz = await newChapterQuiz.save();

    chapter.chapterQuizzes.push({ chapterQuizName: savedChapterQuiz.chapterQuizName, _id: savedChapterQuiz._id, access: savedChapterQuiz.access });

    chapter.save().then(chapter => {
        res.json({ message: "success", chapter }).status(200);
    }).catch(err => {
        res.json({ error: "Error in adding quiz to chapter" }).status(500);
        console.log(err);
    });
});
app.post('/createQuizForSubject', async (req, res) => {
    // same as above
    const { subjectId, subjectQuizName, access } = req.body;
    const subject = await Subject.findById(subjectId);

    const newSubjectQuiz = new SubjectQuiz({
        subjectQuizName,
        subjectId,
        access
    });

    const savedSubjectQuiz = await newSubjectQuiz.save();

    // console.log(subject);

    subject.subjectQuizzes.push({ subjectQuizName: savedSubjectQuiz.subjectQuizName, _id: savedSubjectQuiz._id, access: savedSubjectQuiz.access });

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
app.post('/addQuestionToQuiz', async (req, res) => {
    const { questionName, questionType, quizType, quizId, questionOptions, questionAnswer, questionMarks, questionNegativeMarks, questionSubject, questionPdf } = req.body;

    try {
        // First, create and save the question to the questions collection
        const newQuestion = new Question({
            questionName,
            questionType,
            quizType,
            quizId,
            questionOptions,
            questionAnswer,
            questionMarks,
            questionNegativeMarks,
            questionSubject,
            questionPdf,
        });

        const savedQuestion = await newQuestion.save();

        // Now, add the saved question's ID to the respective quiz's question array
        if (quizType === "chapter") {
            const quiz = await ChapterQuiz.findById(quizId);
            if (!quiz) return res.status(404).json({ error: "Chapter quiz not found" });

            quiz.chapterQuizQNA.push(savedQuestion._id);
            await quiz.save();
            return res.status(200).json({ message: "Question added to chapter quiz", quiz });
        }
        else if (quizType === "subject") {
            const quiz = await SubjectQuiz.findById(quizId);
            if (!quiz) return res.status(404).json({ error: "Subject quiz not found" });

            quiz.subjectQuizQNA.push(savedQuestion._id);
            await quiz.save();
            return res.status(200).json({ message: "Question added to subject quiz", quiz });
        }
        else if (quizType === "fullquiz") {
            const quiz = await CourseQuiz.findById(quizId);
            if (!quiz) return res.status(404).json({ error: "Full course quiz not found" });

            quiz.courseQuizQNA.push(savedQuestion._id);
            await quiz.save();
            return res.status(200).json({ message: "Question added to full course quiz", quiz });
        }
        else {
            return res.status(400).json({ error: "Invalid quiz type" });
        }
    } catch (error) {
        console.error("Error in adding question to quiz:", error);
        return res.status(500).json({ error: "Error in adding question to quiz" });
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

app.post('/getQuizStartData', async (req, res) => {
    const { quizId, quizType } = req.body;

    try {
        let quiz;
        if (quizType === "chapter") {
            // Exclude chapterQuizQNA field from the result
            quiz = await ChapterQuiz.findById(quizId).select('-chapterQuizQNA');
        } else if (quizType === "subject") {
            // Exclude subjectQuizQNA field from the result
            quiz = await SubjectQuiz.findById(quizId).select('-subjectQuizQNA');
        } else if (quizType === "fullquiz") {
            // Exclude courseQuizQNA field from the result
            quiz = await CourseQuiz.findById(quizId).select('-courseQuizQNA');
        } else {
            return res.status(400).json({ error: "Invalid quiz type" });
        }

        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        res.status(200).json({ message: "success", quiz });
    } catch (error) {
        console.error("Error fetching quiz:", error);
        res.status(500).json({ error: "Error fetching quiz data" });
    }
});

app.post('/deleteQuestion', async (req, res) => {
    const { quizId, quizType, questionId } = req.body;

    try {
        // Step 1: Remove the question from the questions collection
        await Question.findByIdAndDelete(questionId);

        let quiz;
        let quizField;

        // Step 2: Find the quiz based on quizType and remove the questionId reference
        if (quizType === "chapter") {
            quiz = await ChapterQuiz.findById(quizId);
            quizField = "chapterQuizQNA";
        } else if (quizType === "subject") {
            quiz = await SubjectQuiz.findById(quizId);
            quizField = "subjectQuizQNA";
        } else if (quizType === "fullquiz") {
            quiz = await CourseQuiz.findById(quizId);
            quizField = "courseQuizQNA";
        } else {
            return res.status(400).json({ error: "Invalid quiz type" });
        }

        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        // Step 3: Filter out the question ID from the quiz's question array
        quiz[quizField] = quiz[quizField].filter(
            (qId) => qId.toString() !== questionId
        );

        // Save the updated quiz
        await quiz.save();

        res.status(200).json({ message: "Question deleted successfully", quiz });
    } catch (err) {
        console.error("Error deleting question:", err);
        res.status(500).json({ error: "Error in deleting question from quiz" });
    }
});


app.post('/submitQuiz', async (req, res) => {
    // quizId: thisQuiz._id,
    // quizType: thisQuiz.quizType,
    // score: score,
    // total: thisQuiz.courseQuizQNA.length,
    // quizData : thisQuiz

    const { quizId, quizType, score, total, quizData, createdAt } = req.body;
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decoded;


    //  find user
    User.findById(_id).then(user => {
        user.testScores.push({ quizId, quizType, score, total, quizData, createdAt });
        user.save().then(user => {
            res.json({ message: "success" }).status(200);
        }).catch(err => {
            res.json({ error: "Error in finding user" }).status(500);
            console.log(err);
        });
    }).catch(err => {
        res.json({ error: "Error in finding user" }).status(500);
        console.log(err);
    });



});




app.post('/addAfterSubmissionPdfToQuiz', async (req, res) => {
    const { quizId, quizType, pdfLink } = req.body;

    if (quizType == "chapter") {
        const quiz = await ChapterQuiz.findById(quizId);
        quiz.afterSubmissionPdf = pdfLink;

        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }).catch(err => {
            res.json({ error: "Error in adding pdf to quiz" }).status(500);
            console.log(err);
        });
    }

    else if (quizType == "subject") {
        const quiz = await SubjectQuiz.findById(quizId);
        quiz.afterSubmissionPdf = pdfLink;

        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }
        ).catch(err => {
            res.json({ error: "Error in adding pdf to quiz" }).status(500);
            console.log(err);
        }
        );
    }

    else if (quizType == "fullquiz") {
        const quiz = await CourseQuiz.findById(quizId);
        quiz.afterSubmissionPdf = pdfLink;

        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }
        ).catch(err => {
            res.json({ error: "Error in adding pdf to quiz" }).status(500);
            console.log(err);
        }
        );
    }
});

app.post('/updateTimeLimit', async (req, res) => {
    const { quizId, quizType, timeLimit } = req.body;

    if (quizType == "chapter") {
        const quiz = await ChapterQuiz.findById(quizId);
        quiz.timeLimit = timeLimit;
        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }).catch(err => {
            res.json({ error: "Error in adding timeLimit to quiz" }).status(500);
            console.log(err);
        });
    }
    else if (quizType == "subject") {
        const quiz = await SubjectQuiz.findById(quizId);
        quiz.timeLimit = timeLimit;

        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }
        ).catch(err => {
            res.json({ error: "Error in adding timeLimit to quiz" }).status(500);
            console.log(err);
        }
        );
    }
    else if (quizType == "fullquiz") {
        const quiz = await CourseQuiz.findById(quizId);
        quiz.timeLimit = timeLimit;

        quiz.save().then(quiz => {
            res.json({ message: "success", quiz }).status(200);
        }
        ).catch(err => {
            res.json({ error: "Error in adding timeLimit to quiz" }).status(500);
            console.log(err);
        }
        );
    }
})

module.exports = app;