import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import Post from "../models/post";
import Comment from "../models/comment";
import userModel from "../models/user_model";

type UserInfo = {
    email: string;
    password: string;
    token?: string;
    _id?: string;
};

const userInfo: UserInfo = {
    email: "maxspectorr@gmail.com",
    password: "123456",
};

beforeAll(async () => {
    const dbURI = process.env.dbURI;
    if (!dbURI) {
        throw new Error("Database connection string (dbURI) is not defined");
    }

    await mongoose.connect(dbURI);

    await Post.deleteMany();
    await Comment.deleteMany();
    await userModel.deleteMany();

    await request(app).post("/auth/register").send(userInfo);
    const response = await request(app).post("/auth/login").send(userInfo);
    userInfo.token = response.body.accessToken;
    userInfo._id = response.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Post and Comment API Tests", () => {
    let post1Id: string;
    let post2Id: string;
    let comment1Id: string;
    let comment2Id: string;

    test("POST /posts - Should create posts", async () => {
        const post1 = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({ title: "Post 1", content: "Content 1" });
        console.log("Post 1 Response:", post1.body);

        post1Id = post1.body._id;
        expect(post1.statusCode).toEqual(201);
        expect(post1Id).toBeDefined();

        const post2 = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({ title: "Post 2", content: "Content 2" });
        console.log("Post 2 Response:", post2.body);

        post2Id = post2.body._id;
        expect(post2.statusCode).toEqual(201);
        expect(post2Id).toBeDefined();
    });

    test("POST /comments - Should create comments for a post", async () => {
        const comment1 = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({ postId: post1Id, text: "Comment 1" });
        console.log("Comment 1 Response:", comment1.body);

        comment1Id = comment1.body._id;
        expect(comment1.statusCode).toEqual(201);

        const comment2 = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({ postId: post1Id, text: "Comment 2" });
        console.log("Comment 2 Response:", comment2.body);

        comment2Id = comment2.body._id;
        expect(comment2.statusCode).toEqual(201);
    });

    test("GET /posts - Should get all posts", async () => {
        const res = await request(app).get("/posts");
        console.log("Get Posts Response:", res.body);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    test("GET /posts/:id - Should get a single post", async () => {
        const res = await request(app).get(`/posts/${post1Id}`);
        console.log("Get Post by ID Response:", res.body);

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual("Post 1");
    });

    test("GET /comments - Should get all comments", async () => {
        const res = await request(app).get("/comments");
        console.log("Get Comments Response:", res.body);

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    test("DELETE /posts/:id - Should delete a post", async () => {
        const res = await request(app)
            .delete(`/posts/${post2Id}`)
            .set("Authorization", `Bearer ${userInfo.token}`);
        console.log("Delete Post Response:", res.body);

        expect(res.statusCode).toEqual(200);
    });

    test("DELETE /comments/:id - Should delete a comment", async () => {
        const res = await request(app)
            .delete(`/comments/${comment2Id}`)
            .set("Authorization", `Bearer ${userInfo.token}`);
        console.log("Delete Comment Response:", res.body);

        expect(res.statusCode).toEqual(200);
    });

    test("UPDATE /posts/:id - Should update a post", async () => {
        const updatedPost = await request(app)
            .put(`/posts/${post1Id}`)
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({ title: "Updated Post 1", content: "Updated Content 1" });
        console.log("Update Post Response:", updatedPost.body);

        expect(updatedPost.statusCode).toEqual(200);
        expect(updatedPost.body.title).toEqual("Updated Post 1");
    });

    test("UPDATE /comments/:id - Should update a comment", async () => {
        const updatedComment = await request(app)
            .put(`/comments/${comment1Id}`)
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({ text: "Updated Comment 1" });
        console.log("Update Comment Response:", updatedComment.body);

        expect(updatedComment.statusCode).toEqual(200);
        expect(updatedComment.body.text).toEqual("Updated Comment 1");
    });
});
