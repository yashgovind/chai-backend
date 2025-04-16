import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    /*
find all videos uploaded by an owner or user.by their ID. and do some basic error handling../


    */
    const videos = await Video.find({
        owner: req.user?._id
    }).sort({ createdAt: -1 });

    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found for this channel");
      }

    res.status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Channel videos fetched successfully"
            ));
})

export {
    getChannelStats,
    getChannelVideos
    }