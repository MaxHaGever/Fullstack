const appPromise = require("../app");
const mongoose = require("mongoose");
const request = require("supertest");
const Student = require("../../models/student");

let app;

beforeAll(async () => {
    app = await appPromise;
    await Student.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Student API Tests", () => {
    let student1Id;
    let student2Id;

    // Insert a few students
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
        expect(res.body.length).toBeGreaterThanOrEqual(2); // At least 2 students
        const studentNames = res.body.map(student => student.name);
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

        // Verify update
        const verifyRes = await request(app).get(`/students/${student1Id}`);
        expect(verifyRes.body).toHaveProperty("name", newName);
    });

    test("DELETE /students/:id - Should delete a student", async () => {
        const res = await request(app).delete(`/students/${student2Id}`);
        expect(res.statusCode).toEqual(200);

        // Verify deletion
        const verifyRes = await request(app).get(`/students/${student2Id}`);
        expect(verifyRes.statusCode).toEqual(404);
    });

    test("POST /students - Insert multiple students, then GET all", async () => {
        await request(app).post("/students").send({
            id: "333333",
            name: "Charlie",
        });
        await request(app).post("/students").send({
            id: "444444",
            name: "Diana",
        });

        const res = await request(app).get("/students");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        const studentNames = res.body.map(student => student.name);
        expect(studentNames).toContain("Charlie");
        expect(studentNames).toContain("Diana");
    });
});
