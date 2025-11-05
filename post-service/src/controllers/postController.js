import Post from "../models/Post.js";
import logger from "../utils/logger.js";
import { validateCreatePost } from "../utils/validation.js";

export const createPost = async (req, res) => {
  logger.info("Create post endpoint hit...");

  try {
    //validate request body

    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { content, mediaIds } = req.body;

    if (mediaIds && !Array.isArray(mediaIds)) {
      return res.status(400).json({
        success: false,
        message: "Media IDs must be an array",
      });
    }

    const newPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newPost.save();

    logger.info("Post created successfully", newPost._id);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    logger.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllPost = (req, res) => {
  logger.info("get posts endpoint hit..");
  try {
  } catch (error) {
    logger.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
    });
  }
};

export const getPosts = (req, res) => {
  logger.info("get post endpoint hit..");
  try {
  } catch (error) {
    logger.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts by ID",
    });
  }
};

export const deletePost = (req, res) => {
  logger.info("delete post endpoint hit..");
  try {
  } catch (error) {
    logger.error("Error deleting post:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts by ID",
    });
  }
};
