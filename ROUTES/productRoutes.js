const express = require('express');
const app = express.Router();

const mongoose = require('mongoose');
const Product = mongoose.model('Product');

app.post('/addProduct', async (req, res) => {
    // productName: product.productName,
    //     productPrice: product.productPrice,
    //         productDescription: product.productDescription,
    //             productImages: [
    //                 image
    //             ],
    //    productStock: product.productStock,


    const { productName, productPrice, productDescription, productImages, productStock } = req.body;

    const newProduct = new Product({
        productName,
        productPrice,
        productDescription,
        productImages,
        productStock
    });

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
    if(products){
        res.json({message: 'success', products}).status(200);
    }
    else{
        res.json({message: 'error'}).status(500);
    }
});

app.post('/getProductById', async (req, res) => {
    const { productId } = req.body;

    const product = await Product.findById(productId);

    if(product){
        res.json({message: 'success', product}).status(200);
    }
    else{
        res.json({message: 'error'}).status(500);
    }
});

app.post('/saveEditedProductById', async (req, res) => {
    const { productId, productName, productPrice, productDescription, productImages, productStock } = req.body;

    const product = await Product.findById(productId);

    product.productName = productName;
    product.productPrice = productPrice;
    product.productDescription = productDescription;
    product.productImages = productImages;
    product.productStock = productStock;

    product.save().then(product => {
        res.json({ message: "success", product }).status(200);
    })
        .catch(err => {
            res.json({ error: "Error in adding product" }).status(500);
            console.log(err);
        });
});

app.post('/getSomeProducts' , async (req, res) => {
    const {limit} = req.body;

    const products = await Product.find().limit(limit);

    if(products){
        res.json({message: 'success', products}).status(200);
    }
    else{
        res.json({message: 'error'}).status(500);
    }
});

module.exports = app;