const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Order = mongoose.model('Order');
const Purchase = mongoose.model('Purchase');
const Course = mongoose.model('Course');
const ChapterQuiz = mongoose.model('ChapterQuiz');
const SubjectQuiz = mongoose.model('SubjectQuiz');
const CourseQuiz = mongoose.model('CourseQuiz');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const adminTokenHandler = require('../Middleware/AdminVerificationMiddleware');

app.post('/signup', async (req, res) => {
    const { name,
        email,
        password,
        age,
        phone } = req.body;
    if (!email || !password || !name || !age || !phone) {
        return res.status(422).json({ error: "Please add all the fields" })
    }
    User.findOne({ phone: phone })
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
app.post('/forgotpassword', async (req, res) => {

    const { phone, newpassword } = req.body;
    console.log('Forgot Password ', phone, newpassword);
    if (!phone || !newpassword) {
        res.json({ error: "Please add all the fields" }).status(422);
    }
    else {

        User.findOne({ phone: phone })
            .then(async savedUser => {
                if (savedUser) {
                    // console.log(savedUser);
                    savedUser.password = newpassword;
                    savedUser.save()
                        .then(user => {
                            console.log('Password Changed Successfully');
                            res.json({ message: "Password Changed Successfully" }).status(200);
                        })
                        .catch(err => {
                            console.log(err);
                            res.json({ error: "Server Error" }).status(500);
                        })
                }
                else {
                    res.json({ error: "Invalid Credentials" }).status(422);
                }
            })
            .catch(err => {
                console.log(err);
                res.json({ error: "Error in finding user" }).status(500);
            })
    }
});
app.post('/checkuser', async (req, res) => {
    console.log('signup api')

    const { phone } = req.body;

    User.findOne({ phone: phone })
        .then((savedUser) => {
            console.log(savedUser);
            if (savedUser) {


                return res.json({ message: "User already exists with that phone" }).status(200);
            }
            else {
                return res.json({ message: "User does not exists with that phone" }).status(200);
            }
        })
});

app.post('/signin', async (req, res) => {
    const { phone, password } = req.body;
    console.log(phone, password);
    if (!phone || !password) {
        return res.status(422).json({ error: "Please add phone and password" })
    }
    User.findOne({ phone: phone })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "Invalid phone or password" })
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
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || token === "null") {
        console.log("Invalid token");
        return res.status(401).json({ error: "Invalid Token" });
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user and exclude the 'quizzes' field from the response
        const user = await User.findOne({ _id: data._id }, { testScores: 0, password: 0 }).lean();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ userdata: user });
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/getuserquizzes', async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const { date } = req.query; // Get the date from query parameters
    if (!token || token === "null") {
        console.log("Invalid token");
        return res.status(401).json({ error: "Invalid Token" });
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: data._id }).lean();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch detailed quiz data
        let quizzes = await Promise.all(user.testScores.map(async (quiz) => {
            const { quizId, quizType } = quiz;

            // Fetch quiz data from /getQuizData API
            let quizName = null;
            try {

                if (quizType === "chapter") {
                    quizName = await ChapterQuiz.findById(quizId).select('chapterQuizName');
                    quizName = quizName.chapterQuizName;
                } else if (quizType === "subject") {
                    quizName = await SubjectQuiz.findById(quizId).select('subjectQuizName');
                    quizName = quizName.subjectQuizName;

                } else if (quizType === "course") {
                    quizName = await CourseQuiz.findById(quizId).select('courseQuizName');
                    quizName = quizName.courseQuizName;

                }

            } catch (err) {
                console.error(`Failed to fetch quiz data for quizId: ${quizId}, quizType: ${quizType}`, err.message);
            }

            return {
                ...quiz,
                quizName
            };
        }));

        // If a date is provided, filter quizzes by the date
        if (date) {
            quizzes = quizzes.filter(quiz => {
                const quizDate = new Date(quiz.createdAt).toISOString().split('T')[0]; // Get only the date part (YYYY-MM-DD)
                return quizDate === date;
            });
        }

        res.status(200).json({ quizzes });
    } catch (err) {
        console.error("Error fetching user quizzes:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.get('/getquizbyid', async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    const { quizId } = req.query; // Get quizId from query parameters

    console.log('getquizbyid ', quizId);
    if (!token || token === "null") {
        console.log("Invalid token");
        return res.status(401).json({ error: "Invalid Token" });
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        const user = await User.findOne({ _id: data._id }).lean(); // Find the user by ID with lean()

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find the quiz by quizId
        let quiz = user.testScores
            .filter(quiz => quiz.quizId === quizId)  // Filter by quizId
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];  // Sort by createdAt in descending order and pick the first item

        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        let quizData = null;
        try {
            if (quiz.quizType === "chapter") {
                quizData = await ChapterQuiz.findById(quizId).populate('chapterQuizQNA').lean(); // Use .lean()
                quizData = {
                    ...quizData,
                    quizQuestions: quizData.chapterQuizQNA,
                    chapterQuizQNA: null,
                    quizType: 'chapter',
                    quizName: quizData.chapterQuizName
                };
            } else if (quiz.quizType === "subject") {
                quizData = await SubjectQuiz.findById(quizId).populate('subjectQuizQNA').lean(); // Use .lean()
                quizData = {
                    ...quizData,
                    quizQuestions: quizData.subjectQuizQNA,
                    subjectQuizQNA: null,
                    quizType: 'subject',
                    quizName: quizData.subjectQuizName
                };
            } else if (quiz.quizType === "course") {
                quizData = await CourseQuiz.findById(quizId).populate('courseQuizQNA').lean(); // Use .lean()
                quizData = {
                    ...quizData,
                    quizQuestions: quizData.courseQuizQNA,
                    courseQuizQNA: null,
                    quizType: 'course',
                    quizName: quizData.courseQuizName
                };
            }
        } catch (err) {
            console.error(`Failed to fetch quiz data for quizId: ${quizId}, quizType: ${quiz.quizType}`, err.message);
        }

        quiz = { ...quiz, quizData };

        console.log(quiz);

        res.status(200).json(quiz);
    } catch (err) {
        console.error("Error fetching quiz data:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.get('/checkquizstatus', async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    const { quizId } = req.query; // Get quizId from query parameters

    console.log('checkquizstatus ', quizId);
    if (!token || token === "null") {
        console.log("Invalid token");
        return res.status(401).json({ error: "Invalid Token" });
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        const user = await User.findOne({ _id: data._id }).lean(); // Find the user by ID

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user has given the quiz by searching for the quizId in their testScores
        const quizTaken = user.testScores.some(quiz => quiz.quizId === quizId);

        if (quizTaken) {
            return res.status(200).json({ message: "Quiz has been taken" });
        } else {
            return res.status(404).json({ message: "Quiz not taken" });
        }
    } catch (err) {
        console.error("Error checking quiz status:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.post('/resetpassword', (req, res) => {
    const { phone, newpassword } = req.body;

    if (!phone || !newpassword) {
        return res.status(422).json({ error: "Please add all the fields" });
    }
    else {


        User.findOne({ phone })
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
    // Return max 10 users with relevant fields
    User.find({}, { _id: 1, name: 1, email: 1, phone: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .limit(10)
        .then(users => {
            users = users.map(user => {
                if (!user.phone) user.phone = "N/A"; // Add default value if phone is missing
                return user;
            });
            res.json({ users, message: "success" });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: "Server Error" });
        });
});

app.get('/searchuser', (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Query parameter is required." });
    }

    const searchCriteria = isValidObjectId(query)
        ? { _id: query } // Exact match for ID
        : { name: { $regex: query, $options: 'i' } }; // Case-insensitive match for name

    User.find(searchCriteria, { _id: 1, name: 1, email: 1, phone: 1 })
        .then(users => {
            if (users.length === 0) {
                return res.status(404).json({ message: "No users found." });
            }
            res.json({ users, message: "success" });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: "Server Error" });
        });
});

// Utility function to check if a string is a valid ObjectId
const isValidObjectId = (id) => {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(id);
};

// BUY COURSE
app.post('/buyCourse', (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const { courseId, amount, currency, razorpay_payment_id } = req.body;
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
                                razorpay_payment_id: razorpay_payment_id
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
app.post('/buyCourseWhatsapp', (req, res) => {
    const { userId, courseId, transactionId, amount, currency } = req.body;

    User.findOne({ _id: userId })
        .then(async savedUser => {
            if (savedUser) {
                // console.log(savedUser);
                savedUser.coursePurchased.push(courseId);
                savedUser.save()
                    .then(async user => {

                        const purchase = new Purchase({
                            item: {
                                type: 'course',
                                courseId: courseId
                            },
                            userId: user._id,
                            amount: amount,
                            currency: currency,
                            upi_transaction_id: transactionId,
                        });

                        await purchase.save();
                        res.json({ message: "Course Bought Successfully" });
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

app.delete('/clearCart', (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = data;

        User.findOne({ _id: _id })
            .then(user => {
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }

                // Clear the cart
                user.userCart = [];

                user.save()
                    .then(() => {
                        res.json({ message: "Cart cleared successfully", userCart: user.userCart });
                    })
                    .catch(err => {
                        console.error("Error saving user cart: ", err);
                        res.status(500).json({ error: "Server Error" });
                    });
            })
            .catch(err => {
                console.error("Error fetching user: ", err);
                res.status(500).json({ error: "Server Error" });
            });
    } catch (err) {
        console.error("JWT verification failed: ", err);
        return res.status(401).json({ error: "Invalid token" });
    }
});

app.post('/buyProducts', (req, res) => {
    const { cartdata, cartTotal, paymentMethod, paymentId, shipping,  address } = req.body;
    console.log(req.body);

    if (!cartdata || !cartTotal || !paymentMethod || !shipping || !address || !paymentId) {
        return res.json({
            error: "Retry"
        }); // Add return here to stop further execution
    }

    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRET);
    console.log(data);
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
                tax: 0,
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
                    // user.userCart = []; // Optional if you want to clear the cart
                    user.save()
                        .then(user => {
                            res.json({ message: "Order Placed Successfully", userCart: user.userCart, order });
                        })
                        .catch(err => {
                            console.log('Error saving user:', err);
                            res.status(500).json({ error: 'Failed to save user data.' });
                        });
                })
                .catch(err => {
                    console.log('Error saving order:', err);
                    res.status(500).json({ error: 'Failed to save order data.' });
                });
        })
        .catch(err => {
            console.log('Error getting user data from token:', err);
            res.status(500).json({ error: 'Failed to get user data.' });
        });
});



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
            if (user.orders.some(order => order.orderid.toString() === orderId.toString())) {
                Order.findOne({ _id: orderId })
                    .then(order => {

                        // check if order is not delivered
                        if (order.isDelivered === 'Not Delivered') {
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
                        else if (order.isDelivered === 'Delivered') {
                            res.json({
                                error: "Order Already Delivered"
                            });
                        }
                        else {
                            res.json({
                                error: "Something went wrong"
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

app.get('/searchOrders', (req, res) => {
    const { id } = req.query;  // Get orderId or customerId from query params

    // Build the query object dynamically based on provided parameters
    let query = {
        _id: id
    };



    Order.find(query)
        .then(orders => {
            if (orders.length > 0) {
                res.status(200).json({
                    orders: orders
                });
            } else {
                res.status(404).json({
                    message: 'No orders found for the given search criteria'
                });
            }
        })
        .catch(err => {
            console.log('Error searching for orders:', err);
            res.status(500).json({
                error: 'Server Error'
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

app.post('/updateOrderByIdAdmin', adminTokenHandler, (req, res) => {
    const { orderId, order } = req.body;

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
                        message: "success"
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


