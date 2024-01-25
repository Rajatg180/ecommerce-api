const express = require("express");
const router = express.Router();

const {authenticateUser,authorizePermissions} = require('../middleware/authentication');

const {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
} = require("../controllers/userController");

// here the placment of middleware is so important as first we will authenticate the user then only we will authorize the user
router.route('/').get(authenticateUser,authorizePermissions('admin','owner'),getAllUsers);

// here placement is importanat in this routes 
router.route('/showMe').get(authenticateUser,showCurrentUser);
router.route('/updateUser').post(authenticateUser,updateUser);
router.route('/updateUserPassword').post(authenticateUser,updateUserPassword);

router.route('/:id').get(authenticateUser,getSingleUser)  


module.exports = router;