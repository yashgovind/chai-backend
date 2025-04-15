import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { LikeId } = req.body;
    //TODO: toggle like on video
    if (!videoId || !LikeId)  {
        throw new ApiError(400, "video id or likeId not found while toggling");
    }
    const likedVideos = await Like.findOne({
        video: videoId,
        likedBy:LikeId
    })
    if (likedVideos) {
        await Like.deleteOne({
            video: videoId,
            likedBy: LikeId
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "deleted video like"
            )
        )
    }
    else {
        await Like.create({
            video: videoId,
            likedBy:LikeId
        })
        return res.status(200).json(
            new ApiResponse(
                201,
                {},
                "added video like"
            )
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { LikeId } = req.body;
    //TODO: toggle like on video
    if (!commentId || !LikeId)  {
        throw new ApiError(400, "video id or likeId not found while toggling");
    }
    //TODO: toggle like on comment
    const likedComments = await Like.findOne({
        comment: commentId,
        likedBy:LikeId
    })
    if (likedComments) {
        await Like.deleteOne({
            comment: commentId,
            likedBy: LikeId
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "deleted comment like"
            )
        )
    }
    else {
        await Like.create({
            comment: videoId,
            likedBy:LikeId
        })
        return res.status(200).json(
            new ApiResponse(
                201,
                {},
                "added comment like"
            )
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const { LikeId } = req.body;
    //TODO: toggle like on video
    if (!tweetId || !LikeId)  {
        throw new ApiError(400, "video id or likeId not found while toggling");
    }
    //TODO: toggle like on comment
    const likedTweets = await Like.findOne({
        tweet: tweetId,
        likedBy:LikeId
    })
    if (likedTweets) {
        await Like.deleteOne({
            tweet: tweetId,
            likedBy: LikeId
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "deleted tweet like"
            )
        )
    }
    else {
        await Like.create({
            tweet: tweetId,
            likedBy:LikeId
        })
        return res.status(200).json(
            new ApiResponse(
                201,
                {},
                "added tweet like"
            )
        )
    }
}
)

//#TODO
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}