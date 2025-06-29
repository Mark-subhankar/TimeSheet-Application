import express from "express";
import connectToDatabase from "../../DbConnection/Db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendMail from "../../Others/SendMail.js";
import extractFirstName from "../../Others/ExtractName.js";
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateEmployee,
  validate,
} from "../../middleWare/validators.js";
dotenv.config();
import verifyUser from "../../middleWare/verifyMiddleware.js";
import authorizeRoles from "../../middleWare/roleMiddleware.js";


const router = express.Router();

// Create Employee =====>

router.post("/register", registerValidation, validate, async (req, res) => {
  // Retrive data from body
  const { empname, email, password, salary, designation, department, role } =
    req.body;

  // Check if all fields are provided
  if (!empname || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Connect to database
    const db = await connectToDatabase();

    // Check if the employee already exists
    const [rows] = await db.query(
      "SELECT * FROM mst_employee_details WHERE email = ?",
      [email]
    );

    // When employee not exist
    if (rows.length > 0) {
      return res.status(409).json({ message: "Employee already exists" });
    }

    // convert password into hash
    const hashPassword = await bcrypt.hash(password, 10);

    // Save data into table
    await db.query(
      "INSERT INTO mst_employee_details(name, email, password, salary , designation,department_id , role_id) VALUES(?, ?, ?,? ,?,?,?)",
      [
        empname,
        email,
        hashPassword,
        salary || null,
        designation || null,
        department || null,
        role,
      ]
    );

    // send mail
    let mailSubject = "Reset Password for First-Time Login";

    let content = `
        <p>Dear <strong>${extractFirstName(email)}</strong>,</p>
    
        <p>This is to inform you that your account has been created.</p>
    
        <p><strong>Username:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>

        <p>Please follow the steps below to reset your password:</p>
    
        <ol>
            <li>Click <a href="http://localhost:8081/auth/change" target="_blank">here</a> to log into the application and reset your password.</li>
            <li>After resetting your password, you will be redirected to the application login.</li>
        </ol>
    
        <p>If you have any questions about the new tool, please contact at 
        <a href="mailto:subhankar.das8584@gmail.com">subhankar.das8584@gmail.com</a>.</p>
    
        <p>Best Regards,<br>
        <strong>Support Team</strong></p>
    `;

    try {
      await sendMail(email, mailSubject, content);
    } catch (mailError) {
      console.error("Email sending failed:", mailError);
    }

    return res.status(201).json({ message: "Employee created successfully" });
  } catch (error) {
    console.error("Error registering employee:", error);

    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email already exists, please use a different email",
      });
    }

    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Fetch and Authorize person role ==========================>
