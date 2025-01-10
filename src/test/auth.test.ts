import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import Users from "../models/user_model"


beforeAll(async () => {
    const dbURI = process.env.dbURI;
    if (!dbURI) {
        throw new Error("Database connection string (dbURI) is not defined");
    }
    await mongoose.connect(dbURI);
    await Users.deleteMany()
});

afterAll(async () => {
    await mongoose.disconnect();
});

type UserInfo = {
    email: string;
    password: string;
    token?: string;
    _id?: string;
};

const userInfo: UserInfo = {
    email: "maxspector@gmail.com",
    password: "123456",
};

describe("Auth Tests", () => {
    test("Auth Registration", async () => {
        const response = await request(app).post("/auth/register").send(userInfo);
        console.log("Registration Response Body:", response.body); // Debug response body
        expect(response.statusCode).toBe(200);
    });
    
    test("Auth Login", async () => {
        const loginResponse = await request(app).post("/auth/login").send(userInfo);
        console.log("Login Response Status:", loginResponse.statusCode); // Debug status code
        console.log("Login Response Body:", loginResponse.body); // Debug response body
    
        expect(loginResponse.statusCode).toBe(200);
    
        const token = loginResponse.body.token;
        expect(token).toBeDefined();
    
        const userId = loginResponse.body._id;
        expect(userId).toBeDefined();
    
        console.log("Token from Login:", token); // Debug token
        console.log("User ID from Login:", userId); // Debug user ID
    
        userInfo.token = token;
        userInfo._id = userId;
    });
    
    test("Get protected API", async () => {
        // First request: Without Authorization
        const response = await request(app)
            .post("/posts")
            .send({
                sender: userInfo._id,
                title: "My First Post",
                content: "This is my first post",
            });
        console.log("Unauthorized Response Status:", response.statusCode); // Debug status code
        console.log("Unauthorized Response Body:", response.body); // Debug response body
        expect(response.statusCode).not.toBe(201);
    
        // Second request: With Authorization
        const response2 = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.token}`)
            .send({
                sender: userInfo._id,
                title: "My First Post",
                content: "This is my first post",
            });
        console.log("Authorized Response Status:", response2.statusCode); // Debug status code
        console.log("Authorized Response Body:", response2.body); // Debug response body
        expect(response2.statusCode).toBe(201);
    });


});
