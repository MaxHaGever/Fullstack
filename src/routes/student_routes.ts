import express, { Router } from "express";
import {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
} from "../controllers/student";

const router: Router = express.Router();

// Define routes
router.post("/", createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