router.get(
  "/fetch/authorize",
  verifyUser,
  authorizeRoles("Admin" , "Manager" , "User"),
  async (req, res) => {
    try {
      const db = await connectToDatabase();

      // Fetch the employee by ID
      const [rows] = await db.query(
        "SELECT * FROM mst_employee_details WHERE id = ?",
        [req.userId]
      );

      // when row is not found means 0
      if (rows.length === 0) {
        return res.status(404).json({ message: "Employee does not exist" });
      }

      // Check employees by there roles 
      const [fetchEmp_Role] = await db.query(
        `
        SELECT mst_roles.role FROM mst_employee_details
        left join mst_roles
        on mst_roles.id = mst_employee_details.role_id 
        where mst_employee_details.id = ? ;
        
        `,[req.userId]
      );

      // return json responce data
      return res.status(200).json({ Authorize_Role: fetchEmp_Role });

    } catch (error) {
      console.error("Error fetching employee data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// fetch All Employee ================>
  
router.get(
  "/fetch/employee",
  verifyUser,
  authorizeRoles("Admin" , "Manager"),
  async (req, res) => {
    try {
      const db = await connectToDatabase();

      // Fetch the employee by ID
      const [rows] = await db.query(
        "SELECT * FROM mst_employee_details WHERE id = ?",
        [req.userId]
      );

      // when row is not found means 0
      if (rows.length === 0) {
        return res.status(404).json({ message: "Employee does not exist" });
      }

      // Fetch all employees
      const [fetchAllEmp] = await db.query(
        `SELECT 
           mst_employee_details.id, 
           mst_employee_details.role_id,
           mst_employee_details.department_id,
           mst_employee_details.name, 
           mst_employee_details.email, 
           mst_employee_details.salary, 
           mst_employee_details.password,
           mst_employee_details.designation, 
           mst_department.department_name AS department, 
           mst_employee_details.created_by, 
           mst_employee_details.created_at, 
           mst_employee_details.updated_at, 
           mst_employee_details.updated_by, 
           mst_roles.role 
         FROM mst_employee_details
         LEFT JOIN mst_department 
           ON mst_department.id = mst_employee_details.department_id
         LEFT JOIN mst_roles 
           ON mst_roles.id = mst_employee_details.role_id`
      );

      // return json responce data
      return res.status(200).json({ employees: fetchAllEmp });
    } catch (error) {
      console.error("Error fetching employee data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// Fetch single employee data ==========>

router.get("/fetch/employee/:id", async (req, res) => {
  const emp_id = req.params.id;

  if (!emp_id) {
    return res.status(400).json({ message: "Employee ID is required" });
  }

  try {
    // Database connection
    const db = await connectToDatabase();

    // Fetch all employee
    const [fetchAllEmployee] = await db.query(
      "SELECT * FROM mst_employee_details where id = ?",
      emp_id
    );

    // send responce as json
    return res.status(200).json({ employee: fetchAllEmployee });
  } catch (error) {
    console.error("Error fetching Employee data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Fetch Employee where role = Manager ==========>

router.get("/fetch/managers", async (req, res) => {
  try {
    const db = await connectToDatabase();

    // Fetch all employees(manager)
    const [fetchAllEmp] = await db.query(
      `SELECT 
          emp.id,
          CONCAT(emp.name, ' (', emp.email, ')') AS employee_info
        FROM 
          mst_employee_details emp
        LEFT JOIN 
          mst_roles r ON r.id = emp.role_id
        WHERE 
          LOWER(r.role) = LOWER('manager');
        `
    );

    // return json responce data
    return res.status(200).json({ managers: fetchAllEmp });
  } catch (error) {
    console.error("Error fetching employee data:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Edit Single Employee =================>

router.put("/edit/employee/:id", updateEmployee, validate, async (req, res) => {
  const emp_id = req.params.id;

  if (!emp_id) {
    return res.status(400).json({ message: "Employee ID is required" });
  }

  // Retrieve data from body
  const { empname, email, salary, designation, department, role } = req.body;

  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Check if the employee exists
    const [employeeExist] = await db.query(
      "SELECT * FROM mst_employee_details WHERE id = ?",
      [emp_id]
    );

    if (employeeExist.length === 0) {
      return res.status(404).json({ message: "Employee does not exist" });
    }

    // Update only provided fields
    await db.query(
      `UPDATE mst_employee_details 
         SET name = COALESCE(?, name), 
             email = COALESCE(?, email),
             salary = COALESCE(?, salary),
             designation = COALESCE(?, designation),
             department_id = COALESCE(?, department_id),
             role_id = COALESCE(?, role_id)
         WHERE id = ?`,

      [empname, email, salary, designation, department, role, emp_id]
    );

    return res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Delete Single Employee ===============>

router.delete("/delete/employee/:id", async (req, res) => {
  const emp_id = req.params.id;

  if (!emp_id) {
    return res.status(400).json({ message: "Employee ID is required" });
  }

  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Check if the employee exists
    const [EmployeeExist] = await db.query(
      "SELECT * FROM mst_employee_details WHERE id = ?",
      [emp_id]
    );

    if (EmployeeExist.length === 0) {
      return res.status(404).json({ message: "Employee does not exist" });
    }

    // delete data
    await db.query(`DELETE from mst_employee_details WHERE id = ?`, [emp_id]);

    return res
      .status(200)
      .json({ message: "Employee deleted successfully done " });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Login Employee Route ======>

router.post("/login", loginValidation, validate, async (req, res) => {
  // Retrive from request body
  const { email, password } = req.body;

  // Check if all fields are provided
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // connect to database
    const db = await connectToDatabase();

    // check email exist or not
    const [rows] = await db.query(
      "SELECT * FROM mst_employee_details WHERE email = ?",
      [email]
    );

    // when email not exist
    if (rows.length === 0) {
      return res.status(404).json({ message: "Employee does not exist" });
    }

    //compare user password == database password
    const isMatch = await bcrypt.compare(password, rows[0].password);

    // when password not match
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // when password match genarate auth token[id , role id ]pass
    const token = jwt.sign(
      { id: rows[0].id, role: rows[0].role_id, email: rows[0].email },
      process.env.JWT_TOKEN,
      {
        expiresIn: "5h",
      }
    );

    res.cookie("token", token);
    res.cookie("UserEmail", rows[0].email);

    return res.status(200).json({ token: token });
  } catch (error) {
    console.error("Error logging in employee:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Change Employee password  ========>

router.post("/change", changePasswordValidation, validate, async (req, res) => {
  try {
    // Retrive data from request body
    const { email, oldPassword, newPassword, conPassword } = req.body;

    // Check if all fields are provided
    if (!email || !oldPassword || !newPassword || !conPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if new password and confirm password match
    if (newPassword !== conPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    // connect to database
    const db = await connectToDatabase();

    // Fetch user details
    const [rows] = await db.query(
      "SELECT * FROM mst_employee_details WHERE email = ?",
      [email]
    );

    //wher email not exist
    if (rows.length === 0) {
      return res.status(404).json({ message: "Employee does not exist" });
    }

    // user data store into a variable
    const user = rows[0];

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    // Hash new password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in the database
    await db.query(
      "UPDATE mst_employee_details SET password = ? WHERE id = ?",
      [hashedPassword, user.id]
    );

    // send mail
    let mailSubject = "Password Change Successfully Done";

    let content = `
        <p>Dear <strong>${extractFirstName(email)}</strong>,</p>
    
        <p>This is to inform you that your password change successfully done.</p>
    
        <p><strong>Username:</strong> ${email}</p>
        <p><strong>Password:</strong> ${newPassword}</p>

        <p>If you have any questions about the new tool, please contact at 
        <a href="mailto:subhankar.das8584@gmail.com">subhankar.das8584@gmail.com</a>.</p>
    
        <p>Best Regards,<br>
        <strong>Support Team</strong></p>
    `;

    try {
      await sendMail(email, mailSubject, content);
    } catch (mailError) {
      console.error("Email sending failed:", mailError);
    }

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in password change:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

export default router;
