import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import verifyUser from "../../middleWare/verifyMiddleware.js";
import {
  createProject,
  updateProject,
  validate,
} from "../../middleWare/validators.js";
import authorizeRoles from "../../middleWare/roleMiddleware.js";

dotenv.config();

// invok router
const router = express.Router();

// Create Project ==============>

router.post("/create/project", createProject, validate, async (req, res) => {
  // Retrive data from body
  const { project_name, project_description, manager_id } = req.body;

  try {
    // connect to database
    const db = await connectToDatabase();

    // Check if all fields are provided
    if (!project_name || !manager_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if project already exists
    const [projectExist] = await db.query(
      "SELECT * FROM mst_projects_details WHERE project_name = ?",
      [project_name]
    );

    if (projectExist.length > 0) {
      return res
        .status(403)
        .json({ message: "Similar projects already exists" });
    }

    // Save data into table
    await db.query(
      "INSERT INTO mst_projects_details(project_name,project_description ,manager_id) VALUES(?, ?,?)",
      [project_name, project_description, manager_id]
    );

    return res.status(201).json({ message: "Project created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Fetch Single project by id =======>

router.get("/fetch/project/:id", async (req, res) => {
  const project_id = req.params.id;

  if (!project_id) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  try {
    // Database connection
    const db = await connectToDatabase();

    // Fetch single project
    const [fetchAllProject] = await db.query(
      "SELECT * FROM mst_projects_details where id = ?",
      [project_id]
    );

    // send responce as json
    return res.status(200).json({ project: fetchAllProject });
  } catch (error) {
    console.error("Error fetching Project data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Fetch all project ===============>

router.get(
  "/fetch/projects",
  verifyUser,
  authorizeRoles("Admin", "Manager"),
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

      // Fetch all project
      const [fetchAllProject] = await db.query(
        `
        SELECT
        mst_projects_details.id,
        mst_projects_details.project_name,mst_projects_details.project_description,
        mst_projects_details.created_by,mst_projects_details.created_at,
        mst_projects_details.updated_by,mst_projects_details.updated_at,
        mst_projects_details.manager_id,
        mst_employee_details.name as employee_name
        FROM mst_projects_details
        LEFT JOIN mst_employee_details
        ON mst_employee_details.ID =mst_projects_details.manager_id ;
        
        `
      );

      // send responce as json
      return res.status(200).json({ project: fetchAllProject });
    } catch (error) {
      console.error("Error fetching Project data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// fetch all project data based on role = "Admin", "Manager", "User" ========>

router.get(
  "/fetch/projects-data",
  verifyUser,
  authorizeRoles("Admin", "Manager", "User"),
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

      // Fetch all project
      const [fetchAllProject] = await db.query(
        "SELECT id , project_name FROM mst_projects_details"
      );

      // send responce as json
      return res.status(200).json({ project: fetchAllProject });
    } catch (error) {
      console.error("Error fetching Project data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// Edit particular project ==============>

router.put("/edit/project/:id", updateProject, validate, async (req, res) => {
  const project_id = req.params.id;

  if (!project_id) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  // Retrieve data from body
  const { project_name, project_description,manager_id } = req.body;

  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Check project exists
    const [projectExist] = await db.query(
      "SELECT * FROM mst_projects_details WHERE id = ?",
      [project_id]
    );

    if (projectExist.length === 0) {
      return res.status(404).json({ message: "Project does not exist" });
    }

    // Update only provided fields
    await db.query(
      `UPDATE mst_projects_details 
         SET project_name = COALESCE(?, project_name), 
             project_description = COALESCE(?, project_description),
             manager_id = COALESCE(?, manager_id)
         WHERE id = ?`,
      [project_name, project_description, manager_id,project_id]
    );

    return res.status(200).json({ message: "Project updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Delete project ==================>

router.delete(
  "/delete/project/:id",
  // verifyUser,
  // authorizeRoles("Admin"),
  async (req, res) => {
    const project_id = req.params.id;

    if (!project_id) {
      return res.status(400).json({ message: "project ID is required" });
    }

    try {
      // Connect to the database
      const db = await connectToDatabase();

      // Check if the department exists
      const [projectExist] = await db.query(
        "SELECT * FROM mst_projects_details WHERE id = ?",
        [project_id]
      );

      if (projectExist.length === 0) {
        return res.status(404).json({ message: "Project does not exist" });
      }

      // Update only provided fields
      await db.query(`DELETE from mst_projects_details WHERE id = ?`, [
        project_id,
      ]);

      return res
        .status(200)
        .json({ message: "project deleted successfully done " });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

export default router;
