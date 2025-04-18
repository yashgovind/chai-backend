import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


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
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(404, "channelId does not exist");
    }
    /*
    -> find Subscriber by ChannelID for getting sub list of a channel. and do some basic error handling. i have a feeling that we might need aggregation for this. but lets see.

    basically the logic here is
    channel - A , subs-YG,Hari,Paras,Sandy,Aniket channel-b , subs-YG,hari,Paras,Aniket
    channel-C , subs-Khushi,Satvika,Mahi,Ojas



    as we can see . one user can sub to multiple channels. so to get subs of a channel we focus on the channel entity and get its details../
    */
    const channelSubs = await Subscription.find({
        channel: channelId,
    }).populate("_id name email subscriber"); // populate more items in it like subscriber details../
    if (!channelSubs || channelSubs.length === 0) {
        throw new ApiError(400, "channel subs not found or empty");
    }
    return res.status(200).json(
        new ApiResponse(200,channelSubs,"subscriber list of channels is found")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    /*
 user-YG channelsSubbedTo-FCC,CWH,CAC,SCS . user-Hari channelSubbedTo-> Fcc,Primegen,Melon Eusk,Vsauce.

 as we can see the distinct entity here is subscriber and a single subscriber can have multiple channels so we focus on the subscriber details and fill them out.
    */
    const userSubs = await Subscription.find({
        subscriber: subscriberId
    }).populate("_id name email channel"); // to populate more items like channel details , name and email and id etc.
    if (!subscriberId || userSubs.length === 0 || !userSubs) {
        throw new ApiError(404, "either the subscriber doesnt exist or the list of channels are empty or channel doesnt exist");
    }
    return res.status(200).json(
        new ApiResponse(200,userSubs,"channels a user has subbed to is found")
    )
})

export {
    getSubscribedChannels, getUserChannelSubscribers, toggleSubscription
}
