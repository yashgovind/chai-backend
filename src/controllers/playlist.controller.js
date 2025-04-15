import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { error } from "console"
import { Video } from "../models/video.model.js";
import { lookup } from "dns"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name || !description) {
        throw new ApiError(404, "name or description not found so cannot create playlist");
    }

    //TODO: create playlist , each playlist will have a name , description , an owner and some videos

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id,
    })

    if (!playlist) {
        throw new ApiError(404, "playlist not found");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            playlist,
            "playlist created successfully."
            )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!userId) {
        throw new ApiError(404, "userId is not defined while fetching user playlists");
    }
    const playlist = await Playlist.find(
        { owner: userId }
    )
    if (!playlist) {
        throw new ApiError(404, "playlist is not present when fetching all user playlists");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "fetched user playlist successfully"
        )
    );

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!playlistId) {
        throw new ApiError(404, "playlist id not defined");
    }
    const playlist = await Playlist.findById(playlistId).populate("videos");
    if (!playlist) {
        throw new ApiError(400, "playlist is not present while fetching id");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "playlist fetched successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    /*
 find playlist by id and video by id.
 do some  error handling
 do some aggregation and left join the playlist id to video id
 pipeline-01 match : (find the playlist by id) the playlist id
 pipeline-02 join , lookup , playlist.videos join to video.id
 subpipeline-01 : each video will have an owner as well../ so join playlist.owner to user.id
 pipeline-03 use Addfields to flatten the array
 pipeline-04 merge the object into playlist model itself.
    */

    // check to see if video exists. this was written by ai so im doubtful to try to see if it works.
 const videoExists = await Video.exists({ _id: videoId });
 if (!videoExists) {
     throw new ApiError(404, "Video not found");
    }

    if (!playlistId || !videoId) {
        throw new ApiError(404, "playlist id or video id not found");
    }
    const playlist = await Playlist.aggregate([
        {
            $match: { _id:new mongoose.Types.ObjectId(playlistId) }, // match the playlist id
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "playlistVideos",
                pipeline:
                 [
                 {
                  $lookup: {
                         from: "users",
                         localField: "owner",
                         foreignField: "_id",
                         as:"ownerPlaylistVideos"
                   }
                   }
                   ]
            }
        },
        {
            $addFields: {
                playlistVids: {
                    $arrayElemAt: ["$playlistVideos.ownerPlaylistVideos",0]
                }
            }
        },
        {
            $merge: {
                $into:"$playlists" // merge the object into the playlists model../
            }
        }
    ])
    if (!playlist || !playlist.length === 0) {
        throw new ApiError(400, "Playlist not found when adding video");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist[0],
            "video added to the playlist."
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    /*
    find the playlist by playlist id and find the video by videoID.
    basic error handling
    check if video exists.
    remove the videos found by video id and send the response.

    */
    const videoExists = await Video.exists({ _id: videoId });
 if (!videoExists) {
     throw new ApiError(404, "Video not found");
    }
    if (!playlistId || !videoId) {
        throw new ApiError(404, "playlist id or video id not found");
    }
    const removedVideoFromPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
        $pull: {
         videos:videoId
        }
        },
        {new:true}
    )
    if (!removeVideoFromPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(204).json(
        new ApiResponse(
            204,
            removeVideoFromPlaylist,
            "video successfully removed from the playlist"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(404, "playlist id not defined when deleting playlist");
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) {
        throw new ApiError(400, "playlist is not defined when deleting it or playlist not found");
    }
    return res.status(204).json(
        new ApiResponse(
            204,
            playlist,
            "deleted playlist successfully"
        )
    );
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!playlistId || !name || !description) {
        throw new ApiError(400, "either the playlist id is not defined or name or description");
    }
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description,
                owner:req.user?._id
            }
        },
        {new :true}
    )
    return res.status(200), json(
        new ApiResponse(
            200,
            playlist,
            "upldated playlist successfully"
        )
    );
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
