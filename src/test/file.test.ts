import request from "supertest";
import app from "../app";
import mongoose from "mongoose";

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

describe("File Tests", () => {
    test("upload file", async () => {
        const filePath = `${__dirname}/test_file.txt`;
        console.log(`Uploading file: ${filePath}`);

        try {
            const response = await request(app)
                .post("/file")
                .attach("file", filePath);

            expect(response.statusCode).toEqual(200);
            
            let url = response.body.url;
            console.log(`Uploaded file URL: ${url}`);

            // Extract relative path correctly
            const urlObject = new URL(url);
            const relativePath = urlObject.pathname;

            // Fetch the uploaded file
            const res = await request(app).get(relativePath);
            expect(res.statusCode).toEqual(200);
        } catch (err) {
            console.error("Test failed:", err);
            expect(1).toEqual(2);
        }
    });
});
