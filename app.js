require("dotenv").config();
require("./config/database").connect();

const express = require("express");
const auth = require("./middleware/auth");
const {login,register} = require("./actions/auth");

const app = express();
app.use(express.json());

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome!");
});

app.post("/register",register);
app.post("/login", login);


module.exports = app;