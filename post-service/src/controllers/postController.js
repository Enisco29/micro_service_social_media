import Post from "../models/Post.js";
import logger from "../utils/logger.js";
import { validateCreatePost } from "../utils/validation.js";

async function invalidatePostCache(req, input) {
  const cacheKey = `post:${input}`;
  await req.redisClient.del(cacheKey);

  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
}

//Create a post controller
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
    await invalidatePostCache(req, newPost._id.toString());

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

//get all post
export const getAllPost = async (req, res) => {
  logger.info("get posts endpoint hit..");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cahceKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cahceKey);

    if (cachedPosts) {
      return res.status(200).json(JSON.parse(cachedPosts));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNoOfPosts = await Post.countDocuments();

    const result = {
      posts,
      courrentPage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      totalPosts: totalNoOfPosts,
    };

    //save post in redis cache
    await req.redisClient.setex(cahceKey, 300, JSON.stringify(result));

    res.json(result);
  } catch (error) {
    logger.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
    });
  }
};

//GET POST BY ID
export const getPostById = async (req, res) => {
  logger.info("get post endpoint hit..");
  try {
    const postId = req.params.id;
    const cacheKey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if (cachedPost) {
      return res.status(200).json(JSON.parse(cachedPost));
    }

    const postById = await Post.findById(postId);

    if (!postById) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    //save post in redis cache
    await req.redisClient.setex(cacheKey, 3000, JSON.stringify(postById));

    res.status(200).json(postById);
  } catch (error) {
    logger.error("Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts by ID",
    });
  }
};

export const deletePost = async (req, res) => {
  logger.info("delete post endpoint hit..");
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or unauthorized",
      });
    }
    //delete post from redis cache
    await invalidatePostCache(req, req.params.id);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting post:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts by ID",
    });
  }
};
