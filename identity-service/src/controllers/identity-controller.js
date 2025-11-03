import RefreshToken from "../models/RefreshToken.js";
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
export const refreshTokenUser = async (req, res) => {
  logger.info("Refresh token endpoint hit..");

  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token is missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token is missing",
      });
    }

    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
    });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh token");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(storedToken.user);

    if (!user) {
      logger.warn("User not found for the provided refresh token");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    //delete old refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("Refresh token error occured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//logout
export const logoutUser = async (req, res) => {
  logger.info("Logout endpoint hit..");

  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token is missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token is missing",
      });
    }

    await RefreshToken.deleteOne({ token: refreshToken });

    logger.info("Refresh token deleted for logout");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("Error error occured while logout", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
