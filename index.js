const express = require('express');
const app = express();
require('dotenv').config();
const path = require("path");


const port = process.env.PORT || 4000;

// SCHEMAS
require('./MODELS/UserSchema');
require('./MODELS/CourseSchema');
require('./MODELS/SubjectSchema');
require('./MODELS/ChapterSchema');
require('./MODELS/MediaSchema');
require('./MODELS/Quiz/ChapterQuizSchema');
require('./MODELS/Quiz/SubjectQuizSchema');
require('./MODELS/Quiz/CourseQuizSchema');
require('./MODELS/Quiz/QuestionSchema');
require('./MODELS/ProductSchema')
require('./MODELS/OrderSchema');
require('./MODELS/BannerSchema');

require('./MODELS/PurchasesSchema');
// 

const routes = require('./routes');
const userRoutes = require('./ROUTES/userRoutes');
const courseRoutes = require('./ROUTES/courseRoutes');
const chapterRoutes = require('./ROUTES/chapterRoutes');
const mediaRoutes = require('./ROUTES/mediaRoutes');
const quizRoutes = require('./ROUTES/quizRoutes');
const productRoutes = require('./ROUTES/productRoutes');
const bannerRoutes = require('./ROUTES/bannerRoutes');

// const subjectRoutes = require('./ROUTES/subjectRoutes');
const bodyParser = require('body-parser');
const cors = require('cors');
require('./db');



app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json());



// ROUTES
app.use(routes)
app.use(userRoutes)
app.use(courseRoutes)
app.use(chapterRoutes)
app.use(quizRoutes)
app.use(productRoutes)
app.use(bannerRoutes)
app.use("/api/v1/media", mediaRoutes);
app.use("/public", express.static(path.join(__dirname, "public")));
// app.use(subjectRoutes)



app.get('/', (req, res) => res.send('Hello World!'));
app.listen(port, () => console.log(`Express app running on port ${port}!`));