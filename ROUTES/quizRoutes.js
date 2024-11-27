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
const adminTokenHandler = require('../Middleware/AdminVerificationMiddleware');

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// add quiz to chapter
app.post('/createQuizForChapter', async (req, res) => {
    //chapterId, quizName
    const { chapterId, chapterQuizName } = req.body;
    const chapter = await Chapter.findById(chapterId);

    const newChapterQuiz = new ChapterQuiz({
        chapterQuizName,
        chapterId
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
    const { subjectId, subjectQuizName } = req.body;
    const subject = await Subject.findById(subjectId);

    const newSubjectQuiz = new SubjectQuiz({
        subjectQuizName,
        subjectId,
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
app.post('/createQuizForCourse', adminTokenHandler, async (req, res) => {
    // same as above
    const { courseId, courseQuizName } = req.body;
    const course = await Course.findById(courseId);

    const newCourseQuiz = new CourseQuiz({
        courseQuizName,
        courseId
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
    const { questionName, questionType, quizType, quizId, questionOptions, questionAnswer, questionOrder,questionMarks, questionNegativeMarks, questionSubject, questionPdf } = req.body;
    // console.log(req.body);
    // return res.status(200).json({ message: "success", quiz:{} });
    // console.log({ questionName, questionType, quizType, quizId, questionOptions, questionAnswer, questionMarks, questionNegativeMarks, questionSubject, questionPdf })
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
            questionOrder
        });

        const savedQuestion = await newQuestion.save();


        // Now, add the saved question's ID to the respective quiz's question array
        if (quizType === "chapter") {
            const quiz = await ChapterQuiz.findById(quizId);
            if (!quiz) return res.status(404).json({ error: "Chapter quiz not found" });

            quiz.chapterQuizQNA.push(savedQuestion._id);
            await quiz.save();
            return res.status(200).json({ message: "success", quiz });
        }
        else if (quizType === "subject") {
            const quiz = await SubjectQuiz.findById(quizId);
            if (!quiz) return res.status(404).json({ error: "Subject quiz not found" });

            quiz.subjectQuizQNA.push(savedQuestion._id);
            await quiz.save();
            return res.status(200).json({ message: "success", quiz });
        }
        else if (quizType === "course") {
            const quiz = await CourseQuiz.findById(quizId);
            if (!quiz) return res.status(404).json({ error: "Full course quiz not found" });

            quiz.courseQuizQNA.push(savedQuestion._id);
            await quiz.save();
            return res.status(200).json({ message: "success", quiz });
        }
        else {
            return res.status(400).json({ error: "Invalid quiz type" });
        }
    } catch (error) {
        console.error("Error in adding question to quiz:", error);
        return res.status(500).json({ error: "Error in adding question to quiz" });
    }
});


app.post('/updateQuestionPdf', async (req, res) => {
    const { questionId , questionPdf } = req.body; // Extract the new PDF URL from the request body

    if (!questionPdf) {
        return res.status(400).json({ error: "questionPdf is required" });
    }

    try {
        // Find the question by ID and update the questionPdf field
        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            { questionPdf },
            { new: true } // Return the updated document
        );

        if (!updatedQuestion) {
            return res.status(404).json({ error: "Question not found" });
        }

        return res.status(200).json({ message: "success", question: updatedQuestion });
    } catch (error) {
        console.error("Error updating question:", error);
        return res.status(500).json({ error: "An error occurred while updating the question" });
    }
});

app.post('/updateQuestion', async (req, res) => {
    const {question} = req.body; // Get the fields to be updated from the request body

    try {
        // Find the question by ID and update it with the provided fields
        const updatedQuestion = await Question.findByIdAndUpdate(
            question._id,
            question,
            { new: true, runValidators: true } // Return updated document and run validation
        );

        if (!updatedQuestion) {
            return res.status(404).json({ error: "Question not found" });
        }

        return res.status(200).json({ message: "success", question: updatedQuestion });
    } catch (error) {
        console.error("Error updating question:", error);
        return res.status(500).json({ error: "An error occurred while updating the question" });
    }
});


app.post('/getQuizData', async (req, res) => {
    try {
        const { quizId, quizType } = req.body;

        // Validate the inputs
        if (!quizId || !quizType) {
            return res.status(400).json({ message: "Invalid input. quizId and quizType are required." });
        }

        let quizModified;

        // Fetch data based on quizType
        if (quizType === "chapter") {
            let quiz = await ChapterQuiz.findById(quizId).populate({
                path: 'chapterQuizQNA',
                select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields if required
            })
            if (!quiz) return res.status(404).json({ message: "Chapter Quiz not found." });
            quizModified = {
                ...quiz.toObject(), // Convert to plain JS object
                parentId: quiz.chapterId,
                quizImage: quiz.chapterQuizImage,
                quizName: quiz.chapterQuizName,
                quizQNA: quiz.chapterQuizQNA,
            };
        } else if (quizType === "subject") {
            let quiz = await SubjectQuiz.findById(quizId).populate({
                path: 'subjectQuizQNA',
                select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields if required
            })
            if (!quiz) return res.status(404).json({ message: "Subject Quiz not found." });
            quizModified = {
                ...quiz.toObject(), // Convert to plain JS object
                parentId: quiz.subjectId,
                quizImage: quiz.subjectQuizImage,
                quizName: quiz.subjectQuizName,
                quizQNA: quiz.subjectQuizQNA,
            };
        } else if (quizType === "course") {
            let quiz = await CourseQuiz.findById(quizId).populate({
                path: 'courseQuizQNA',
                select: '-__v -createdAt -updatedAt', // Exclude unnecessary fields if required
            })
            if (!quiz) return res.status(404).json({ message: "Course Quiz not found." });
            quizModified = {
                ...quiz.toObject(), // Convert to plain JS object
                parentId: quiz.courseId,
                quizImage: quiz.courseQuizImage,
                quizName: quiz.courseQuizName,
                quizQNA: quiz.courseQuizQNA,
            };
        } else {
            return res.status(400).json({ message: "Invalid quizType provided." });
        }

        // Respond with the quiz data
        return res.status(200).json({ message: "success", quiz: quizModified });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: "An error occurred.", error: error.message });
    }
});
app.post('/updateQuizById', async (req, res) => {
    try {
        const { quiz } = req.body;

        // Validate the inputs
        if (!quiz || !quiz._id || !quiz.quizType) {
            return res.status(400).json({ message: "Invalid input. Quiz data is required." });
        }

        let updatedQuiz;

        // Find and update quiz based on quizType
        if (quiz.quizType === "chapter") {
            updatedQuiz = await ChapterQuiz.findByIdAndUpdate(quiz._id, quiz, { new: true });
            if (!updatedQuiz) return res.status(404).json({ message: "Chapter Quiz not found." });
        } else if (quiz.quizType === "subject") {
            updatedQuiz = await SubjectQuiz.findByIdAndUpdate(quiz._id, quiz, { new: true });
            if (!updatedQuiz) return res.status(404).json({ message: "Subject Quiz not found." });
        } else if (quiz.quizType === "course") {
            updatedQuiz = await CourseQuiz.findByIdAndUpdate(quiz._id, quiz, { new: true });
            if (!updatedQuiz) return res.status(404).json({ message: "Course Quiz not found." });
        } else {
            return res.status(400).json({ message: "Invalid quizType provided." });
        }
        console.log(updatedQuiz)
        // Return the updated quiz data
        return res.status(200).json({ message: "success"});
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: "An error occurred.", error: error.message });
    }
});

