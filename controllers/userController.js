const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {createTokenUser,attachCookiesToResponse,checkPermissions} = require('../utils')

const getAllUsers = async (req, res) => {
  // printing the user property which we have attach at middleware(authenticateUser)
  console.log(req.user);

  // we will return only those users whos roles is user and we will return without password
  const users = await User.find({ role: "user" }).select("-password");

  res.status(StatusCodes.OK).json({ users });
};



const getSingleUser = async (req, res) => {
  // printing the user property which we have attach at middleware
  // console.log(`this is single user route controller : ${req.user.name}`);

  const id = req.params.id;

  const user = await User.findOne({ _id: id }).select("-password");

  if (!user) {
    throw new CustomError.NotFoundError(`No User with id ${id}`);
  }

  // in below line the user who is loged in only have access to his profile not other users profile
  // suppose yashwant is logged in so he can only see his profile not Rajats profile
  // req.user --> current logged in user
  // user._id or req.params.id  or id ---> the user which profile we want to see we are getting this from params
  checkPermissions(req.user,id);

  res.status(StatusCodes.OK).json({ user });
};



const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};


// update user with user.save(); using pre hook
const updateUser = async (req, res) => {

    const { name, email } = req.body;
  
    if (!name || !email) {
      throw new CustomError.BadRequestError("please provide both values");
    }

    const user = await User.findOne({_id:req.user.userId});

    user.email = email;
    user.name = name ;

    await user.save();
  
    const tokenUser = createTokenUser(user);
  
    attachCookiesToResponse({res : res,user:tokenUser});
  
    res
      .status(StatusCodes.OK)
      .json({ user : tokenUser });

};


// updateUser using findByIdAndUpdate
// const updateUser = async (req, res) => {
//   const { name, email } = req.body;

//   if (!name || !email) {
//     throw new CustomError.BadRequestError("please provide both values");
//   }

//   const user = await User.findByIdAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   );

//     const tokenUser = createTokenUser(user);

//     attachCookiesToResponse({res : res,user:tokenUser});

//   res
//     .status(StatusCodes.OK)
//     .json({ user : tokenUser });
// };


const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("please provide both values");
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  user.password = newPassword;

  // save the instance
  // this save method will invoke pre save hook in Modules which will hash the password and save it in mongodb
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password updated successfully !" });
};


module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
