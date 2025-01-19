import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import Users from "../models/user_model"
import postModel from "../models/post"


beforeAll(async () => {
    const dbURI = process.env.dbURI;
    if (!dbURI) {
        throw new Error("Database connection string (dbURI) is not defined");
    }
    await mongoose.connect(dbURI);
    await Users.deleteMany()
    await postModel.deleteMany()
});

afterAll(async () => {
    await mongoose.disconnect();
});

type UserInfo = {
    email: string;
    password: string;
    accessToken?: string;
    refreshToken?: string;
    _id?: string;
};

const userInfo: UserInfo = {
    email: "maxspector@gmail.com",
    password: "123456",
};

describe("Auth Tests", () => {
    test("Auth Registration", async () => {
        const response = await request(app).post("/auth/register").send(userInfo);
        expect(response.statusCode).toBe(200);
    });

    test("Auth Registration fail", async () => {
        const response = await request(app).post("/auth/register").send(userInfo);
        expect(response.statusCode).not.toBe(200);
    });
    
    test("Auth Login", async () => {
        const loginResponse = await request(app).post("/auth/login").send(userInfo);
   
        expect(loginResponse.statusCode).toBe(200);
    
        const accessToken = loginResponse.body.accessToken;
        expect(accessToken).toBeDefined();
        const refreshToken = loginResponse.body.refreshToken;
        expect(refreshToken).toBeDefined();
    
        const userId = loginResponse.body._id;
        expect(userId).toBeDefined();
    
        userInfo.accessToken = accessToken;
        userInfo.refreshToken = refreshToken;
        userInfo._id = userId;
    });
    
    test("Get protected API", async () => {
        // First request: Without Authorization
        const response = await request(app)
            .post("/posts")
            .send({
                sender: "invalid",
                title: "My First Post",
                content: "This is my first post",
            });
        console.log("Unauthorized Response Status:", response.statusCode); // Debug status code
        console.log("Unauthorized Response Body:", response.body); // Debug response body
        expect(response.statusCode).not.toBe(201);
    
        // Second request: With Authorization
        const response2 = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.accessToken}`)
            .send({
                sender: "invalid",
                title: "My First Post",
                content: "This is my first post",
            });
        console.log("Authorized Response Status:", response2.statusCode); // Debug status code
        console.log("Authorized Response Body:", response2.body); // Debug response body
        expect(response2.statusCode).toBe(201);
    });

    test("Get protected API invalid token", async () => {
        // First request: Without Authorization
        const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.accessToken+ '1'}`)
            .send({
                sender: userInfo._id,
                title: "My First Post",
                content: "This is my first post",
            });
        console.log("Unauthorized Response Status:", response.statusCode); // Debug status code
        console.log("Unauthorized Response Body:", response.body); // Debug response body
        expect(response.statusCode).not.toBe(201);
    });

    test("Refresh token", async () => {
        const refreshResponse = await request(app).post("/auth/refresh").send({ refreshToken: userInfo.refreshToken });
        expect(refreshResponse.statusCode).toBe(200);
        expect(refreshResponse.body.accessToken).toBeDefined();
        expect(refreshResponse.body.refreshToken).toBeDefined(); 
        userInfo.accessToken = refreshResponse.body.accessToken;
        userInfo.refreshToken = refreshResponse.body.refreshToken;
    });

    test("Logout", async () => {
        const logoutResponse = await request(app).post("/auth/logout").send({ refreshToken: userInfo.refreshToken });
        expect(logoutResponse.statusCode).toBe(200);
        const refreshResponse = await request(app).post("/auth/refresh").send({ refreshToken: userInfo.refreshToken });
        expect(refreshResponse.statusCode).not.toBe(200);
    });

    test("Refresh tokenm multiuple usage", async () => {
        //login - get refresh token
        const refreshResponse = await request(app).post("/auth/login").send({ email: userInfo.email, password: userInfo.password });
        expect(refreshResponse.statusCode).toBe(200);
        expect(refreshResponse.body.accessToken).toBeDefined();
        expect(refreshResponse.body.refreshToken).toBeDefined(); 
        userInfo.accessToken = refreshResponse.body.accessToken;
        userInfo.refreshToken = refreshResponse.body.refreshToken;
        //first usage of token
        const response2 = await request(app).post("/auth/refresh").send({ refreshToken: userInfo.refreshToken });
        expect(response2.statusCode).toBe(200);
        const newRefreshToken = response2.body.refreshToken;
        //2nd usage of refresh token expectin to fail
        const response3 = await request(app).post("/auth/refresh").send({ refreshToken: userInfo.refreshToken });   
        expect(response3.statusCode).not.toBe(200);
        //try the new refresh token expect to fail
        const response4 = await request(app).post("/auth/refresh").send({ refreshToken: newRefreshToken });   
        expect(response4.statusCode).not.toBe(200);
    });
});
