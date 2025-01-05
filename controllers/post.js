const Post = require('../models/post');

const createPost = async (req, res) => {
    try {
        const post = new Post(req.body);
        await post.save();
        res.status(201).send(post);
    } catch (err) {
        res.status(400).send(err);
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).send(posts);
    } catch (err) {
        res.status(500).send(err);
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');
        res.status(200).send(post);
    } catch (err) {
        res.status(500).send(err);
    }
};

const updatePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) return res.status(404).send('Post not found');
        res.status(200).send(post);
    } catch (err) {
        res.status(400).send(err);
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).send('Post not found');
        res.status(200).send(post);
    } catch (err) {
        res.status(500).send(err);
    }
};

const getPostsBySender = async (req, res) => {
    try {
        const senderId = req.query.sender; // Get sender ID from query parameters
        if (!senderId) return res.status(400).send({ error: 'Sender ID is required' });

        const posts = await Post.find({ sender: senderId });
        res.status(200).send(posts);
    } catch (err) {
        res.status(500).send({ error: 'Failed to fetch posts by sender', details: err });
    }
};

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost, getPostsBySender };
