import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import employee from "../Server/Routes/General-Setup/Employee.js";
import department from "../Server/Routes/General-Setup/Department.js";
import role from "../Server/Routes/General-Setup/Role.js";
import feedback from "../Server/Routes/Feedback/feedBack.js";
import project from "../Server/Routes/Weekly-Task/Project.js";
import assigndTask from "../Server/Routes/Weekly-Task/TaskAssineRoutes.js";
import timesheet from "../Server/Routes/Timesheet/Timesheet.js";
import approvalConsole from "../Server/Routes/Approval-Console/approvalConsole.js";
import dashBoard from "../Server/Routes/Dashboard/Dashboard.js";
import unallocatedEmployee from "../Server/Routes/UnallocatedEmployee/UnallocatedEmployee.js";
import Approval_Report from "../Server/Routes/Approval-Report/approvalReport.js";
import Resource_Utilization_Matrix from "../Server/Routes/Resource-Utilization-Matrix/Matrix.js";
import Defaulter from "../Server/Routes/Defaulter/Defaulter.js";


import connectToDatabase from "../Server/DbConnection/Db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

// app.use("/auth", authRouter);
app.use("/general-setup/employee", employee);
app.use("/general-setup/department", department);
app.use("/general-setup/role", role);
app.use("/feedback", feedback);
app.use("/weekly-task/project", project);
app.use("/weekly-task/task-assigne", assigndTask);
app.use("/timesheet", timesheet);
app.use("/console",approvalConsole);
app.use("/dashboard",dashBoard);
app.use ("/unallocated-employee",unallocatedEmployee);
app.use ("/approval-Report",Approval_Report);
app.use ("/resource-utilization-matrix",Resource_Utilization_Matrix);
app.use ("/defaulter",Defaulter);

connectToDatabase()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server running on port 8081...");
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
  });
