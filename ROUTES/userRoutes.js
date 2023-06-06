const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Order = mongoose.model('Order');
const Purchase = mongoose.model('Purchase');
const Course = mongoose.model('Course');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

app.post('/signup', async (req, res) => {
    const { name,
        email,
        password,
        age,
        phone } = req.body;
    if (!email || !password || !name || !age || !phone) {
        return res.status(422).json({ error: "Please add all the fields" })
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).json({ error: "User already exists with that email" })
            }
            // bcrypt.hash(password, 12)


            const user = new User({
                name,
                email,
                password,
                age,
                phone
            })
            user.save()
                .then(user => {
                    res.json({ message: "Account Created Successfully" }).status(200);
                })
                .catch(err => {
                    res.json({ error: "Error in creating account" }).status(500);
                    console.log(err);
                })

        })

});

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
        return res.status(422).json({ error: "Please add email and password" })
    }
    User.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "Invalid email or password" })
            }
            // console.log(savedUser + "  " + password);
            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    // console.log(doMatch);
                    if (doMatch) {
                        // res.json({message: "Successfully signed in"})
                        const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET)
                        savedUser.password = undefined;
                        res.json({ message: "Token Generated Successfully", token: token, user: savedUser })
                    }
                    else {
                        return res.status(422).json({ error: "Invalid phone number or password" })
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        })
});

app.get('/getuserdatafromtoken', async (req, res) => {
    // console.log('inside user token route ',process.env.JWT_SECRET)
    const token = req.headers.authorization.split(" ")[1];
    if (token == "null") {
        console.log("invalid token")
        res.json({
            error: "Invalid Token"
        })
    }
    else {
        const token = req.headers.authorization.split(" ")[1];
        const data = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('data from token ', data)
        User.findOne({ _id: data._id })
            .then(user => {
                user.password = undefined;
                // console.log('user data from token ', user)
                res.status(200).json({
                    userdata: user
                });
            })
            .catch(err => {
                console.log('err getting user data from token ', err)
            })
    }
});
app.post('/resetpassword', (req, res) => {
    const { newpassword } = req.body;

    if (!newpassword) {
        return res.status(422).json({ error: "Please add all the fields" });
    }
    else {
        const token = req.headers.authorization.split(" ")[1];
        const data = jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = data;
        User.findOne({ _id: _id })
            .then(async savedUser => {
                if (savedUser) {
                    // console.log(savedUser);
                    savedUser.password = newpassword;
                    savedUser.save()
                        .then(user => {
                            res.json({ message: "Password Changed Successfully" });
                        })
                        .catch(err => {
                            // console.log(err);
                            return res.status(422).json({ error: "Server Error" });

                        })
                }
                else {
                    return res.status(422).json({ error: "Invalid Credentials" });
                }
            })
    }
})
app.get('/latestusers', (req, res) => {
    // return max 10 users in latest date order
    User.find().sort({ createdAt: -1 }).limit(10)
        .then(users => {
            users.forEach(user => {
                user.password = undefined;
                if (!user.profilePic) {
                    user.profilePic = "noimage";
                }
            });
            res.json({ users: users, message: "success" });
        }
        )
        .catch(err => {
            console.log(err);
            return res.status(422).json({ error: "Server Error" });
        }
        )
});
// BUY COURSE
app.post('/buyCourse', (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const { courseId, amount, currency } = req.body;
    if (!courseId || !token) {
        return res.status(422).json({ error: "Please add all the fields" });
    }
    else {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = data;
        User.findOne({ _id: _id })
            .then(async savedUser => {
                if (savedUser) {
                    // console.log(savedUser);
                    savedUser.coursePurchased.push(courseId);
                    savedUser.save()
                        .then(user => {
                            const purchase = new Purchase({

                                item: {
                                    type: 'course',
                                    courseId: courseId
                                },
                                userId: savedUser._id,
                                amount: amount,
                                currency: currency,
                            });

                            purchase.save()
                                .then(purchase => {
                                    res.json({ message: "Course Bought Successfully" });
                                })
                                .catch(err => {
                                    return res.status(422).json({ error: "Server Error" });
                                })
                        })
                        .catch(err => {
                            // console.log(err);
                            return res.status(422).json({ error: "Server Error" });

                        })
                }
                else {
                    return res.status(422).json({ error: "Invalid Credentials" });
                }
            })
    }

});

