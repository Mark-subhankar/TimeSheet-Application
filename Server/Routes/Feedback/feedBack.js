import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import { submitFeedback, validate } from "../../middleWare/validators.js";
import authorizeRoles from "../../middleWare/roleMiddleware.js";
import verifyUser from "../../middleWare/verifyMiddleware.js";

dotenv.config();

const router = express.Router();

router.post(
  "/submit/feedback",
  verifyUser,
  authorizeRoles("Admin", "Manager", "User"),
  submitFeedback,
  validate,

  async (req, res) => {
    // Retrive data from body
    const { description } = req.body;

    try {
      // connect to database
      const db = await connectToDatabase();

      // Check if all fields are provided
      if (!description) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Save data into table
      await db.query(
        "INSERT INTO mst_feedback_details(description,created_by) VALUES(?,?)",
        [description, req.userEmail]
      );

      return res.status(201).json({ message: "Thank you for your feedback" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

router.get(
  "/fetch/feedback",
  verifyUser,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      // Database connection
      const db = await connectToDatabase();

      // Fetch the employee by ID
      const [rows] = await db.query(
        "SELECT * FROM mst_employee_details WHERE id = ?",
        [req.userId]
      );

      // if row not exist
      if (rows.length === 0) {
        return res.status(404).json({ message: "Employee does not exist" });
      }

      // Fetch all department
      const [fetchAllFeedback] = await db.query(
        "SELECT * FROM mst_feedback_details"
      );

      // send responce as json
      return res.status(200).json({ feedback: fetchAllFeedback });
    } catch (error) {
      console.error("Error fetching feedback data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
