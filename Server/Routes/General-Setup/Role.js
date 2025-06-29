import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import verifyUser from "../../middleWare/verifyMiddleware.js";
import {
  createRole,
  updateRole,
  validate,
} from "../../middleWare/validators.js";
import authorizeRoles from "../../middleWare/roleMiddleware.js";

dotenv.config();

// invok router
const router = express.Router();

// Create User Role ============>

router.post("/create/roles", createRole, validate, async (req, res) => {
  // Retrive data from body
  const { role, description } = req.body;

  try {
    const db = await connectToDatabase();

    // Check if all fields are provided
    if (!role) {
      return res.status(400).json({ message: "Role fields are required" });
    }

    // Check if role already exists
    const [roleExist] = await db.query(
      "SELECT * FROM mst_roles WHERE role = ?",
      [role]
    );

    if (roleExist.length > 0) {
      return res.status(403).json({ message: "Similar role already exists" });
    }

    // Save data into table
    await db.query("INSERT INTO mst_roles(role,description) VALUES(?, ?)", [
      role,
      description || null,
    ]);

    return res.status(201).json({ message: "Role created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Fetch all user roles =============>

router.get(
  "/fetch/roles",
  verifyUser,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const db = await connectToDatabase();

      // Fetch the employee by ID
      const [rows] = await db.query(
        "SELECT * FROM mst_employee_details WHERE id = ?",
        [req.userId]
      );

      // when row not exist
      if (rows.length === 0) {
        return res.status(404).json({ message: "Employee does not exist" });
      }

      // Fetch all roles
      const [fetchAllRoles] = await db.query("SELECT * FROM mst_roles");

      // send responce as json
      return res.status(200).json({ roles: fetchAllRoles });
    } catch (error) {
      console.error("Error fetching Roles data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// Fetch single roles ==================>

router.get("/fetch/roles/:id", async (req, res) => {
  const role_id = req.params.id;

  if (!role_id) {
    return res.status(400).json({ message: "Role ID is required" });
  }

  try {
    // Database connection
    const db = await connectToDatabase();

    // Fetch single role
    const [fetchAllRole] = await db.query(
      "SELECT * FROM mst_roles where id = ?",
      role_id
    );

    // send responce as json
    return res.status(200).json({ roles: fetchAllRole });
  } catch (error) {
    console.error("Error fetching Role data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Edit single role =========>

router.put("/edit/role/:id", updateRole, validate, async (req, res) => {
  const role_id = req.params.id;

  if (!role_id) {
    return res.status(400).json({ message: "Role ID is required" });
  }

  // Retrieve data from body
  const { role, description } = req.body;

  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Check if the department exists
    const [RoleExist] = await db.query("SELECT * FROM mst_roles WHERE id = ?", [
      role_id,
    ]);

    if (RoleExist.length === 0) {
      return res.status(404).json({ message: "Role does not exist" });
    }

    // Update only provided fields
    await db.query(
      `UPDATE mst_roles 
           SET role = COALESCE(?, role), 
               description = COALESCE(?, description)
           WHERE id = ?`,
      [role, description, role_id]
    );

    return res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Delete Particular role ==============>

router.delete("/delete/role/:id", async (req, res) => {
  const role_id = req.params.id;

  if (!role_id) {
    return res.status(400).json({ message: "Role ID is required" });
  }

  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Check role exists
    const [RoleExist] = await db.query("SELECT * FROM mst_roles WHERE id = ?", [
      role_id,
    ]);

    if (RoleExist.length === 0) {
      return res.status(404).json({ message: "Role does not exist" });
    }

    // Delete only provided fields
    await db.query(`DELETE from mst_roles WHERE id = ?`, [role_id]);

    return res.status(200).json({ message: "Role deleted successfully done " });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});
export default router;
