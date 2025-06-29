import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import { createTask, validate } from "../../middleWare/validators.js";
import authorizeRoles from "../../middleWare/roleMiddleware.js";
import verifyUser from "../../middleWare/verifyMiddleware.js";
dotenv.config();

const router = express.Router();

// Create task for assine task  ==========>

router.post("/create/task", createTask, validate, async (req, res) => {
  const {
    task_name,
    task_description,
    project_id,
    tag_user_id,
    status_id,
    hours,
    start_date,
    end_date,
  } = req.body;

  try {
    const db = await connectToDatabase();

    // Validate required fields
    if (
      !task_name ||
      !project_id ||
      !tag_user_id ||
      !hours ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate task
    const [taskExist] = await db.query(
      "SELECT * FROM trn_task_details WHERE task_name = ? AND project_id = ?",
      [task_name, project_id]
    );

    if (taskExist.length > 0) {
      return res
        .status(409)
        .json({ message: "Similar task details already exist" });
    }

    // Insert task into database
    await db.query(
      `INSERT INTO trn_task_details (
        task_name,
        task_description,
        project_id,
        tag_user,
        status,
        hours,
        start_date,
        end_date
      ) VALUES (?, ?,?, ?, ?, ?, ?, ?)`,
      [
        task_name,
        task_description || null,
        project_id,
        tag_user_id,
        status_id || null,
        hours,
        start_date,
        end_date,
      ]
    );

    return res.status(201).json({ message: "Task created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Fetch all task data ========>

router.get(
  "/fetch/task",
  verifyUser,
  authorizeRoles("Admin", "Manager"),
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

      const [fetchAllTask] = await db.query(`
        
        SELECT 
          trn_task_details.id,
          trn_task_details.status AS status_id,
          trn_task_details.tag_user AS tag_user_id,
          trn_task_details.project_id ,
          trn_task_details.task_name,
          trn_task_details.task_description,
          mst_projects_details.project_name AS project,
          tag_user.name AS tag_user,
          mst_status_details.status,
          trn_task_details.hours,
          trn_task_details.start_date,
          trn_task_details.end_date,
          trn_task_details.created_by,
          trn_task_details.created_at,
          trn_task_details.updated_by,
          trn_task_details.updated_at
        FROM trn_task_details
        LEFT JOIN mst_projects_details 
          ON mst_projects_details.id = trn_task_details.project_id
        LEFT JOIN mst_employee_details AS tag_user
          ON tag_user.id = trn_task_details.tag_user
        LEFT JOIN mst_status_details
          ON mst_status_details.id = trn_task_details.status;
      `);

      // send responce as json
      return res.status(200).json({ task: fetchAllTask });
    } catch (error) {
      console.error("Error fetching Task data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// Update Task Data ================>

router.put("/edit/task/:id", async (req, res) => {
  const task_id = req.params.id;

  if (!task_id) {
    return res.status(400).json({ message: "Task ID is required" });
  }

  // Retrieve data from body
  const {
    task_name,
    task_description,
    project_id,
    tag_user_id,
    status_id,
    hours,
    start_date,
    end_date,
  } = req.body;

  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Check if the employee exists
    const [taskExist] = await db.query(
      "SELECT * FROM trn_task_details WHERE id = ?",
      [task_id]
    );

    if (taskExist.length === 0) {
      return res.status(404).json({ message: "Task does not exist" });
    }

    // Update only provided fields
    await db.query(
      `UPDATE trn_task_details 
           SET task_name = COALESCE(?, task_name), 
               task_description = COALESCE(?, task_description),
               project_id = COALESCE(?, project_id),
               tag_user = COALESCE(?, tag_user),
               status = COALESCE(?, status),
               hours = COALESCE(?, hours),
               start_date = COALESCE(?, start_date),
               end_date = COALESCE(? , end_date)
           WHERE id = ?`,

      [
        task_name,
        task_description,
        project_id,
        tag_user_id,
        status_id,
        hours,
        start_date,
        end_date,
        task_id,
      ]
    );

    return res
      .status(200)
      .json({ message: "Task Details updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Delete task data =======================>

router.delete("/delete/task/:id", async (req, res) => {
  const task_id = req.params.id;

  if (!task_id) {
    return res.status(400).json({ message: "Task ID is required" });
  }

  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Check if the task exists
    const [TaskExist] = await db.query(
      "SELECT * FROM trn_task_details WHERE id = ?",
      [task_id]
    );

    if (TaskExist.length === 0) {
      return res.status(404).json({ message: "Task does not exist" });
    }

    // Update only provided fields
    await db.query(`DELETE from trn_task_details WHERE id = ?`, [task_id]);

    return res.status(200).json({ message: "Task deleted successfully done " });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Fetch status which use assignd task  =====>

router.get("/fetch/task-Status", async (req, res) => {
  try {
    const db = await connectToDatabase();

    // Fetch all department
    const [fetchAllStatus] = await db.query(
      `SELECT *  FROM mst_status_details`
    );

    // send responce as json
    return res.status(200).json({ statusData: fetchAllStatus });
  } catch (error) {
    console.error("Error fetching Task status data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

export default router;
