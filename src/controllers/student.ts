import { Request, Response } from "express";
import Student, { IStudent } from "../models/student";

// Create a new student
export const createStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const student: IStudent = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: "Unknown error occurred" });
        }
    }
};

// Get all students
export const getStudents = async (_req: Request, res: Response): Promise<void> => {
    try {
        const students: IStudent[] = await Student.find();
        res.json(students);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(404).json({ error: err.message });
        } else {
            res.status(404).json({ error: "Unknown error occurred" });
        }
    }
};

// Get a student by ID
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const student: IStudent | null = await Student.findById(req.params.id);
        if (!student) {
            res.status(404).json({ error: "Student not found" });
            return;
        }
        res.json(student);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(404).json({ error: err.message });
        } else {
            res.status(404).json({ error: "Unknown error occurred" });
        }
    }
};

// Update a student by ID
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const student: IStudent | null = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!student) {
            res.status(404).json({ error: "Student not found" });
            return;
        }
        res.json(student);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: "Unknown error occurred" });
        }
    }
};

// Delete a student by ID
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const student: IStudent | null = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            res.status(404).json({ error: "Student not found" });
            return;
        }
        res.json({ message: "Student deleted successfully" });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: "Unknown error occurred" });
        }
    }
};
