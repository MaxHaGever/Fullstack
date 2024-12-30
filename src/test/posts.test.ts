import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/post_model";
import { Express } from "express";

const testPosts = [
    {
        "title": "Test Post 1",
        "content": "Test content 1",
        "owner": "Max"
    },
    {
        "title": "Test Post 2",
        "content": "Test content 2",
        "owner": "Max2"      
    }
]

let app:Express;

beforeAll(async () => {
    console.log("beforeAll");
    app = await initApp();
    await postModel.deleteMany();
})

afterAll((done) => {
    console.log("afterAll");
    mongoose.connection.close();
    done();
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