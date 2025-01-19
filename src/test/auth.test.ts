import mongoose from "mongoose";
import request from "supertest";
import app from "../app";
import Users from "../models/user_model";
import postModel from "../models/post";

beforeAll(async () => {
    const dbURI = process.env.dbURI;
    if (!dbURI) {
        throw new Error("Database connection string (dbURI) is not defined");
    }
    await mongoose.connect(dbURI);
    await Users.deleteMany();
    await postModel.deleteMany();
});

afterAll(async () => {
    await mongoose.disconnect();
});

type UserInfo = {
    email: string;
    password: string;
    username: string;
    accessToken?: string;
    refreshToken?: string;
    _id?: string;
};

const userInfo: UserInfo = {
    email: "maxspector@gmail.com",
    password: "123456",
    username: "maxspectorr",
};

describe("Auth Tests", () => {
    test("Auth Registration", async () => {
        const response = await request(app).post("/auth/register").send(userInfo);
        expect(response.statusCode).toBe(200);
        expect(response.body.user).toBeDefined();
        expect(response.body.user.username).toBe(userInfo.username);
    });

    test("Auth Registration fail (duplicate email)", async () => {
        const response = await request(app).post("/auth/register").send(userInfo);
        expect(response.statusCode).not.toBe(200);
    });

    test("Auth Login", async () => {
        const loginResponse = await request(app).post("/auth/login").send({
            email: userInfo.email,
            password: userInfo.password,
        });
        expect(loginResponse.statusCode).toBe(200);

        const { accessToken, refreshToken, _id, username } = loginResponse.body;
        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
        expect(_id).toBeDefined();
        expect(username).toBe(userInfo.username);

        userInfo.accessToken = accessToken;
        userInfo.refreshToken = refreshToken;
        userInfo._id = _id;
    });

    test("Auth Login fail (invalid password)", async () => {
        const loginResponse = await request(app).post("/auth/login").send({
            email: userInfo.email,
            password: userInfo.password + "1",
        });
        expect(loginResponse.statusCode).not.toBe(200);
    });

    test("Ensure tokens are unique", async () => {
        const loginResponse1 = await request(app).post("/auth/login").send(userInfo);
        const loginResponse2 = await request(app).post("/auth/login").send(userInfo);
        expect(loginResponse1.body.accessToken).not.toBe(loginResponse2.body.accessToken);
        expect(loginResponse1.body.refreshToken).not.toBe(loginResponse2.body.refreshToken);
    });

    test("Get protected API (unauthorized)", async () => {
        const response = await request(app).post("/posts").send({
            title: "Unauthorized Post",
            content: "This should fail",
        });
        expect(response.statusCode).toBe(401);
    });

    test("Get protected API (authorized)", async () => {
        const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.accessToken}`)
            .send({
                title: "Authorized Post",
                content: "This should succeed",
            });
        expect(response.statusCode).toBe(201);
    });

    test("Get protected API (invalid token)", async () => {
        const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.accessToken}1`)
            .send({
                title: "Invalid Token Post",
                content: "This should fail",
            });
        expect(response.statusCode).toBe(403);
    });

    test("Refresh token", async () => {
        const refreshResponse = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken: userInfo.refreshToken });
        expect(refreshResponse.statusCode).toBe(200);
        expect(refreshResponse.body.accessToken).toBeDefined();
        expect(refreshResponse.body.refreshToken).toBeDefined();
        userInfo.accessToken = refreshResponse.body.accessToken;
        userInfo.refreshToken = refreshResponse.body.refreshToken;
    });

    test("Logout", async () => {
        const logoutResponse = await request(app)
            .post("/auth/logout")
            .send({ refreshToken: userInfo.refreshToken });
        expect(logoutResponse.statusCode).toBe(200);

        const refreshResponse = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken: userInfo.refreshToken });
        expect(refreshResponse.statusCode).toBe(400);
    });

    test("Prevent multiple refresh token usage", async () => {
        const loginResponse = await request(app).post("/auth/login").send(userInfo);
        const initialRefreshToken = loginResponse.body.refreshToken;

        const firstRefresh = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken: initialRefreshToken });
        expect(firstRefresh.statusCode).toBe(200);

        const reusedRefresh = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken: initialRefreshToken });
        expect(reusedRefresh.statusCode).toBe(400);
    });

    test("Timeout refresh token (simulate expiration)", async () => {
        const loginResponse = await request(app).post("/auth/login").send(userInfo);
        const refreshToken = loginResponse.body.refreshToken;

        const refreshResponse = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken });
        expect(refreshResponse.statusCode).toBe(200);
    });
});
