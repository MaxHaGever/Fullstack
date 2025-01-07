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
exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.getStudents = exports.createStudent = void 0;
const student_1 = __importDefault(require("../models/student"));
// Create a new student
const createStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = new student_1.default(req.body);
        yield student.save();
        res.status(201).json(student);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        }
        else {
            res.status(400).json({ error: "Unknown error occurred" });
        }
    }
});
exports.createStudent = createStudent;
// Get all students
const getStudents = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield student_1.default.find();
        res.json(students);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(404).json({ error: err.message });
        }
        else {
            res.status(404).json({ error: "Unknown error occurred" });
        }
    }
});
exports.getStudents = getStudents;
// Get a student by ID
const getStudentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = yield student_1.default.findById(req.params.id);
        if (!student) {
            res.status(404).json({ error: "Student not found" });
            return;
        }
        res.json(student);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(404).json({ error: err.message });
        }
        else {
            res.status(404).json({ error: "Unknown error occurred" });
        }
    }
});
exports.getStudentById = getStudentById;
// Update a student by ID
const updateStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = yield student_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!student) {
            res.status(404).json({ error: "Student not found" });
            return;
        }
        res.json(student);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        }
        else {
            res.status(400).json({ error: "Unknown error occurred" });
        }
    }
});
exports.updateStudent = updateStudent;
// Delete a student by ID
const deleteStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = yield student_1.default.findByIdAndDelete(req.params.id);
        if (!student) {
            res.status(404).json({ error: "Student not found" });
            return;
        }
        res.json({ message: "Student deleted successfully" });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        }
        else {
            res.status(400).json({ error: "Unknown error occurred" });
        }
    }
});
exports.deleteStudent = deleteStudent;
//# sourceMappingURL=student.js.map