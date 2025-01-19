import dotenv from "dotenv";
import express, { Application } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import postRoutes from "./routes/post_routes"; // Import Post routes
import commentRoutes from "./routes/comment_routes"; // Import Comment routes
import authRoutes from "./routes/auth_routes"
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app: Application = express();

const options = {
    swaggerDefinition: { 
        openapi: "3.0.0",
        info: {
            title: "Web dev 2025 REST API",
            version: "1.0.0",
            description: "REST server including authentication",
        },
        servers: [{ url: "http://localhost:3004" }],
    },
    apis: ["./src/routes/*.ts"],
};

const specs = swaggerJsdoc(options); 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


dotenv.config();

const dbURI = process.env.dbURI;

if (!dbURI) {
    throw new Error("Database connection string (dbURI) is not defined");
}



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/auth", authRoutes); 

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
