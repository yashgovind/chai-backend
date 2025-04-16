import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { group } from "console"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id;
    // get total videos.
    const totalVideos = await Video.aggregate([
     {$match:{owner:userId}},
       {
           $group: {
               _id: null,
               count:{$sum:1}
          }
       },
       {$sort:{count:-1}}
   ])

    // get total subscribers.
    const totalSubscribers = await Subscription.aggregate([
        {$match:{owner:userId}},
        {
            $group: {
                _id: "$channel",
                count:{$sum:1}
            }
        },
        {$sort:{count:-1}}
    ])


    // get total likes
    const totalLikes = await Like.aggregate([
        {$match:{LikedBy:userId}},
        {
            $group: {
                _id: null,
                count:{$sum:1}
            }
        },
        {$sort:{count:-1}}
    ])

    // get total Views.
    const totalViews = await Video.aggregate([
        {$match:{owner:userId}},
        {
            $group: {
                _id: "$views",
                count:{$sum:1}
            }
        },
        {$sort:{count:-1}}
    ])

    const totalTweets = await Tweet.aggregate([
        {$match:{owner:userId}},
        {
            $group: {
                _id: null,
                count:{$sum:1}
            }
        },
        {$sort:{count:-1}}
    ])

    const totalComments = await Comment.aggregate([
        {$match:{owner:userId}},
        {
            $group: {
                _id: null,
                count:{$sum:1}
            }
        },
        {$sort:{count:-1}}
    ])



    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalSubscribers,
            totalLikes,
            totalViews,
            totalComments,
            totalTweets
        }, "Channel stats fetched successfully")
    );
});

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