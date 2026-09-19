const express = require("express");
const cors = require("cors");
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

app.get("/", (req, res) => {
    res.send("API is Working");
});

app.listen(port, () => {
    console.log(`Server started on PORT ${port}`);
});