import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import authorizeRoles from "../../middleWare/roleMiddleware.js";
import verifyUser from "../../middleWare/verifyMiddleware.js";

dotenv.config();

const router = express.Router();

router.get(
  "/fetch/unassigned-data",
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

      // Fetch employees who are not allocated (i.e., not tagged in tasks)
      const [unassignedEmployees] = await db.query(`
        SELECT 
          e.id,
          e.name, 
          e.designation, 
          d.department_name, 
          r.role
        FROM mst_employee_details e
        LEFT JOIN mst_roles r ON r.id = e.role_id
        LEFT JOIN mst_department d ON d.id = e.department_id
        WHERE e.id NOT IN (
          SELECT DISTINCT t.tag_user
          FROM trn_task_details t
          WHERE t.tag_user IS NOT NULL
        )
      `);

      return res.status(200).json({ unassigned_Employees: unassignedEmployees });
    } catch (error) {
      console.error("Error fetching unassigned employees:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
