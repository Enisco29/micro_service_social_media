import User from "../models/User.js";
import generateTokens from "../utils/generateToken.js";
import logger from "../utils/logger.js";
import { validateLogin, validateSignUp } from "../utils/validation.js";

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
        message: "User already exists",
      });
    }

    user = new User({ username, email, password });
    await user.save();
    logger.info("User saved successfully", { userId: user._id });

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
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
export const loginUser = async (req, res) => {
  logger.info("Login endpoint hit..");

  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("Invalid email or password");
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //user valid password or not
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(200).json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (error) {
    logger.error("Registration error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//refresh token

//logout
