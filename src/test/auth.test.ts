import mongoose from "mongoose";
import request from "supertest";
import app from "../app";

beforeAll(async () => {
    const dbURI = process.env.dbURI;
    if (!dbURI) {
        throw new Error("Database connection string (dbURI) is not defined");
    }
    await mongoose.connect(dbURI);
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
        const response = await request(app).post("/auth/register").send(userInfo); // Send userInfo directly
        console.log(response.body); // Debugging
        expect(response.statusCode).toBe(200);
    });

    test("Auth Login", async () => {
        const loginResponse = await request(app).post("/auth/login").send(userInfo); // Send userInfo directly
        console.log(loginResponse.body); // Debugging response body

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token; // Access token from response body
        expect(token).toBeDefined()

        const userId = loginResponse.body._id; // Access _id from response body
        expect(userId).toBeDefined()

        // Save the token and _id to the userInfo object
        userInfo.token = token;
        userInfo._id = userId;
    });

    test("Get protected API", async () => {
        // First request: Without Authorization
        const response = await request(app)
            .post("/posts")
            .send({
                owner: userInfo._id,
                title: "My First Post",
                content: "This is my first post",
            });
        expect(response.statusCode).not.toBe(201); // Ensure unauthorized access is denied
    
        // Second request: With Authorization
        const response2 = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${userInfo.token}`) // Correct placement of .set()
            .send({
                owner: userInfo._id,
                title: "My First Post",
                content: "This is my first post",
            });
        expect(response2.statusCode).toBe(201); // Ensure authorized access is successful
    });


});
