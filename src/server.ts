import express, { Express } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postsRoutes from "./Routes/Posts_routes";
import bodyParser from "body-parser";

dotenv.config();

const app = express();

const initApp = async (): Promise<Express> => {
  return new Promise<Express>(async (resolve, reject) => {
    try {
      // Check for DB_CONNECTION environment variable
      if (!process.env.DB_CONNECTION) {
        console.error("DB_CONNECTION is not set");
        reject(new Error("DB_CONNECTION is not set"));
        return;
      }

      // Connect to the database
      await mongoose.connect(process.env.DB_CONNECTION);
      console.log("Connected to DB");

      // Set up middleware
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));

      // Set up routes
      app.use("/posts", postsRoutes);

      console.log("initApp finished successfully");
      resolve(app);
    } catch (error) {
      console.error("Error during app initialization:", error);
      reject(error);
    }
  });
};

export default initApp;
