// Import dependencies
const bcrypt = require("bcryptjs"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For generating JWT tokens
const User = require("../models/User.js"); // User Mongoose model
const Joi = require("joi"); // For input validation

// Define AuthController class to handle auth-related logic
class AuthController {
  // Method to register a new user (only role 'U' - Patient)
  async registerUser(req, res) {
    try {
      // Step 1: Validate input using Joi schema
      const schema = Joi.object({
        name: Joi.string().min(3).required().messages({
          'string.min': "Name should be at least 3 characters",
          'any.required': "Name is required"
        }),
        email: Joi.string().email().required().messages({
          'string.email': "Please enter a valid email",
          'any.required': "Email is required"
        }),
        password: Joi.string().pattern(
          new RegExp(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/)
        ).required().messages({
          'string.pattern.base': "Password must be at least 12 characters long, include 1 uppercase letter and 1 special character",
          'any.required': "Password is required"
        }),
        phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
          'string.pattern.base': "Phone number must be exactly 10 digits",
          'any.required': "Phone number is required"
        })
      });

      // Step 2: Run validation on incoming request body
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, email, password } = req.body;

      // Step 3: Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: "User already exists with this email" });
      }

      // Step 4: Hash the password securely
      const hashedPassword = await bcrypt.hash(password, 10);

      // Step 5: Create new user (role = 'U' by default)
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'U'
      });

      // Step 6: Save user to DB
      await newUser.save();

      // Step 7: Respond with success message
      res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
      // Catch and handle unexpected errors
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    }
  }

  // Inside AuthController class
async loginUser(req, res) {
  try {
    // Step 1: Validate login input
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': "Enter a valid email",
        'any.required': "Email is required"
      }),
      password: Joi.string().required().messages({
        'any.required': "Password is required"
      })
    });

    // Step 2: Run validation
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // Step 3: Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Step 4: Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Step 5: Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token is valid for 7 days
    );

    // Step 6: Send success response with token and basic user info
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

}

// Export an instance of the controller class
module.exports = new AuthController();
