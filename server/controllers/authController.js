const bcrypt = require("bcryptjs");
const jsonWebToken = require('jsonwebtoken');
const  userModel = require('../models/userModel');
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

        // Send response
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