import User from "../models/User.js";
import generateTokens from "../utils/generateToken.js";
import logger from "../utils/logger.js";
import validateSignUp from "../utils/validation.js";

//user registration
export const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit..");
  try {
    //validate the schema
    const { error } = validateSignUp(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, username, password } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    user = new User({ username, email, password });
    await user.save();
    logger.warn("User saved successfully", user._id);

    const { accesToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accesToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registration error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//user login

//refresh token

//logout
