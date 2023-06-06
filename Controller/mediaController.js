const Media = require("../MODELS/MediaSchema");

exports.getAll = async (req, res) => {
  try {
    const media = await Media.find();

    res.json(media);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
// Backendurl/public/videos/file_name.mp4
exports.create = async (req, res) => {
  const { name } = req.body;
  let filePath = "";

  console.log(req.files);


  // for single file
  if (req.files.file[0]) {
    filePath = "/" + req.files.file[0].path;
  }

  try {
    const createdMedia = await Media.create({
      name,
      filePath,
    });

    res.json({ message: "Media created successfully", createdMedia });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};