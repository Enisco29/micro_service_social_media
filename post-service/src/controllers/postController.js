import logger from "../utils/logger.js";

export const createPost = async (req, res) => {
  logger.info("create post endpoint hit..");
  try {
    const { content, mediaIds } = req.body;

    const newPost = {
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    };

    await newPost.save();

    logger.info("Post created successfully", newPost);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
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
