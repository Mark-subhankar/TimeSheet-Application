import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import {
  createTimesheet,
  updateTimesheet,
  validate,
} from "../../middleWare/validators.js";
import authorizeRoles from "../../middleWare/roleMiddleware.js";
import verifyUser from "../../middleWare/verifyMiddleware.js";
import multer from "multer";

dotenv.config();

const router = express.Router();

// ========== File Upload Setup ==========
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/images");
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({ storage: storage });

// Show assine task only authorize user =====>

router.get(
  "/fetch/assiged-task",
  verifyUser,
  authorizeRoles("Admin", "Manager", "User"),
  async (req, res) => {
    try {
      const db = await connectToDatabase();

      // Fetch the employee by ID
      const [rows] = await db.query(
        "SELECT * FROM mst_employee_details WHERE id = ?",
        [req.userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Employee does not exist" });
      }

      // Fetch tasks assigned to the employee with matching email
      const [fetchAllTask] = await db.query(
        `
        SELECT
          trn_task_details.id,
          trn_task_details.project_id,
          trn_task_details.status as status_id,
          trn_task_details.task_name,
          trn_task_details.task_description,
          mst_projects_details.project_name as project,
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
        LEFT JOIN mst_employee_details
          ON mst_employee_details.id = trn_task_details.tag_user
        LEFT JOIN mst_status_details
          ON mst_status_details.id = trn_task_details.status
        WHERE LOWER(mst_employee_details.email) = LOWER(?);
        `,
        [req.userEmail]
      );

      return res.status(200).json({ AssignedTask: fetchAllTask });
    } catch (error) {
      console.error("Error fetching Task data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// Fill/create Timesheet   ==============>

router.post(
  "/create/timesheet",
  createTimesheet,
  validate,
  verifyUser,
  authorizeRoles("Admin"),
  async (req, res) => {
    const { project_id, task_id, working_date, week_day, hours, description } =
      req.body;

    const created_by = req.userEmail;

    if (!project_id || !working_date || !week_day || !hours || !description) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    try {
      const db = await connectToDatabase();

      // Check for duplicate description
      const [existingTimesheet] = await db.query(
        "SELECT * FROM trn_timesheet_logs WHERE description = ?",
        [description]
      );

      if (existingTimesheet.length > 0) {
        return res
          .status(403)
          .json({ message: "Similar description already exists." });
      }

      // Insert timesheet record
      await db.query(
        `INSERT INTO trn_timesheet_logs 
        (project_id, task_id, work_date, week_day, hours_worked, description, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          project_id,
          task_id || null,
          working_date,
          week_day,
          hours,
          description,
          created_by,
        ]
      );

      return res
        .status(201)
        .json({ message: "Timesheet fill-up successfully" });
    } catch (error) {
      console.error("Error saving timesheet:", error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

// Fetch all timesheet data ===============>

router.get(
  "/fetch/timesheet-data",
  verifyUser,
  authorizeRoles("Admin", "Manager", "User"),
  async (req, res) => {
    try {
      const db = await connectToDatabase();

      // Fetch the employee by ID
      const [rows] = await db.query(
        "SELECT * FROM mst_employee_details WHERE id = ?",
        [req.userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Employee does not exist" });
      }

      const userEmail = rows[0].email; // Get email from DB for safety

      // Fetch all relevant timesheet data
      const [fetchAllTimesheet] = await db.query(
        `
        SELECT 
            trn_timesheet_logs.id,
            trn_timesheet_logs.project_id,
            trn_timesheet_logs.task_id,
            trn_task_details.task_name,
            mst_projects_details.project_name,
            trn_timesheet_logs.week_day,
            DATE_FORMAT(trn_timesheet_logs.work_date, '%d/%m/%Y') AS working_date,
            trn_timesheet_logs.hours_worked,
            trn_timesheet_logs.description,
            trn_timesheet_logs.created_by,
            trn_timesheet_logs.created_at
        FROM trn_timesheet_logs
        LEFT JOIN mst_projects_details 
            ON mst_projects_details.id = trn_timesheet_logs.project_id
        LEFT JOIN trn_task_details
            ON trn_task_details.id = trn_timesheet_logs.task_id
        LEFT JOIN mst_employee_details
            ON trn_task_details.tag_user = mst_employee_details.id
        WHERE 
            trn_timesheet_logs.status = 'U'
            AND LOWER(mst_employee_details.email) = LOWER(?)
        `,
        [userEmail]
      );

      return res.status(200).json({ TimesheetData: fetchAllTimesheet });
    } catch (error) {
      console.error("Error fetching Timesheet data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// Fetch all timesheet data which is approved / rejected ===============>

router.get(
  "/fetch/last-week",
  verifyUser,
  authorizeRoles("Admin", "Manager", "User"),
  async (req, res) => {
    try {
      const db = await connectToDatabase();

      // Fetch the employee by ID
      const [rows] = await db.query(
        "SELECT * FROM mst_employee_details WHERE id = ?",
        [req.userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Employee does not exist" });
      }

      const userEmail = rows[0].email; // Get email from DB for safety

      // Fetch all relevant timesheet data
      const [fetchAllTimesheet] = await db.query(
        `
        SELECT 
            trn_timesheet_logs.id,
            trn_task_details.task_name,
            mst_projects_details.project_name,
            trn_timesheet_logs.week_day,
            trn_timesheet_logs.comment,
            CASE 
                WHEN trn_timesheet_logs.status = 'A' THEN 'Approved'
                WHEN trn_timesheet_logs.status = 'R' THEN 'Rejected'
                WHEN trn_timesheet_logs.status = 'U' THEN 'Pending'
                ELSE 'Unknown'
            END AS status,
            
            trn_timesheet_logs.approved_by,
            DATE_FORMAT(trn_timesheet_logs.work_date, '%d/%m/%Y') AS working_date,
            trn_timesheet_logs.hours_worked,
            trn_timesheet_logs.description
        FROM trn_timesheet_logs
        LEFT JOIN mst_projects_details 
            ON mst_projects_details.id = trn_timesheet_logs.project_id
        LEFT JOIN trn_task_details
            ON trn_task_details.id = trn_timesheet_logs.task_id
        LEFT JOIN mst_employee_details
            ON trn_task_details.tag_user = mst_employee_details.id
        WHERE 
            LOWER(mst_employee_details.email) = LOWER(?);

        `,
        [userEmail]
      );

      return res.status(200).json({ TimesheetData: fetchAllTimesheet });
    } catch (error) {
      console.error("Error fetching Timesheet data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// Delete timesheet data =======>

router.delete("/delete/timesheet/:id", async (req, res) => {
  const task_id = req.params.id;

  if (!task_id) {
    return res.status(400).json({ message: "Task ID is required" });
  }

  try {
    // Connect to the database
    const db = await connectToDatabase();

    const [TaskExist] = await db.query(
      "SELECT * FROM trn_timesheet_logs WHERE id = ?",
      [task_id]
    );

    if (TaskExist.length === 0) {
      return res.status(404).json({ message: "Task does not exist" });
    }

    // delete only provided fields
    await db.query(`DELETE from trn_timesheet_logs WHERE id = ?`, [task_id]);

    return res.status(200).json({ message: "Task deleted successfully done " });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Update/edit timesheet =================>

router.put(
  "/edit/timesheet/:id",
  updateTimesheet,
  validate,
  async (req, res) => {
    const timesheet_id = req.params.id;
    const updated_by = "unknow@gmail.com";

    if (!timesheet_id) {
      return res.status(400).json({ message: "Timesheet ID is required" });
    }

    // Retrieve data from body
    const { project_id, task_id, working_date, week_day, hours, description } =
      req.body;

    try {
      // Connect to the database
      const db = await connectToDatabase();

      // Check if the data exists
      const [timesheetDataExist] = await db.query(
        "SELECT * FROM trn_timesheet_logs WHERE id = ?",
        [timesheet_id]
      );

      if (timesheetDataExist.length === 0) {
        return res.status(404).json({ message: "data does not exist" });
      }

      // Update only provided fields
      await db.query(
        `UPDATE trn_timesheet_logs 
           SET project_id = COALESCE(?, project_id), 
               task_id = COALESCE(?, task_id),
               work_date = COALESCE(?, work_date),
               week_day = COALESCE(?, week_day),
               hours_worked = COALESCE(?, hours_worked),
               description = COALESCE(?, description),
               updated_by = COALESCE(?, updated_by)
           WHERE id = ?`,

        [
          project_id,
          task_id,
          working_date,
          week_day,
          hours,
          description,
          updated_by,
          timesheet_id,
        ]
      );

      return res
        .status(200)
        .json({ message: "Timesheet data updated successfully done" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
);

export default router;
