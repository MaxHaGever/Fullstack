const express = require('express');
const router = express.Router();
const { createComment, getCommentsByPost, updateComment, deleteComment, getComments } = require('../../controllers/comment');

router.post('/', createComment);

router.get('/post/:postId', getCommentsByPost); 
router.get('/', getComments);
router.put('/:id', updateComment);  
router.delete('/:id', deleteComment); 

module.exports = router;