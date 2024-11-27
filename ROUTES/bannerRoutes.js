const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');
const Banner = mongoose.model('Banner');

app.post('/addbanner', async (req, res) => {
    const {imgUrl, redirectUrl} = req.body;
    console.log(imgUrl, redirectUrl);
   
    let banner = new Banner({
        imgUrl,
        redirectUrl
    });

    banner.save().then(async () => {
        let allBanners = await Banner.find({});
        res.json({message: "Banner Added Successfully" , banners: allBanners});
    })
    .catch((err) => {
        console.log(err);
        res.json({message: "Error Occured"});
    });
});
// get all banners
app.get('/getbanners', async (req, res) => {
    const banners = await Banner.find({});
    res.json({banners: banners});
});
// delete banner
app.post('/deletebanner', async (req, res) => {
    const {id} = req.body;
    const banner = await Banner.findByIdAndDelete(id);
    const banners = await Banner.find({});
    res.json({message: "Banner Deleted Successfully" , banners: banners});
});
module.exports = app;