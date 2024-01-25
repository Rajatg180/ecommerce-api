const mongoose = require('mongoose');
// alternate approch to validate email using npm validator package
const validator = require('validator')

const bcrypt = require('bcryptjs')


const UserSchema = new mongoose.Schema({
    name:{
        type : String,
        required:[true,'Please provide name'],
        minlength:3,
        maxlength:50
    },
    email:{
        type : String,
        unique:true,
        validate:{
            validator:validator.isEmail,
            message:'Please provide valid email'
        },
        required:[true,'Please provide email'],
    },
    password:{
        type : String,
        required:[true,'Please provide password'],
        minlength:6
    },
    role:{
        type : String,
        enum:['admin','user'],
        default:'user',
    }  
});

// hashing password
UserSchema.pre('save',async function(){
    console.log("pre save hook is called");
    // give which fields are modified
    console.log(this.modifiedPaths());
    // to see the specific fields which are modified
    console.log(this.isModified('name'));

    if(!this.isModified('password')){
        return ;
    }
    const salt = await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
});

// compare password
UserSchema.methods.comparePassword = async function(canditatePassword){
    const isMatch = await bcrypt.compare(canditatePassword,this.password);
    return isMatch;
}

module.exports = mongoose.model('User',UserSchema)