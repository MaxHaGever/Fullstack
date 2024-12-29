
const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const postModel = require("../models/post_model");

const testPosts = require("./test_posts.json");

beforeAll( async () =>{
    console.log("Before all test")
    await postModel.deleteMany();
});

afterAll(() => {
    console.log("After all test")
    mongoose.connection.close();
});

describe("Posts Test", () => {
    test("DB Empty test", async () => {
        console.log("Test 1");
        const response = await request(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    })

    test("Test create new post", async () => {
        const response = await request(app).post("/posts").send(testPosts[0]);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(testPosts[0].title);
        expect(response.body.content).toBe(testPosts[0].content);
        expect(response.body.owner).toBe(testPosts[0].owner);
    })

    test("Test create new post 2", async () => {
        const response = await request(app).post("/posts").send(testPosts[1]);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(testPosts[1].title);
        expect(response.body.content).toBe(testPosts[1].content);
        expect(response.body.owner).toBe(testPosts[1].owner);
    })    

    test("DB Full", async () => {
        console.log("Test 1");
        const response = await request(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    })
});