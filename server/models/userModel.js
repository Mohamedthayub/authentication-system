const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true   
    },
    email:{
        required:true,
        type:String,
        unique:true
    },
    password:{
        required:true,
        type:String,
        unique:true
    },
    verifyOtp:{
        type:String,
        default:'',
    },
    verifyOtpExpireAt:{
        type:Number,
        default:0,
    },
    isAccountVerified:{
        type:Boolean,
        default:false,
    },
    resetOtp:{
        type:String,
        default:''
    },
    resetOtpExpireAt:{
        type:Number,
        default:0
    },
});

const userModel = mongoose.models.user ||  mongoose.model("User",userSchema);
module.exports = userModel;