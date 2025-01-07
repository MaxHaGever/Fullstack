import dotenv from "dotenv";
import express, { Application } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import studentRoutes from "./routes/student_routes";

dotenv.config();

const dbURI = process.env.dbURI;

if (!dbURI) {
    throw new Error("Database connection string (dbURI) is not defined");
}

console.log("Starting app setup...");

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load routes
app.use("/students", studentRoutes);

// Connect to the database
mongoose
    .connect(dbURI, {})
    .then(() => {
        console.log("DB connected");
    })
    .catch((err) => {
        console.error("DB connection error:", err);
        process.exit(1); // Exit if the DB connection fails
    });

export default app;
