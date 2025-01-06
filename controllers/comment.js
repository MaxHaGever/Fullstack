const Comment = require('../models/comment');

const createComment = async (req, res) => {
    try {
        const comment = new Comment(req.body);
        await comment.save();
        res.status(201).send(comment);
    } catch (err) {
        res.status(400).send(err);
    }
};

const getComments = async (req, res) => {
    try {
        const comments = await Comment.find();
        res.status(200).send(comments);
    } catch (err) {
        res.status(500).send({ error: 'Failed to fetch comments', details: err });
    }
};

const getCommentsByPost = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId });
        res.status(200).send(comments);
    } catch (err) {
        res.status(500).send(err);
    }
};

const updateComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!comment) return res.status(404).send('Comment not found');
        res.status(200).send(comment);
    } catch (err) {
        res.status(400).send(err);
    }
};

const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) return res.status(404).send('Comment not found');
        res.status(200).send(comment);
    } catch (err) {
        res.status(500).send(err);
    }
};

module.exports = { createComment, getCommentsByPost, updateComment, deleteComment, getComments };
