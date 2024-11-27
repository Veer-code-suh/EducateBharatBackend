const express = require('express');
const app = express();
require('dotenv').config();
const path = require("path");


const port = process.env.PORT || 4000;

// SCHEMAS
require('./MODELS/UserSchema');
require('./MODELS/AdminSchema');
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
require('./MODELS/ExtrasSchema');

require('./MODELS/PurchasesSchema');
// 

const routes = require('./routes');
const userRoutes = require('./ROUTES/userRoutes');
const courseRoutes = require('./ROUTES/courseRoutes');
const chapterRoutes = require('./ROUTES/chapterRoutes');
// const mediaRoutes = require('./ROUTES/mediaRoutes');
const quizRoutes = require('./ROUTES/quizRoutes');
const productRoutes = require('./ROUTES/productRoutes');
const bannerRoutes = require('./ROUTES/bannerRoutes');
const extrasRoutes = require('./ROUTES/extrasRoutes');

const adminRoutes = require('./ROUTES/adminRoutes');

const { uploadFile } = require("./ROUTES/s3");

// const multer = require('multer');
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
app.use(extrasRoutes)


app.use(adminRoutes)
// app.use("/api/v1/media", mediaRoutes);
app.use("/public", express.static(path.join(__dirname, "public")));
// app.use(subjectRoutes)





app.get('/', (req, res) => res.send('Hello World!'));

app.post('/sendotp', async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000);
    const apiKey = process.env.FAST2SMS_API_KEY
    let url = `https://www.fast2sms.com/dev/bulkV2?authorization=KEHL1KxvTIz332qCcF9EpaGNlLB1fkfk0rtE2idhjDYJGKb5rJPGLbzBFYo7&route=otp&variables_values=${otp}&flash=0&numbers=${phone}`

    // console.log(url)

    fetch(url, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            res.status(200).json({ data, otp })
        })
        .catch(error => console.error(error));

});






app.listen(port, () => console.log(`Express app running on port ${port}!`));