const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

// CustomError is object
const CustomError = require("../errors");
// or
// const {CustomAPIError,UnauthenticatedError,NotFoundError,BadRequestError} = require("../errors");

const jwt = require('jsonwebtoken');

const {attachCookiesToResponse,createTokenUser} = require('../utils/index');


const register = async (req, res) => {

    const {name,email,password}=req.body;

    const emailAlreadyExists = await User.findOne({email});

    if(emailAlreadyExists){
        throw new CustomError.BadRequestError('Email Already Exists');
    }

    // we will make first user as admin
    const isFirstAccount = (await User.countDocuments({})) === 0;

    const role = isFirstAccount ? 'admin':'user';

    const user = await User.create({name,email,password,role});

    // console.log(user);

    const tokenUser = createTokenUser(user);

    // below line will attach cookies to the response
    attachCookiesToResponse({res:res,user:tokenUser});
    
    res.status(StatusCodes.CREATED).json({user:tokenUser});
};


const login = async (req, res) => {

    const {email,password} = req.body;

    // checking for if email or password is provided or not
    if(!email || !password){
        throw new CustomError.BadRequestError("please provide email and password")
    }
    
    // checking if email is present
    const user = await User.findOne({email});

    if(!user){
        throw new CustomError.UnauthenticatedError("Please provide valid credentials");
    }

    // comparing password
    const isPasswordCorrect = await user.comparePassword(password);

    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError("Please provide valid credentials");
    }

    const tokenUser =  createTokenUser(user);

    // below line will attach cookies to the response
    attachCookiesToResponse({res:res,user:tokenUser});
    
    res.status(StatusCodes.OK).json({user:tokenUser});

};

const logout = async (req, res) => {
    // setting cookies to any random value here we are setting it to logout
    res.cookie('token','logout',{
        httpOnly : true,
        expires : new Date(Date.now())
    });

    res.status(StatusCodes.OK).json({msg:"user logged out!"});
};

module.exports = {
  register,
  login,
  logout,
};
