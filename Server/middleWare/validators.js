import { check, validationResult } from "express-validator";

// Validation rules for different routes
const registerValidation = [
  check("empname")
    .notEmpty()
    .withMessage("Employee name is required")
    .isLength({ min: 3 })
    .withMessage("Employee name must be at least 3 characters long"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  check("salary")
    .optional({ checkFalsy: true })
    .isFloat({ min: 1000 }) // Ensures salary is at least 1000
    .withMessage("Salary must be a number and at least 1000"),

  check("designation")
    .optional({ checkFalsy: true })
    .isLength({ min: 3 })
    .withMessage("Designation must be at least 3 characters long"),

  check("department")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("Department ID must be an integer"),

  check("role")
    .notEmpty()
    .withMessage("Role is required")
    .isInt()
    .withMessage("Role ID must be an integer"),
];

const loginValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const changePasswordValidation = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),

  check("oldPassword")
    .notEmpty()
    .withMessage("Old password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  check("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),

  check("conPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Confirm password must match new password"),
];

const createDepartment = [
  check("name")
    .notEmpty()
    .withMessage("Department name is required")
    .isLength({ min: 3 })
    .withMessage("Employee name must be at least 3 characters long"),

  check("description")
    .optional({ checkFalsy: true })
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
];

const updateDepartment = [
  check("name")
    .optional({ checkFalsy: true })
    .isLength({ min: 3 })
    .withMessage("Employee name must be at least 3 characters long"),

  check("description")
    .optional({ checkFalsy: true })
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
];

const updateEmployee = [
  check("empname")
    .optional({ checkFalsy: true })
    .isLength({ min: 2 })
    .withMessage("Employee name must be at least 2 characters long"),

  check("email")
    .optional({ checkFalsy: true })
    .isLength({ min: 2 })
    .withMessage("Employee email must be at least 2 characters long")
    .isEmail()
    .withMessage("Valid email is required"),

  check("salary")
    .optional({ checkFalsy: true })
    .isLength({ min: 1 })
    .withMessage("Employee salary must be at least 1 characters long"),

  check("designation")
    .optional({ checkFalsy: true })
    .isLength({ min: 2 })
    .withMessage("Employee designation must be at least 2 characters long"),
];

const createRole = [
  check("role")
    .notEmpty()
    .withMessage("Role field is required")
    .isLength({ min: 3 })
    .withMessage("Role name must be at least 3 characters long"),

  check("description")
    .optional({ checkFalsy: true })
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
];

const updateRole = [
  check("role")
    .optional({ checkFalsy: true })
    .isLength({ min: 3 })
    .withMessage("Role name must be at least 3 characters long"),

  check("description")
    .optional({ checkFalsy: true })
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),
];

const createProject = [
  check("project_name")
    .notEmpty()
    .withMessage("Project name field is required")
    .isLength({ min: 2 })
    .withMessage("Project name must be at least 2 characters long"),

  check("manager_id").notEmpty().withMessage("Manager name field is required"),

  check("project_description")
    .optional({ checkFalsy: true })
    .isLength({ min: 5 })
    .withMessage("Project Description must be at least 5 characters long"),
];

const updateProject = [
  check("project_name")
    .optional({ checkFalsy: true })
    .isLength({ min: 2 })
    .withMessage("Project name must be at least 2 characters long"),

  check("project_description")
    .optional({ checkFalsy: true })
    .isLength({ min: 5 })
    .withMessage("Project Description must be at least 5 characters long"),
];

const createTask = [
  check("task_name")
    .trim()
    .notEmpty()
    .withMessage("Task name is required")
    .isLength({ min: 2 })
    .withMessage("Task name must be at least 2 characters long"),

  check("project_id")
    .notEmpty()
    .withMessage("Project ID is required")
    .isInt()
    .withMessage("Project ID must be an integer"),

  check("tag_user_id")
    .notEmpty()
    .withMessage("Tag user is required")
    .isInt()
    .withMessage("Tag user ID must be an integer"),

  check("hours").notEmpty().withMessage("Hours are required"),

  check("start_date").notEmpty().withMessage("Start date is required"),

  check("end_date").notEmpty().withMessage("End date is required"),

  check("task_description")
    .optional({ checkFalsy: true })
    .isLength({ min: 2 })
    .withMessage("Task description must be at least 2 characters long"),
];

const createTimesheet = [
  check("project_id")
    .notEmpty()
    .withMessage("Project ID is required")
    .isInt()
    .withMessage("Project ID must be an integer"),

  check("task_id")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("Task ID must be an integer"),

  check("working_date").notEmpty().withMessage("Working date is required"),

  check("week_day").notEmpty().withMessage("Week day are required"),

  check("hours").notEmpty().withMessage("Hours is required"),

  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 2 })
    .withMessage("Task description must be at least 2 characters long"),
];

const updateTimesheet = [
  check("project_id")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("Project ID must be an integer"),

  check("task_id")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("Task ID must be an integer"),

  check("working_date").optional({ checkFalsy: true }),

  check("week_day").optional({ checkFalsy: true }),

  check("hours").optional({ checkFalsy: true }),

  check("description")
    .optional({ checkFalsy: true })
    .isLength({ min: 2 })
    .withMessage("Task description must be at least 2 characters long"),
];

const submitFeedback = [
  check("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 2 })
    .withMessage("Task description must be at least 2 characters long"),
];

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export {
  registerValidation,
  submitFeedback,
  createProject,
  updateProject,
  loginValidation,
  changePasswordValidation,
  createDepartment,
  updateDepartment,
  createRole,
  updateRole,
  updateEmployee,
  createTask,
  createTimesheet,
  updateTimesheet,
  validate,
};
