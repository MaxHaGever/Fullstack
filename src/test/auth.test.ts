import mongoose from "mongoose";
import request from "supertest";
import Student from "../../src/models/student"; // Adjust path if needed
import app from "../app"

beforeAll(async () => {
    await mongoose.connect(process.env.dbURI)
    await Student.deleteMany(); // Clean the database before tests
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
        const studentNames: string[] = res.body.map((student) => student.name);
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
