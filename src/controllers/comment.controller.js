import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    if (!videoId) {
        throw new ApiError(400, "video id is not found while adding a comment");
    }
    const newComment = await Comment.create({
        content: content,
        video: videoId,
        owner:req?._id
    })
    if (!newComment) {
        throw new ApiError(500, "comment not found ");
    }
    return res.status(201).json(
        new ApiResponse(
            201,
            { newComment },
            "comment added"
        )
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { content } = req.body;
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(500, "comment id not defined upon updating comment");
    }
   const updatedComment =  await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content,
                owner:req?._id
            }
        },
        {new:true}
    )
    if (!updateComment) {
        throw new ApiError(500, "something went wrong while updating comment");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
             updateComment ,
            "comment updated successfully"
        )
    );

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    if (!commentId) {
        throw new ApiError(500, "comment id not defined upon deleting comment");
    }
    const deletedComment = await Comment.findOneAndDelete(commentId);
    if (!deletedComment) {
        throw new ApiError(500, "something went wrong while deleting the comment");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            deletedComment,
            "comment deleted successfully"
        )
    )

})

export {
    getVideoComments,
    addComment,
    updateComment,
     deleteComment
    }
