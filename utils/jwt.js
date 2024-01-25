const jwt = require('jsonwebtoken');

// create token function
const createJWT = ({payload})=>{
    const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:process.env.JWT_LIFETIME});
    return token;
}

// const verify token 
const isTokenValid = ({token})=>jwt.verify(token,process.env.JWT_SECRET);


// creating token and attach cookkies to the response
const attachCookiesToResponse = ({res,user}) =>{

    const token = createJWT({payload:user});

    // insted of storing token in local storage we can use cookies for that 
    // we have use local storage to store token in jobs api 
    // in this project we will we using cookies

    const oneDay = 1000 * 60 * 60 * 24;

    res.cookie('token',token,{
        httpOnly : true,
        expires : new Date(Date.now() + oneDay),
        // when we are in production then only we will use https else http
        secure : process.env.NODE_ENV === 'production',
        signed : true
    });

}

module.exports={
    createJWT,isTokenValid,attachCookiesToResponse
}
