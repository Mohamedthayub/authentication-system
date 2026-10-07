const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const connectDB = require("./config/mongodb");

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true
}));

connectDB();


// app.use()
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);

app.listen(port, () => {
    console.log(`Server started on PORT ${port}`);
});