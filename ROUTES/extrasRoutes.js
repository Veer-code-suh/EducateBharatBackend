const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');
const Extras = mongoose.model('Extras');

// Add or Update Extras
app.post('/addOrUpdateExtras', async (req, res) => {
    const { allCoursesDiscount, allProductsDiscount, deliveryCharges } = req.body;

    try {
        // Check if extras document already exists, if not, create it
        let extras = await Extras.findOne();
        if (extras) {
            // If it exists, update the existing document
            extras.allCoursesDiscount = allCoursesDiscount || extras.allCoursesDiscount;
            extras.allProductsDiscount = allProductsDiscount || extras.allProductsDiscount;
            extras.deliveryCharges = deliveryCharges || extras.deliveryCharges;

            await extras.save();
            return res.json({ message: "Extras updated successfully", extras });
        } else {
            // If no document exists, create a new one
            extras = new Extras({
                allCoursesDiscount,
                allProductsDiscount,
                deliveryCharges,
            });

            await extras.save();
            return res.json({ message: "Extras added successfully", extras });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error occurred while adding/updating extras" });
    }
});

// Get Extras
app.get('/getExtras', async (req, res) => {
    try {
        const extras = await Extras.findOne();
        if (!extras) {
            return res.status(404).json({ error: "Extras not found" });
        }
        res.json({ extras });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error occurred while fetching extras" });
    }
});

// Delete Extras
app.post('/deleteExtras', async (req, res) => {
    try {
        await Extras.deleteOne();
        res.json({ message: "Extras deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error occurred while deleting extras" });
    }
});

module.exports = app;