// add to cart
app.post('/addToCart', (req, res) => {
    console.log("inside add to cart");
    const token = req.headers.authorization.split(" ")[1];

    const { fullproduct,
        price,
        quantity } = req.body;

    if (!fullproduct || !price || !quantity) {
        return res.status(422).json({ error: "Retry" });
    }

    const data = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = data;
    User.findOne({ _id: _id })
        .then(async savedUser => {
            if (savedUser) {
                // console.log(savedUser);
                let cartitemId = uuidv4();
                savedUser.userCart.push({
                    fullproduct,
                    price,
                    quantity,
                    cartitemId
                });
                savedUser.save()
                    .then(user => {
                        res.json({ message: "Added to cart Successfully", userCart: user.userCart });
                    })
                    .catch(err => {
                        // console.log(err);
                        return res.status(422).json({ error: "Server Error" });

                    })
            }
            else {
                return res.status(422).json({ error: "Invalid Credentials" });
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(422).json({ error: "Server Error" });
        })


});
app.get('/getCart', (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    if (token == "null") {
        res.json({
            error: "Invalid Token"
        });
    }
    else {
        const token = req.headers.authorization.split(" ")[1];
        const data = jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = data;
        User.findOne({ _id: _id })
            .then(user => {
                res.status(200).json({
                    userCart: user.userCart
                });
            })
            .catch(err => {
                console.log('err getting user data from token ', err)
            })
    }
});
app.delete('/deleteCart', (req, res) => {

    const token = req.headers.authorization.split(" ")[1];
    const { cartitemId } = req.body;

    if (!cartitemId) {
        res.json({
            error: "Retry"
        });
    }
    else {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = data;
        User.findOne({ _id: _id })
            .then(user => {
                user.userCart = user.userCart.filter(cart => cart.cartitemId !== cartitemId);
                user.save()
                    .then(user => {
                        res.json({ message: "Deleted Successfully", userCart: user.userCart });
                    })
                    .catch(err => {
                        console.log(err);
                        return res.status(422).json({ error: "Server Error" });
                    })
            })
            .catch(err => {
                console.log('err getting user data from token ', err)
            })
    }
});


app.post('/buyProducts', (req, res) => {
    const { cartdata,
        cartTotal,
        paymentMethod,
        paymentId,
        shipping,
        tax, address } = req.body;

    if (!cartdata || !cartTotal || !paymentMethod || !shipping || !tax || !address || !paymentId) {
        res.json({
            error: "Retry"
        });
    }


    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = data;




    User.findOne({ _id: _id })
        .then(user => {
            const order = new Order({
                orderItems: cartdata,
                shippingAddress: address,
                paymentMethod: paymentMethod,
                paymentId: paymentId,
                carttotal: cartTotal,
                userId: _id,
                shippingCost: shipping,
                tax: tax,
                isPaid: paymentMethod !== "COD" ? true : false,
                paidAt: paymentMethod !== "COD" ? Date.now() : null,
            });

            order.save()
                .then(order => {
                    let orderid = order._id;
                    user.orders.push({
                        orderid: orderid,
                        createdAt: order.createdAt,
                    });
                    // user.userCart = [];
                    user.save()
                        .then(user => {
                            res.json({ message: "Order Placed Successfully", userCart: user.userCart, order });
                        })
                })
        })
        .catch(err => {
            console.log('err getting user data from token ', err)
        })



})

app.get('/getUserAddress', (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = data;

    User.findOne({ _id: _id })
        .then(user => {
            res.status(200).json({
                address: user.address
            });
        })
});

app.post('/addUserAddress', (req, res) => {
    console.log("inside add user address");
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = data;

    const { address } = req.body;

    if (!address) {
        res.json({
            error: "Retry"

        });
    }

    User.findOne({ _id: _id })
        .then(user => {
            user.address = address;
            user.save()
                .then(user => {
                    res.status(200).json({
                        address: user.address
                    });
                })
                .catch(err => {
                    console.log(err);
                    return res.status(422).json({ error: "Server Error" });
                })
        })
        .catch(err => {
            console.log('err getting user data from token ', err)
            res.json({
                error: "Server Error"
            });
        });
});

app.get('/getOrders', (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = data;

    User.findOne({ _id: _id })
        .then(user => {
            res.status(200).json({
                orders: user.orders
            });
        }).catch(err => {
            console.log('err getting user data from token ', err)
            res.json({
                error: "Server Error"
            });
        });
});

app.post('/getOrderById', (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = data;
    const { orderId } = req.body;

    if (!orderId) {
        res.json({
            error: "Retry"
        });
    }

    User.findOne({ _id: _id })
        .then(user => {
            //  check if order id is present in user orders
            if (user.orders.filter(order => order.orderid === orderId).length === 0) {
                Order.findOne({ _id: orderId })
                    .then(order => {
                        res.status(200).json({
                            order: order
                        });
                    })
                    .catch(err => {
                        console.log('err getting order data from token ', err)
                        res.json({
                            error: "Server Error"
                        });
                    });
            }
        })
        .catch(err => {
            console.log('err getting user data from token ', err)
            res.json({
                error: "Server Error"
            });
        });
});

app.post('/cancelOrder', (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = data;

    const { orderId } = req.body;

    User.findOne({ _id: _id })
        .then(user => {
            // check if order id is present in user orders
            if (user.orders.includes(orderId)) {
                Order.findOne({ _id: orderId })
                    .then(order => {
                        // check if order is not delivered
                        if (order.isDelivered === false) {
                            order.isCancelled = true;
                            order.save()
                                .then(order => {
                                    res.status(200).json({
                                        order: order,
                                        message: "Order Cancelled Successfully"
                                    });
                                })
                                .catch(err => {
                                    console.log('err getting order data from token ', err)
                                    res.json({
                                        error: "Server Error"
                                    });
                                });
                        }
                        if (order.isDelivered === true) {
                            res.json({
                                error: "Order Already Delivered"
                            });
                        }
                    })
                    .catch(err => {
                        console.log('err getting order data from token ', err)
                        res.json({
                            error: "Server Error"
                        });
                    }
                    );
            }
            else {
                res.json({
                    error: "Order Not Found"
                });
            }
        })
        .catch(err => {
            res.json({
                error: "User Not Found"
            });
        });
})


app.get('/getMyCourses', (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = data;

    User.findOne({ _id: _id })
        .then(async user => {
            let courses = [];
            for (const courseId in user.coursePurchased) {
                if (user.coursePurchased.hasOwnProperty(courseId)) {
                    try {
                        const course = await Course.findOne({ _id: user.coursePurchased[courseId] });
                        courses.push(course);
                    } catch (err) {
                        console.log('err getting course data from token ', err);
                        res.json({
                            error: "Server Error"
                        });
                    }
                }
            }
            // console.log(courses);

            res.status(200).json({
                courses: courses
            });

        })
        .catch(err => {
            res.json({
                error: "User Not Found"
            });
        })
})



// get 10 oldest undelivered orders and not cancelled of all users
app.get('/getUndeliveredOrdersAdmin', (req, res) => {
    Order.find({ isDelivered: 'Not Delivered', isCancelled: false })
        .sort({ createdAt: 1 })
        .limit(10)
        .then(orders => {
            res.status(200).json({
                orders: orders
            });
        })
        .catch(err => {
            console.log('err getting order data from token ', err)
            res.json({
                error: "Server Error"
            });
        });
});



app.post('/getOrderByIdAdmin', (req, res) => {

    const { orderId } = req.body;

    if (!orderId) {
        res.json({
            error: "Retry"
        });
    }
    Order.findOne({ _id: orderId })
        .then(order => {
            res.status(200).json({
                order: order
            });
        })
        .catch(err => {
            console.log('err getting order data from token ', err)
            res.json({
                error: "Server Error"
            });
        });
});

app.post('/updateOrderByIdAdmin', (req, res) => {
    const { orderId ,order} = req.body;

    if (!order) {
        res.json({
            error: "Retry"
        });
    }

    Order.findOne({ _id: orderId })
        .then(order => {
            // save order
           order = Object.assign(order, req.body.order);
              order.save()
                .then(order => {
                    res.status(200).json({
                        order: order,
                        message: "Order Updated Successfully"
                    });
                })

        })
        .catch(err => {
            console.log('err getting order data from token ', err)
            res.json({
                error: "Server Error"
            });
        });
});

module.exports = app;


