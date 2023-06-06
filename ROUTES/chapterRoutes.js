const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const Subject = mongoose.model('Subject');
const Chapter = mongoose.model('Chapter');

const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


app.post('/getChapterById', async (req, res) => {
    const {chapterId} = req.body;
    const chapter = await Chapter.findById(chapterId);
    // console.log(chapter);
    res.json({chapter , message: "success"}).status(200);
});

// add video to chapter
app.post('/addVideoToChapter', async (req, res) => {
  const { chapterId, videoUrl , videoName, access} = req.body;
    const chapter = await Chapter.findById(chapterId);
    chapter.chapterVideos.push({
        videoUrl,
        videoName,
        access
    });
    chapter.save().then(chapter => {
        res.json({ message: "success", chapter }).status(200);
    }).catch(err => {
        res.json({ error: "Error in adding video" }).status(500);
        console.log(err);
    });
});

// delete video from chapter
app.post('/deleteVideoFromChapter', async (req, res) => {
    const { chapterId, videoUrl } = req.body;
        const chapter = await Chapter.findById(chapterId);
        let updatedVideos = chapter.chapterVideos.filter((video) => {
            return video.videoUrl !== videoUrl;
        });
 
        chapter.chapterVideos = updatedVideos;

        chapter.save().then(chapter => {
            res.json({ message: "success", chapter }).status(200);
        }).catch(err => {
            res.json({ error: "Error in deleting video" }).status(500);
            console.log(err);
        });
});

// add notes to chapter
app.post('/addNotesToChapter', async (req, res) => {
    const { chapterId, notesUrl , notesName , access} = req.body;
    const chapter = await Chapter.findById(chapterId);
    chapter.chapterNotes.push({
        notesUrl,
        notesName,
        access
    });

    console.log(chapter.chapterNotes);
    chapter.save().then(chapter => {
        res.json({ message: "success", chapter }).status(200);
    }).catch(err => {
        res.json({ error: "Error in adding notes" }).status(500);
        console.log(err);
    });
});

// delete notes from chapter
app.post('/deletenotesFromChapter', async (req, res) => {
    const { chapterId, notesUrl } = req.body;
        const chapter = await Chapter.findById(chapterId);
        let updatedNotes = chapter.chapterNotes.filter((notes) => {
            return notes.notesUrl !== notesUrl;
        });

        chapter.chapterNotes = updatedNotes;
       
        chapter.save().then(chapter => {
            res.json({ message: "success", chapter }).status(200);
        }).catch(err => {
            res.json({ error: "Error in deleting notes" }).status(500);
            console.log(err);
        });
});



app.post('/updateChapterById' , async (req , res) => {
    const { _id, chapterName, chapterDescription, chapterImage} = req.body;

    const chapter = await Chapter.findById(_id);

    chapter.chapterName = chapterName;
    chapter.chapterDescription = chapterDescription;
    chapter.chapterImage = chapterImage;

    chapter.save().then(chapter => {
        res.json({ message: "success", chapter }).status(200);
    }
    ).catch(err => {
        res.json({ error: "Error in updating chapter" }).status(500);
        console.log(err);
    }
    );
});

module.exports = app;