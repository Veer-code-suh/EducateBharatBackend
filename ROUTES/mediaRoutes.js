const express = require("express");
const mediaController = require("../Controller/mediaController");
const multer = require("multer");
const fs = require("fs");
const path = require("path");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
    }

    if (!fs.existsSync("public/files")) {
      fs.mkdirSync("public/files");
    }

    cb(null, "public/files");
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    var ext = path.extname(file.originalname);

    // mp4, jpeg, png and pdf files are allowed

    if (ext !== ".mp4" && ext !== ".jpeg" && ext !== ".png" && ext !== ".pdf" && ext !== ".jpg") {
      return cb(new Error("Only mp4, jpeg, jpg ,png and pdf files are allowed"));
    }

    cb(null, true);
  },
});

const router = express.Router();

//get all media
router.get("/all", mediaController.getAll);

//post create new media
router.post(
  "/create",
  upload.fields([
    {
      name: "file",
      maxCount: 1,
    },
  ]),
  mediaController.create
);

module.exports = router;