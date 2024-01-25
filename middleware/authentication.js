const {isTokenValid} = require('../utils');
const CustomError = require('../errors');

const authenticateUser = (req,res,next)=>{
    const token = req.signedCookies.token;

    if(!token){
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
    try{
        const {name,userId,role} = isTokenValid({token});
        // attaching user to the request
        req.user = {name,userId,role};
        // this next we move to authorizePermissions middleware if every this is ok
        next();
    }
    catch(err){
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    };
    
}

// this (...) is called as rest operator which collect as the arguments which we are passing in middleware in form of array
const authorizePermissions = (...roles)=>{
    // if the user is admin , owner then only he will be able to see all user
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            throw new CustomError.UnauthorizedError('Unauthorized to access this route');
        };
        console.log("printing from authorizePermissions");
        //this next() we move to getAllUsers middleware if every this is ok
        next();
    };
};

module.exports = {
    authenticateUser,authorizePermissions
}