const bcrypt = require("bcryptjs");
const jsonWebToken = require('jsonwebtoken');
const  userModel = require('../models/userModel');
const resend = require("../config/email");
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.json({
            success: false,
            message: "Missing Details"
        });
    }

    try {
        // Check if user already exists
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new userModel({
            name,
            email,
            password: hashedPassword
        });

        // Save user to MongoDB
        await user.save();

        // Create JWT
        const token = jsonWebToken.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Store JWT in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
     
        await resend.emails.send({
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome!",
            html: `
                <h1>Welcome ${name}!</h1>
                <p>Your account has been created successfully.</p>
            `
        });

        return res.json({
            success: true,
            message: "User registered successfully"
        });
        

    } catch (error) {
        console.error("Register error:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};
exports.login = async (req,res) => {
    const {email,password} = req.body;
    if(!email || !password){
        return res.json({
            success:false,
            message:"Email and password are required"
        });
    }
    try{
        const user  = await userModel.findOne({email});
        if(!user){
            return res.json({
                success:false,
                message:'invalid  email'
            });
        } 
        const  isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({
                success:false,
                message:'Invalid password'
            });
        }
        const token  = jsonWebToken.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'production' ? 'none':'strict',
            maxAge:7 *24 * 60 * 60 * 1000    
        });
        return  res.json({
            success:true,
        });
    }
    catch(error){
        res.json({
            success:false,
            message:error.message
        });
    }
}
exports.logout = async (req,res) => {
    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'production' ? 'none':'strict'
        });
        return res.json({
            success:true,
            message:'Logged Out'
        });
    }   
    catch(error){
        return res.json({
            success:false,message:error.message
        });
    } 
}

exports.sendVerifyOtp = async (req,res) => {
    try{
        const {userId} = req.body;   
        const user  =  await userModel.findById(userId);
        if(!user.isAccountVerified){
            return res.json({
                success:false,
                message:"Account Already  verified"
            });
        }
        const otp  = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await  user.save();
        
        await resend.emails.send({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verfication OTP",
            text:`your OTP is ${otp} Verify your account using this OTP`
        });
        res.json({
            success:true,
            message:"Verification OTP Sent on Email"
        });
    }
    catch(error){
        res.json({
            success:false,
            message:error.message
        });
    }
}
exports.verifyEmail = async (req,res) => {
    const {userId,otp } = req.body;
    if(!userId || !otp){
        res.json({
            success:false,
            message:'Missing Details'
        })
    }
    try{
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({
                success:false,
                message:'user not found'
            });
        }
        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({
                success:false,
                message:'Invalid OTP'
            });
        }
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({
                success:false,
                message:'OTP Expired'
            });
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();
        return res.json({
            success:true,
            message:'Email verified Successfully'
        });
    }
    catch(error){
        return res.json({
            success:false,
            message:error.message
        })
    }
}