app.post('/getQuestionData', async (req, res) => {
    try {
        const { questionId } = req.body;

        // Validate input
        if (!questionId) {
            return res.status(400).json({ message: "Invalid input. questionId is required." });
        }

        // Fetch the question from the database
        const question = await Question.findById(questionId);

        // If the question is not found, return an error response
        if (!question) {
            return res.status(404).json({ message: "Question not found." });
        }

        // Return the question data
        return res.status(200).json({
            message: "success",
            question,
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: "An error occurred.", error: error.message });
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
        } else if (quizType === "course") {
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


app.post('/getQuizQuestionsData', async (req, res) => {
    const { quizId, quizType } = req.body;

    try {
        let quizQuestions;
        let populateField;

        if (quizType === "chapter") {
            populateField = "chapterQuizQNA";
            quizQuestions = await ChapterQuiz.findById(quizId).select(populateField).populate(populateField);
        } else if (quizType === "subject") {
            populateField = "subjectQuizQNA";
            quizQuestions = await SubjectQuiz.findById(quizId).select(populateField).populate(populateField);
        } else if (quizType === "course") {
            populateField = "courseQuizQNA";
            quizQuestions = await CourseQuiz.findById(quizId).select(populateField).populate(populateField);
        } else {
            return res.status(400).json({ error: "Invalid quiz type" });
        }

        if (!quizQuestions) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        res.status(200).json({ message: "success", quizQuestions });
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
        } else if (quizType === "course") {
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

        res.status(200).json({ message: "success" });
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

    const { quizId, quizType, score, total, createdAt, userAnswers } = req.body;
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decoded;


    //  find user
    User.findById(_id).then(user => {
        user.testScores.push({ quizId, quizType, score, total, createdAt, userAnswers });
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

    else if (quizType == "course") {
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
    else if (quizType == "course") {
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