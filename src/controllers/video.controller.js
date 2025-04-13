import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
/**
 * ===============================
 * 📽️  getAllVideos API Breakdown
 * ===============================
 *
 * 🧩 Step 1: Check if userId or owner or search query exists.
 *    - If all are missing, throw error.
 *
 * 🧩 Step 2: Pagination logic
 *    - Calculate skip = (page - 1) * limit
 *
 * 🧩 Step 3: Start aggregation pipeline
 *
 *    1. $match:
 *       - Filter videos by title (case insensitive)
 *       - Filter videos by owner (userId)
 *
 *    2. $lookup:
 *       - Join "users" collection to get video owner's details (username, avatar)
 *
 *    3. $addFields:
 *       - Flatten the "videosByOwner" array to a single object for cleaner data
 *
 *    4. $sort:
 *       - Sort videos based on sortBy field and sortType (asc/desc)
 *
 *    5. $skip:
 *       - Skip documents for pagination
 *
 *    6. $limit:
 *       - Limit documents for pagination
 *
 *    7. $project:
 *       - Select only required fields to return to frontend
 *
 * 🧩 Step 4: If no videos found, throw error.
 *
 * 🧩 Step 5: Return response with fetched videos.
 *
 */

    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

    // const owner = await User.findById(userId);

    if (!userId && !owner && !query) {
        throw new ApiError(404, "userID or owner or query is not defined");
    }

    let skip = (page - 1) * limit;

    const videos = await Video.aggregate([
        {
            $match: {
                title: { $regex: query, $options: "i" },
                owner: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videosByOwner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                userVids: {
                    $owner: {
                        $first:"videosByOwner"
                    }
                }
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "desc" ? -1 : 1
            }
        },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
            $project: {
                videoFile: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                thumbnail: 1,
                userVids: 1,
            }
        }
    ]);

    if (!videos.length) {
        throw new ApiError(404, "videos not found");
    }

    return res.status(200).json(new ApiResponse(200, videos, "All Videos Fetched"));
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;


    if (!title || !description) {
        throw new ApiError(404, "title and description needed");
    }

    // TODO: get video, upload to cloudinary, create video
    /*
 get title desc from body
 find videoLocal path :
 find thumbnailLocal path.
 delete old thumbnail and delete old video. #TODO.
 upload them to cloudinary
 create new video with fields and return the response.
    */
     const  videoLocalPath = req.files?.videoFile[0]?.path;
     const thumbnailLocalPath = req.files?.thumbnail[0]?.path;


    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(404, "videoLocal path or thumbnail local path is not present");
    }

    let video = await uploadOnCloudinary(videoLocalPath);


    let thumbnail = await uploadOnCloudinary(thumbnailLocalPath);


    if (!video || !thumbnail) {
        throw new ApiError(500, "Failed to upload video or thumbnail to Cloudinary.");
    }

    const newVideo = await Video.create( {
        title: title,
        description: description,
        videoFile:video.url,
        thumbnail: thumbnail.url,
        owner: req.user?._id,
        duration: video.duration,
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                newVideo,
                "Video published successfully."
            )
        );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    //`populate("owner", "name email")` fetches additional details about the video's owner.
    //   - Instead of just storing the owner's ID, this will return their name and email too.
    const video = await Video.findById(videoId).populate("owner","name email");
    if (!video || !videoId) {
        throw new ApiError(400, "video not found or video id doesnt exist.");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "video fetched successfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    //TODO: update video details like title, description, thumbnail

    /*

   find video id by params. get title and description from body
   do some basic error handling
   find thumbnail path and upload to cloudinary
   delete old thumbnail #TODO
   update the url and other values and send response
    */
    if (!title || !description) {
        throw new ApiError(404, "title and description needed");
    }

    if (!videoId) {
        throw new ApiError(500, "video id doesnt exist.");
    }
    // add error handling for thumbnail../
    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
       throw new ApiError(404, "thumbnail path undefined.")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail.url) {
        throw new ApiError(400, "error uploading thumbnail to cloudinary");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
                title: title,
                description: description,
                owner: req.user?._id,
            }
        },
        {new:true}
    );

        return res.status(200).json(
            new ApiResponse(
                200,
                video,
                "video updated successfully"
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
        throw new ApiError("404", "video id not defined");
    }
    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if (!deletedVideo) {
        throw new ApiError(404, "Video not found");
      }

    return res
        .status(204)
        .json(
            new ApiResponse(
                204,
             deletedVideo,
                "Video deleted successfully."
            )
        );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video || !videoId) {
        throw new ApiError(400, "video not found or video id doesnt exist.");
    }
    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "toggled their published status"
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
