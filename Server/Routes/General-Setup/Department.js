import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import verifyUser from "../../middleWare/verifyMiddleware.js";
import {
  createDepartment,
  updateDepartment,
  validate,
} from "../../middleWare/validators.js"; 
import authorizeRoles from "../../middleWare/roleMiddleware.js";

dotenv.config();

// invok router
const router = express.Router();

// Create Department ==============>

router.post(
  "/create/department",
  createDepartment,
  validate,
  async (req, res) => {
    // Retrive data from body
    const { name, description } = req.body;

    try {
      // connect to database
      const db = await connectToDatabase();

      // Check if all fields are provided
      if (!name) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if dept already exists
      const [deptExist] = await db.query(
        "SELECT * FROM mst_department WHERE department_name = ?",
        [name]
      );

      if (deptExist.length > 0) {
        return res
          .status(403)
          .json({ message: "Similar department already exists" });
      }

      // Save data into table
      await db.query(
        "INSERT INTO mst_department(department_name,description) VALUES(?, ?)",
        [name, description]
      );

      return res
        .status(201)
        .json({ message: "Department created successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

// Fetch all department ============================>

router.get(
  "/fetch/department",
  verifyUser,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      // Database connection
      const db = await connectToDatabase();

      // check employee exist or not
      const [rows] = await db.query(
        "SELECT * FROM mst_employee_details WHERE id = ?",
        [req.userId]
      );

      // if row not exist
      if (rows.length === 0) {
        return res.status(404).json({ message: "Employee does not exist" });
      }

      // Fetch all department
      const [fetchAllDept] = await db.query("SELECT * FROM mst_department");

      // send responce as json
      return res.status(200).json({ departments: fetchAllDept });
    } catch (error) {
      console.error("Error fetching Department data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// Fetch Single Department ==========>

router.get("/fetch/department/:id", async (req, res) => {
  const department_id = req.params.id;

  if (!department_id) {
    return res.status(400).json({ message: "Department ID is required" });
  }

  try {
    // Database connection
    const db = await connectToDatabase();

    // Fetch single department
    const [fetchAllDept] = await db.query(
      "SELECT * FROM mst_department where id = ?",
      department_id
    );

    // send responce as json
    return res.status(200).json({ departments: fetchAllDept });
  } catch (error) {
    console.error("Error fetching Department data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Edit single department ============>

router.put(
  "/edit/department/:id",
  updateDepartment,
  validate,
  async (req, res) => {
    const department_id = req.params.id;

    if (!department_id) {
      return res.status(400).json({ message: "Department ID is required" });
    }

    // Retrieve data from body
    const { name, description } = req.body;

    try {
      // Connect to the database
      const db = await connectToDatabase();

      // Check if the department exists
      const [deptExist] = await db.query(
        "SELECT * FROM mst_department WHERE id = ?",
        [department_id]
      );

      if (deptExist.length === 0) {
        return res.status(404).json({ message: "Department does not exist" });
      }

      // Update only provided fields
      await db.query(
        `UPDATE mst_department 
           SET department_name = COALESCE(?, department_name), 
               description = COALESCE(?, description)
           WHERE id = ?`,
        [name, description, department_id]
      );

      return res
        .status(200)
        .json({ message: "Department updated successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

// Delete single department =================>

router.delete("/delete/department/:id", async (req, res) => {
  const department_id = req.params.id;

  if (!department_id) {
    return res.status(400).json({ message: "Department ID is required" });
  }

  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Check if the department exists
    const [deptExist] = await db.query(
      "SELECT * FROM mst_department WHERE id = ?",
      [department_id]
    );

    if (deptExist.length === 0) {
      return res.status(404).json({ message: "Department does not exist" });
    }

    // delete only provided fields
    await db.query(`DELETE from mst_department WHERE id = ?`, [department_id]);

    return res
      .status(200)
      .json({ message: "Department deleted successfully done " });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});
export default router;
