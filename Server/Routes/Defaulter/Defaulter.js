//   [Note ] - Bug issue  

import express from "express";   
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import authorizeRoles from "../../middleWare/roleMiddleware.js";
import verifyUser from "../../middleWare/verifyMiddleware.js";

dotenv.config();

const router = express.Router();

router.get(
  "/fetch/weekly-status",
  verifyUser,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start and End dates are required." });
      }

      const db = await connectToDatabase();

      const [weeklyStatus] = await db.query(
        `
        SELECT 
          e.id,
          e.name,
          e.designation,
          d.department_name,
          COALESCE(SUM(t.hours_worked), 0) AS total_hours,
          CASE 
            WHEN COUNT(t.id) = 0 THEN 'No Data Found'
            WHEN SUM(CASE WHEN t.status = 'R' THEN 1 ELSE 0 END) > 0 THEN 
              CONCAT('Rejected Date - ', 
                     GROUP_CONCAT(DISTINCT DATE_FORMAT(CASE WHEN t.status = 'R' THEN t.work_date END, '%d-%m-%Y') SEPARATOR ', '))
            WHEN SUM(CASE WHEN t.status = 'U' THEN 1 ELSE 0 END) > 0 
                 AND COUNT(DISTINCT t.work_date) < 5 THEN 
                 CONCAT('Not Approved. Missing dates: ',
                        GROUP_CONCAT(DATE_FORMAT(missing_dates.date, '%Y-%m-%d')))
            WHEN SUM(CASE WHEN t.status = 'U' THEN 1 ELSE 0 END) > 0 THEN
              CONCAT('Not Approved Date - ',
                     GROUP_CONCAT(DISTINCT DATE_FORMAT(CASE WHEN t.status = 'U' THEN t.work_date END, '%d-%m-%Y') SEPARATOR ', '))
            WHEN COUNT(DISTINCT t.work_date) < 5 THEN 
                 CONCAT('Less than 40 hours. Missing dates: ',
                        GROUP_CONCAT(DATE_FORMAT(missing_dates.date, '%Y-%m-%d')))
            WHEN SUM(t.hours_worked) < 40 THEN 'Less than 40 hours'
            ELSE 'Meets Weekly Requirement'
          END AS status
        FROM mst_employee_details e
        LEFT JOIN mst_roles r ON r.id = e.role_id
        LEFT JOIN mst_department d ON d.id = e.department_id
        LEFT JOIN trn_timesheet_logs t 
          ON t.created_by = e.email 
          AND t.work_date BETWEEN ? AND ?
        LEFT JOIN (
          SELECT a.date
          FROM (
            SELECT DATE(?) + INTERVAL n DAY AS date
            FROM (
              SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
            ) AS days
          ) AS a
          WHERE a.date NOT IN (
            SELECT DISTINCT work_date
            FROM trn_timesheet_logs
            WHERE work_date BETWEEN ? AND ?
          )
        ) AS missing_dates ON 1=1
        GROUP BY e.id, e.name, e.designation, d.department_name
        `,
        [startDate, endDate, startDate, startDate, endDate]
      );

      return res.status(200).json({ weeklyStatus });
    } catch (error) {
      console.error("Error fetching weekly status:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
