import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import verifyUser from "../../middleWare/verifyMiddleware.js";
import authorizeRoles from "../../middleWare/roleMiddleware.js";

dotenv.config();

// Initialize router
const router = express.Router();

// GET route to fetch approval data
router.get(
  "/fetch/approval-data",
  verifyUser,
  authorizeRoles("Admin", "Manager"), // Only Admin and Manager roles are allowed
  async (req, res) => {
    const login_user = req.userEmail;

    try {
      // Connect to the database
      const db = await connectToDatabase();

      // Fetch the logged-in employee details by ID
      const [rows] = await db.query(
        "SELECT * FROM mst_employee_details WHERE id = ?",
        [req.userId]
      );

      // If the employee doesn't exist, return 404
      if (rows.length === 0) {
        return res.status(404).json({ message: "Employee does not exist" });
      }

      const [fetchAllData] = await db.query(
        `
    SELECT 
        trn_timesheet_logs.id,
        emp.name AS Employee_Name,
        emp.designation,
        mst_department.department_name,
        mst_projects_details.project_name,
        trn_timesheet_logs.week_day,
        DATE_FORMAT(trn_timesheet_logs.work_date, '%d/%m/%Y') AS working_date,
        trn_timesheet_logs.hours_worked,
        trn_timesheet_logs.description
    FROM trn_timesheet_logs
    LEFT JOIN mst_projects_details 
        ON mst_projects_details.id = trn_timesheet_logs.project_id
    LEFT JOIN mst_employee_details 
        ON mst_employee_details.id = mst_projects_details.manager_id
    LEFT JOIN mst_employee_details emp 
        ON emp.email = trn_timesheet_logs.created_by
    LEFT JOIN mst_department 
        ON mst_department.id = emp.department_id
    WHERE LOWER(trn_timesheet_logs.status) = LOWER('U')
      AND (
          LOWER(mst_employee_details.email) = LOWER(?)
          OR EXISTS (
              SELECT 1
              FROM mst_employee_details e
              JOIN mst_roles r ON r.id = e.role_id
              WHERE 
                  LOWER(e.email) = LOWER(?) 
                  AND LOWER(r.role) = 'admin'
          )
      )
  `,
        [login_user, login_user]
      );

      // Send the fetched data in response
      return res.status(200).json({ ConsoleData: fetchAllData });
    } catch (error) {
      console.error("Error fetching Approval Console data:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

// Approved / Reject status change =======================>
router.put(
  "/update/timesheet-status",
  verifyUser,
  authorizeRoles("Admin", "Manager"),
  async (req, res) => {

    const approved_by= req.userEmail;

    const { id, status, comment } = req.body;
    // console.log("Incoming update:", id, status, comment);

    const db = await connectToDatabase();
    try {
      if (comment !== undefined && comment !== null) {
        // Update status and comment
        await db.query(
          "UPDATE TRN_TIMESHEET_LOGS SET STATUS = ?, approved_by = ?, COMMENT = ? WHERE ID = ?",
          [status,approved_by, comment, id]
        );
      } else {
        // Update only status
        await db.query(
          "UPDATE TRN_TIMESHEET_LOGS SET STATUS = ?, approved_by = ? WHERE ID = ?",
          [status,approved_by, id]
        );
      }

      res.status(200).json({ message: "Status updated successfully" });
    } catch (err) {
      console.error("Error updating timesheet status:", err);
      res.status(500).json({ message: "Error updating status" });
    }
  }
);

export default router;
