import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    if (!content) {
        throw new ApiError(500, "content not found while creating a tweet")
    }
  const newTweet =   await Tweet.create({
        owner: req.user?._id,
        content:content
  })
    if (!newTweet) {
        throw new ApiError(400, "unfortunately new tweet could not be created bro");
    }
    return res.status(201).json(
        new ApiResponse(201,
            newTweet,
            "created tweet successfully"
        )
    );
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    if (!userId) throw new ApiError(400, "user id not defined while getting user tweets");
    const userTweets = await Tweet.findById(userId);
    if (!userTweets) {
        throw new ApiError(500, "user tweets do not exist or something went wrong");
    }
    return res.status(200).json(
        new ApiResponse(200,
            userTweets,
            "fetched user tweets"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;
    if (!tweetId) {
        throw new ApiError(404, "tweet id not defined while updating ");
    }
   const updatedTweet =  await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content,
                owner:req.user?._id
            }
        },
        {new:true}
    )
    if (!updatedTweet) {
        throw new ApiError(400, "updated tweet does not exist . ");
    }
    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(404, "tweet id not defined while deleing ");
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
        throw new ApiError(500,"tweet not found or something went wrong")
    }

    return res.status(200).json(
        new ApiResponse(200, deletedTweet, "deleted tweet successfully")
    );
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
