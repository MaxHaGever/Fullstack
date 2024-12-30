const { json } = require("body-parser");
import postModel from "../models/post_model";
import { Request,Response } from "express";

const getAllPosts = async (req:Request,res:Response)=>{
    const ownerFilter = req.query.owner;
    try{
        if(ownerFilter){
        const posts = await postModel.find({owner: ownerFilter});
        res.status(200).send(posts);
        } else {
            const posts = await postModel.find();
            res.status(200).send(posts);
        }
    }   catch(error){
        res.status(400).send(error);
    }
};

const getPostbyId = async (req:Request,res:Response) => {
    const postID = req.params.id;
    try{
        const post = await postModel.findById(postID);
        res.status(200).send(post);
    }catch (error){
        res.status(400).send(error);
    }
}

const createPost = async (req:Request,res:Response)=>{
    const post = req.body;
    try{
        const newPost = await postModel.create(post);
        res.status(201).send(newPost);
    }catch(error){
        res.status(400).send(error);
    }
};

const deletePost = async (req:Request,res:Response) => {
    const postID = req.params.id
    try{
        const post = await postModel.deleteOne({_id: postID});
        res.status(200).send(post);
    }catch(error){
        res.status(400).send(error);
    }
};

export default {getAllPosts,createPost,deletePost,getPostbyId};