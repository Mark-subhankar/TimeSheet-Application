import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import authorizeRoles from "../../middleWare/roleMiddleware.js";
import verifyUser from "../../middleWare/verifyMiddleware.js";

dotenv.config();

const router = express.Router();

router.get(
  "/fetch/matrix-data",
  verifyUser,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const db = await connectToDatabase();

      // Check if the requesting employee exists
      const [employeeRows] = await db.query(
        "SELECT * FROM mst_employee_details WHERE id = ?",
        [req.userId]
      );

      if (employeeRows.length === 0) {
        return res.status(404).json({ message: "Employee does not exist" });
      }

      // Fetch employee task matrix data (task count, hours, etc.)
      const [matrixData] = await db.query(`
        SELECT 
          et.name AS employee_name,
          et.salary,
          SUM(t.hours_worked) AS total_hours_worked,
          COUNT(DISTINCT td.id) AS total_tasks,
          GROUP_CONCAT(DISTINCT p.project_name SEPARATOR ', ') AS projects,
          GROUP_CONCAT(DISTINCT ma.name SEPARATOR ', ') AS project_managers
        FROM trn_timesheet_logs t
        LEFT JOIN mst_projects_details p ON p.id = t.project_id
        LEFT JOIN trn_task_details td ON td.id = t.task_id 
        LEFT JOIN mst_employee_details ma ON ma.id = p.manager_id
        LEFT JOIN mst_employee_details et ON et.id = td.tag_user
        WHERE et.name IS NOT NULL
        GROUP BY et.name, et.salary
      `);

      return res.status(200).json({ employee_matrix_data: matrixData });
    } catch (error) {
      console.error("Error fetching employee matrix data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
