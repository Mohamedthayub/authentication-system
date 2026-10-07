const express = require('express');
const userRouter = express.Router();
const {userAuth} = require('../middleware/userAuth');
const {getUserData} = require('../controllers/userController');

userRouter.get('/data',userAuth,getUserData);


module.exports = userRouter;