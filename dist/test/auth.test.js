"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const student_1 = __importDefault(require("../../src/models/student")); // Adjust path if needed
const app_1 = __importDefault(require("../app"));
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(process.env.dbURI);
    yield student_1.default.deleteMany(); // Clean the database before tests
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
}));
describe("Student API Tests", () => {
    let student1Id;
    let student2Id;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const student1 = yield (0, supertest_1.default)(app_1.default).post("/students").send({
            id: "111111",
            name: "Alice",
        });
        student1Id = student1.body._id;
        const student2 = yield (0, supertest_1.default)(app_1.default).post("/students").send({
            id: "222222",
            name: "Bob",
        });
        student2Id = student2.body._id;
    }));
    test("GET /students - Should get all students", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get("/students");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        const studentNames = res.body.map((student) => student.name);
        expect(studentNames).toContain("Alice");
        expect(studentNames).toContain("Bob");
    }));
    test("GET /students/:id - Should get student by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get(`/students/${student1Id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", student1Id);
        expect(res.body).toHaveProperty("name", "Alice");
        expect(res.body).toHaveProperty("id", "111111");
    }));
    test("PUT /students/:id - Should update a student", () => __awaiter(void 0, void 0, void 0, function* () {
        const newName = "Alice Updated";
        const res = yield (0, supertest_1.default)(app_1.default).put(`/students/${student1Id}`).send({
            name: newName,
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("_id", student1Id);
        expect(res.body).toHaveProperty("name", newName);
        const verifyRes = yield (0, supertest_1.default)(app_1.default).get(`/students/${student1Id}`);
        expect(verifyRes.body).toHaveProperty("name", newName);
    }));
    test("DELETE /students/:id - Should delete a student", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).delete(`/students/${student2Id}`);
        expect(res.statusCode).toEqual(200);
        const verifyRes = yield (0, supertest_1.default)(app_1.default).get(`/students/${student2Id}`);
        expect(verifyRes.statusCode).toEqual(404);
    }));
});
//# sourceMappingURL=auth.test.js.map