"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const student_1 = require("../controllers/student");
const router = express_1.default.Router();
// Define routes
router.post("/", student_1.createStudent);
router.get("/", student_1.getStudents);
router.get("/:id", student_1.getStudentById);
router.put("/:id", student_1.updateStudent);
router.delete("/:id", student_1.deleteStudent);
exports.default = router;
//# sourceMappingURL=student_routes.js.map