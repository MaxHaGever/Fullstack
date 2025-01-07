import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import Student, { IStudent } from "../../src/models/student";
import Post, { IPost } from "../../src/models/post";
import Comment, { IComment } from "../../src/models/comment";

beforeAll(async () => {
    const dbURI = process.env.dbURI;
    if (!dbURI) {
        throw new Error("Database connection string (dbURI) is not defined");
    }
    await mongoose.connect(dbURI);
    // Clean the database
    await Student.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
});

afterAll(async () => {
    await mongoose.disconnect();
});

describe("Student API Tests", () => {
    let student1Id: string;
    let student2Id: string;

    beforeAll(async () => {
        const student1 = await request(app).post("/students").send({
            id: "111111",
            name: "Alice",
        });
        student1Id = student1.body._id;

        const student2 = await request(app).post("/students").send({
            id: "222222",
            name: "Bob",
        });
        student2Id = student2.body._id;
    });

    test("GET /students - Should get all students", async () => {
        const res = await request(app).get("/students");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        const studentNames: string[] = res.body.map((student: IStudent) => student.name);
        expect(studentNames).toContain("Alice");
        expect(studentNames).toContain("Bob");
    });

    test("GET /students/:id - Should get student by ID", async () => {
        const res = await request(app).get(`/students/${student1Id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", student1Id);
        expect(res.body).toHaveProperty("name", "Alice");
        expect(res.body).toHaveProperty("id", "111111");
    });

    test("PUT /students/:id - Should update a student", async () => {
        const newName = "Alice Updated";
        const res = await request(app).put(`/students/${student1Id}`).send({
            name: newName,
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", student1Id);
        expect(res.body).toHaveProperty("name", newName);

        const verifyRes = await request(app).get(`/students/${student1Id}`);
        expect(verifyRes.body).toHaveProperty("name", newName);
    });

    test("DELETE /students/:id - Should delete a student", async () => {
        const res = await request(app).delete(`/students/${student2Id}`);
        expect(res.statusCode).toEqual(200);

        const verifyRes = await request(app).get(`/students/${student2Id}`);
        expect(verifyRes.statusCode).toEqual(404);
    });
});

describe("Post and Comment API Tests", () => {
    let post1Id: string;
    let post2Id: string;
    let comment1Id: string;
    let comment2Id: string;

    // Add initial data for posts and comments
    beforeAll(async () => {
        const post1 = await request(app).post("/posts").send({
            title: "Post 1",
            content: "Content of post 1",
            sender: "User1",
        });
        post1Id = post1.body._id;

        const post2 = await request(app).post("/posts").send({
            title: "Post 2",
            content: "Content of post 2",
            sender: "User2",
        });
        post2Id = post2.body._id;

        const comment1 = await request(app).post("/comments").send({
            postId: post1Id,
            text: "Comment 1 on post 1",
            sender: "User3",
        });
        comment1Id = comment1.body._id;

        const comment2 = await request(app).post("/comments").send({
            postId: post1Id,
            text: "Comment 2 on post 1",
            sender: "User4",
        });
        comment2Id = comment2.body._id;
    });

    // --- POST Tests ---
    test("GET /posts - Should get all posts", async () => {
        const res = await request(app).get("/posts");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        
        // Explicitly type posts
        const posts: IPost[] = res.body;
        expect(posts.length).toBeGreaterThanOrEqual(2);
    });
    

    test("GET /posts/:id - Should get post by ID", async () => {
        const res = await request(app).get(`/posts/${post1Id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", post1Id);
        expect(res.body).toHaveProperty("title", "Post 1");
    });

    test("PUT /posts/:id - Should update a post", async () => {
        const updatedTitle = "Updated Post 1";
        const res = await request(app).put(`/posts/${post1Id}`).send({
            title: updatedTitle,
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", post1Id);
        expect(res.body).toHaveProperty("title", updatedTitle);
    });

    test("DELETE /posts/:id - Should delete a post", async () => {
        const res = await request(app).delete(`/posts/${post2Id}`);
        expect(res.statusCode).toEqual(200);

        const verifyRes = await request(app).get(`/posts/${post2Id}`);
        expect(verifyRes.statusCode).toEqual(404);
    });

    // --- COMMENT Tests ---
    test("GET /comments - Should get all comments", async () => {
        const res = await request(app).get("/comments");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        
        // Explicitly type comments
        const comments: IComment[] = res.body;
        expect(comments.length).toBeGreaterThanOrEqual(2);
    });
    

    test("GET /comments/post/:postId - Should get comments by post ID", async () => {
        const res = await request(app).get(`/comments/post/${post1Id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    test("PUT /comments/:id - Should update a comment", async () => {
        const updatedText = "Updated Comment 1";
        const res = await request(app).put(`/comments/${comment1Id}`).send({
            text: updatedText,
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", comment1Id);
        expect(res.body).toHaveProperty("text", updatedText);
    });

    test("DELETE /comments/:id - Should delete a comment", async () => {
        const res = await request(app).delete(`/comments/${comment2Id}`);
        expect(res.statusCode).toEqual(200);

        const verifyRes = await request(app).get(`/comments/${comment2Id}`);
        expect(verifyRes.statusCode).toEqual(404);
    });
});
