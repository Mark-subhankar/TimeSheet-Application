import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import authorizeRoles from "../../middleWare/roleMiddleware.js";
import verifyUser from "../../middleWare/verifyMiddleware.js";

dotenv.config();

const router = express.Router();

router.get(
  "/fetch/report-data",
  verifyUser,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const db = await connectToDatabase();

      // Check if the logged-in employee exists
      const [employeeResult] = await db.query(
        "SELECT * FROM mst_employee_details WHERE id = ?",
        [req.userId]
      );

      if (employeeResult.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Fetch report data
      const [reportData] = await db.query(`
        SELECT 
          t.id,
          et.name as Employee_name,
          p.project_name,
          pm.name AS project_manager, 
          td.task_name,
          DATE_FORMAT(t.work_date, '%d/%m/%Y') AS work_date,
          t.week_day,
          t.hours_worked,
          t.description AS task_description,
          CASE 
            WHEN t.status = 'A' THEN 'Approved'
            WHEN t.status = 'U' THEN 'Unapproved'
            WHEN t.status = 'R' THEN 'Rejected'
            ELSE 'Unknown'
          END AS status,
          IFNULL(CONCAT(e.name, ' (', r.role, ')'), 'N/A') AS approved_by,
          IFNULL(t.comment, 'N/A') AS comment
        FROM trn_timesheet_logs t
        LEFT JOIN mst_projects_details p ON p.id = t.project_id
        LEFT JOIN trn_task_details td ON td.id = t.task_id
        LEFT JOIN mst_employee_details e ON LOWER(e.email) = LOWER(t.approved_by)
        LEFT JOIN mst_employee_details pm ON pm.id = p.manager_id
        LEFT JOIN mst_roles r ON r.id = e.role_id
        LEFT JOIN mst_employee_details et ON et.id = td.tag_user
      `);

      return res.status(200).json({ report_data: reportData });
    } catch (error) {
      console.error("Error fetching report data:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

export default router;
