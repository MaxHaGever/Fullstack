"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth_controller"));
const router = express_1.default.Router();
router.post("/register", (req, res) => {
    auth_controller_1.default.register(req, res);
});
router.post("/login", (req, res) => {
    auth_controller_1.default.login(req, res);
});
exports.default = router;
//# sourceMappingURL=auth_routes.js.map