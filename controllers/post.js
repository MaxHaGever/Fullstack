const getAllPosts = (req,res)=>{
    console.log("Posts get All service");
    res.send("Posts get All service");
};

const createPost = (req,res)=>{
    console.log("Posts create post");
    res.send("Posts create post");
};

module.exports = {getAllPosts,createPost};