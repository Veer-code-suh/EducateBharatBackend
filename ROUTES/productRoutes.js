const express = require('express');
const app = express.Router();

const mongoose = require('mongoose');
const Product = mongoose.model('Product');

app.post('/addProduct', async (req, res) => {


    const { product } = req.body;

    const newProduct = new Product(product);

    newProduct.save().then(product => {
        res.json({ message: "success", product }).status(200);
    })
        .catch(err => {
            res.json({ error: "Error in adding product" }).status(500);
            console.log(err);
        });
});

app.get('/getallProducts', async (req, res) => {
    const products = await Product.find();
    if (products) {
        res.json({ message: 'success', products }).status(200);
    }
    else {
        res.json({ message: 'error' }).status(500);
    }
});

app.post('/getProductById', async (req, res) => {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (product) {
        res.json({ message: 'success', product }).status(200);
    }
    else {
        res.json({ message: 'error' }).status(500);
    }
});

app.post('/saveEditedProductById', async (req, res) => {
    const { product } = req.body;

    const updatesProduct = await Product.findByIdAndUpdate(product._id, product);



    updatesProduct.save().then(product => {
        res.json({ message: "success", product }).status(200);
    })
        .catch(err => {
            res.json({ error: "Error in adding product" }).status(500);
            console.log(err);
        });
});

app.post('/getSomeProducts', async (req, res) => {
    const { limit } = req.body;

    const products = await Product.find({
        productStock: { $ne: 'OUTOFSTOCK' } // Exclude 'OUTOFSTOCK'
    }).limit(limit);

    if (products) {
        res.json({ message: 'success', products }).status(200);
    }
    else {
        res.json({ message: 'error' }).status(500);
    }
});


// Search Store Products API
app.post('/searchStoreProducts', async (req, res) => {
    const { query } = req.body;
    try {
        const products = await Product.find({
            productName: { $regex: query, $options: 'i' },
            productStock: { $ne: 'OUTOFSTOCK' } // Exclude 'OUTOFSTOCK'
        }).limit(3);

        res.status(200).json({ products });
    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({ error: "Failed to search products" });
    }
});

module.exports = app;