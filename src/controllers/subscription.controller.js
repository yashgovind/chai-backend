import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js";
import { channel } from "diagnostics_channel"


const toggleSubscription = asyncHandler(async (req, res) => {
    /*
 find channelID and subscriberID (from the auth.)
 check if channel id and sub id is same , if same then user cannot sub his own channel.
 check if user is subscribed to the channel -->
 -check if user exists and find the user by subscriber id and channelId
 - if the user exists , remove it else create the subscription.
 
 // TODO: toggle subscription
 */
const { channelId } = req.params
if (!channelId) {
   throw new ApiError(400, "channel id not found while toggling subscription");
   }
    const { subscriberId } = req.user?._id;
    if (!subscriberId) {
        throw new ApiError(400, "subscriber to the channel is not defined while toggling");
    }
    if (subscriberId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
      }
    const existedUser = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });
    if (existedUser) {
        await Subscription.deleteOne(
            {
                subscriber: subscriberId,
                channel:channelId
            }
        )
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Deleted user"
            )
        )
    }
    else {
        await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        })
        return res.status(201).json(
            new ApiResponse(
                201,
                {},
                "Created User"
            )
        )

    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}