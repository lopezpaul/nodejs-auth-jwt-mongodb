const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const TOKEN_EXPIRES = process.env.TOKEN_TIME_TO_EXPIRE;
const TOKEN_KEY = process.env.TOKEN_KEY;

const register = async (req, res) => {
    // Our register logic starts here
    try {
        // Get user input
        const { first_name, last_name, email, password } = req.body;

        // Validate user input
        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            TOKEN_KEY,
            {
                expiresIn: TOKEN_EXPIRES,
            }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }

}

const login = async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body;

        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id, email },
                TOKEN_KEY,
                {
                    expiresIn: TOKEN_EXPIRES,
                }
            );
            // save user token
            user.token = token;
            console.info("Valid User:", user.token);
            // user
            res.status(200).json(user);
        } else {
            console.error('Invalid credentials:',req.body);
            res.status(400).send("Invalid Credentials");
        }
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends here
}

exports.login = login;
exports.register = register;