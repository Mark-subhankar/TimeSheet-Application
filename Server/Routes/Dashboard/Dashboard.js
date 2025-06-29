import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import dotenv from "dotenv";
import verifyUser from "../../middleWare/verifyMiddleware.js";
import authorizeRoles from "../../middleWare/roleMiddleware.js";

dotenv.config();

// invok router
const router = express.Router();

// Fetch Nat Card data ================>
router.get(
  "/fetch/dashboard-natcard",
  verifyUser,
  authorizeRoles("Admin"),
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

      const [CardData] = await db.query(`
        SELECT
        (SELECT COUNT(*) FROM mst_employee_details) AS employee_count,
        (SELECT COUNT(*) FROM mst_department) AS department_count,
        (SELECT COUNT(*) FROM mst_projects_details) AS project_count,
        (SELECT COUNT(*) FROM trn_timesheet_logs WHERE status = 'U') AS Unapproved_task_count,
        (SELECT COUNT(*) FROM trn_timesheet_logs WHERE status = 'A') AS Approved_task_count,
        (SELECT COUNT(*) FROM trn_timesheet_logs WHERE status = 'R') AS Rejected_task_count;
    `);

      return res.status(200).json({
        NatCardData: CardData,
      });
    } catch (error) {
      console.error("Error fetching nat card data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

//Fetch Task sheet Data ================>
router.get(
  "/fetch/dashboard-sheet",
  verifyUser,
  authorizeRoles("Admin"),
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

      const [sheetData] = await db.query(`
        SELECT
        td.id,
        em.name as employee_name ,
        ma.name as manager_name ,
        td.task_name,
        pd.project_name as project,
        st.status,
        td.hours,
        td.start_date,
        td.end_date
        FROM trn_task_details td

        LEFT JOIN mst_projects_details pd
        ON pd.id = td.project_id

        LEFT JOIN mst_employee_details em
        ON em.id = td.tag_user

        LEFT JOIN mst_employee_details ma
        ON ma.id = pd.manager_id

        LEFT JOIN mst_status_details st
        ON st.id = td.status
    `);

      return res.status(200).json({
        taskSheet: sheetData,
      });
    } catch (error) {
      console.error("Error fetching Dashboard sheet data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// Fetch all Dashboard all Chart data  ===============>
router.get(
  "/fetch/dashboard-chart",
  verifyUser,
  authorizeRoles("Admin"),
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

      const [totalHours] = await db.query(`
      SELECT 
        pd.project_name,
        ROUND(SUM(TIME_TO_SEC(tl.hours_worked)) / 3600, 2) AS total_hours_decimal
      FROM 
        trn_timesheet_logs tl
      LEFT JOIN 
        mst_projects_details pd ON pd.id = tl.project_id
      WHERE 
        tl.work_date BETWEEN STR_TO_DATE('05/05/2025', '%d/%m/%Y')
                         AND STR_TO_DATE('07/05/2025', '%d/%m/%Y')
      GROUP BY 
        pd.project_name;
    `);

      const [employeesPerRole] = await db.query(`
      SELECT 
        mr.role, 
        COUNT(em.id) AS employee_count
      FROM 
        mst_roles mr
      LEFT JOIN 
        mst_employee_details em ON mr.id = em.role_id
      GROUP BY 
        mr.role;
    `);

      const [employeesPerDepartment] = await db.query(`
      SELECT 
        dm.department_name, 
        COUNT(em.id) AS employee_count 
      FROM 
        mst_employee_details em 
      LEFT JOIN 
        mst_department dm ON dm.id = em.department_id
      GROUP BY 
        dm.department_name;
    `);

      const [employeeCountBySalary] = await db.query(`
      SELECT 
        em.salary, 
        COUNT(*) AS employee_count
      FROM 
        mst_employee_details em
      GROUP BY 
        em.salary
      ORDER BY 
        em.salary;
    `);

      const [employeeByDesignation] = await db.query(`
      SELECT 
        designation, 
        COUNT(id) AS employee_count 
      FROM 
        mst_employee_details 
      GROUP BY 
        designation;
    `);

      const [statusEmployees] = await db.query(`
        SELECT 
          CASE 
            WHEN status = 'A' THEN 'Approved'
            WHEN status = 'U' THEN 'Unapproved'
            WHEN status = 'R' THEN 'Rejected'
          END AS status,
          COUNT(em.id) AS count_Emp
        FROM trn_timesheet_logs em
        GROUP BY status;

    `);

      return res.status(200).json({
        total_hours_per_project: totalHours,
        employees_per_role: employeesPerRole,
        employees_per_department: employeesPerDepartment,
        employee_count_by_salary: employeeCountBySalary,
        employees_by_designation: employeeByDesignation,
        status_Employees: statusEmployees,
      });
    } catch (error) {
      console.error("Error fetching Project data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
