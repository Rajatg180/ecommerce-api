// env package
require('dotenv').config();
require('express-async-errors');

// ORM
const mongoose = require('mongoose');

// express
const express = require('express');

const app= express();

// extra packages
const morgan = require('morgan');

// extracting the cookies on frontend
const cookieParser=require('cookie-parser');

// upload image
const fileUpload = require('express-fileupload');


// database
const connectDB = require('./db/connect');

// routers
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');

// cors package to make resources avaible publicaly
const cors = require('cors');

// middleware 
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
// if frontend is not on same port i.e for react app default port is 3000 and in this case our server is on port 5000 so to make 
// resources publically available we use cors package
app.use(cors())

app.use(express.static('./public'));
app.use(fileUpload());

app.get('/',(req,res)=>{
    return res.send('get route')
});


app.get('/api/v1',(req,res)=>{
    // if we dont signed cookies then we can access them using req.cookies
    // console.log(req.cookies);
    // if we signed cookies then we can access them using req.signedCookies
    console.log(req.signedCookies);
    return res.send('getting the cookie')
});

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/products',productRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/orders',orderRouter);

app.use(notFoundMiddleware);
// this middleware only get called when there is route and this throws an error
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async()=>{
    try{
        // error handeling 
        mongoose.set("strictQuery", false);
        await connectDB(process.env.MONGO_URI);
        app.listen(port,console.log(`Listening on port ${port}....`)); 
    }
    catch(error){
        console.log(error);
    }
}

start();
