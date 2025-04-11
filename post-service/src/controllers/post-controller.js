const logger = require("../utils/logger");
const Post = require("../models/Post");
const { validateCreatePost } = require("../utils/validation");
const { publishEvent } = require("../utils/rabbitmq");

async function invalidatePostCache(req,input){

    const cachedKey = `post:${input}`
    await req.redisClient.del(cachedKey)

    const keys = await req.redisClient.keys("posts:*");
    if(keys.length > 0){
        await req.redisClient.del(keys)
    }
}


const createPost = async (req, res) => {
  logger.info("Create post endpoint hit");
  try {
    //validate schema
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;
    const newlyCreatedPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();

    await publishEvent('post.created',{
      postId: newlyCreatedPost._id.toString(),
      userId: newlyCreatedPost.user.toString(),
      content: newlyCreatedPost.content,
      createdAt: newlyCreatedPost.createdAt
    })

    await invalidatePostCache(req,newlyCreatedPost._id.toString())
    logger.info("Post created successfully", newlyCreatedPost);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (error) {
    logger.error("Error creating post", error);
    res.status(500).json({
      success: false,
      message: "Error creating post",
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    if (!req.redisClient) {
        logger.warn("Redis client is missing in request object");
    }

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cacheKey);
    
    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNoOfPosts = await Post.countDocuments();
    const result = {
        posts, 
        currentpage: page,
        totalPages: Math.ceil(totalNoOfPosts / limit),
        totalPosts: totalNoOfPosts
    }

    //save your posts in redis cache
    await req.redisClient.setex(cacheKey,300,JSON.stringify(result));

    res.json(result)

  } catch (error) {
    logger.error("Error fetch post", error);
    res.status(500).json({
      success: false,
      message: "Error fetch post",
    });
  }
};

const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const cacheKey = `post:${postId}`
    const cachedPosts = await req.redisClient.get(cacheKey);
    
    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }

    const singlePostDetailsbyId = await Post.findById(postId)

    if(!singlePostDetailsbyId){
        return res.status(404).json({
            message: 'Post not found',
            success: false
        })
    }

    await req.redisClient.setex(cachedPosts,3600,JSON.stringify(singlePostDetailsbyId))
    res.json(singlePostDetailsbyId)

  } catch (error) {
    logger.error("Error fetch post by id", error);
    res.status(500).json({
      success: false,
      message: "Error fetch post by id",
    });
  }
};

const deletePost = async (req, res) => {
  try {

    const post = await Post.findOneAndDelete({
        _id:req.params.id,
        user: req.user.userId
    })

    if(!post){
        return res.status(404).json({
            message: 'Post not found',
            success: false
        })
    }

    //publish post delete method
    await publishEvent('post.deleted',{
      postId : post._id.toString(),
      userId : req.user.userId,
      mediaIds: post.mediaIds
    })

    await invalidatePostCache(req,req.params.id)
    res.json({
        message: 'Post deleted successfully'
    })
  } catch (error) {
    logger.error("Error deleting post by id", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post by id",
    });
  }
};

module.exports = { createPost, getAllPosts, getPost, deletePost};
