import React, { useEffect, useState } from "react";
import "../Employee/ShowModal.css";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const ShowModal = ({ closeModal, employee }) => {
  const [departments, setDepartments] = useState([]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [roles, setRoles] = useState([]);
  const [values, setValues] = useState({
    empname: employee ? employee.name : "",
    email: employee ? employee.email : "",
    password: employee ? employee.password : "",
    salary: employee ? employee.salary : "",
    designation: employee ? employee.designation : "",
    department_id: employee ? employee.department_id : "",
    role_id: employee ? employee.role_id : "",
  });

  const navigate = useNavigate();
  const token = Cookies.get("token");

  const fetchDepartment = () => {
    axios
      .get("http://localhost:8081/general-setup/department/fetch/department", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setDepartments(res.data.departments);
      })
      .catch((err) => {
        toast.error("You are not authorized! 🔒");
        navigate("/login");
        return;
      });
  };

  const fetchRoles = () => {
    axios
      .get("http://localhost:8081/general-setup/role/fetch/roles", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setRoles(res.data.roles);
      })
      .catch((err) => {
        toast.error("You are not authorized! 🔒");
        navigate("/login");
        return;
      });
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login first! 🔒");
      navigate("/login");
      return;
    }

    fetchDepartment();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (employee) {
      setValues({
        empname: employee.name,
        email: employee.email,
        password: employee.password,
        salary: employee.salary,
        designation: employee.designation,
        department_id: employee.department_id,
        role_id: employee.role_id,
      });
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Preparing data for submission
    const payload = {
      empname: values.empname,
      email: values.email,
      password: values.password,
      salary: values.salary,
      designation: values.designation,
      department: values.department_id,
      role: values.role_id, // Sending 'role' instead of 'role_id' as required by the backend
    };

    console.log("Submitted values: ", payload);

    try {
      let response;
      if (employee) {
        // Update employee
        console.log("Updating employee...");
        response = await axios.put(
          `http://localhost:8081/general-setup/employee/edit/employee/${employee.id}`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        toast.success("Employee updated successfully");
      } else {
        // Create new employee
        console.log("Creating new employee...");
        response = await axios.post(
          "http://localhost:8081/general-setup/employee/register",
          payload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        toast.success("Employee created successfully");
      }

      console.log("Response:", response);
      closeModal(); // Close modal after submission
    } catch (err) {
      console.error("Error response:", err.response);

      if (err.response && err.response.data && err.response.data.errors) {
        console.log("Full backend error:", err.response.data);
        err.response.data.errors.forEach((error) => {
          toast.error(error.msg);
        });
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      <div onClick={closeModal} className="modal-wrapper-employee"></div>
      <div className="modal-container">
        <h1>{employee ? "Edit" : "Create"} Employee Details</h1>
        <div className="close-btn" onClick={closeModal}>
          <i className="fa-solid fa-xmark"></i>
        </div>
        <form className="emp_form" onSubmit={handleSubmit}>
          <div className="field_t">
            <div className="col-75">
              <input
                value={values.empname}
                onChange={(e) =>
                  setValues({ ...values, empname: e.target.value })
                }
                type="text"
                placeholder="Enter Employee Name"
              />
            </div>

            <div className="col-75">
              <input
                value={values.email}
                onChange={(e) =>
                  setValues({ ...values, email: e.target.value })
                }
                type="text"
                placeholder="Enter Employee Email"
              />
            </div>
          </div>

          <div className="field_t">
            <div className="col-75">
              <input
                value={values.salary}
                onChange={(e) =>
                  setValues({ ...values, salary: e.target.value })
                }
                type="text"
                placeholder="Enter Employee Current Salary.."
              />
            </div>

            <div className="col-75">
              <input
                value={values.designation}
                onChange={(e) =>
                  setValues({ ...values, designation: e.target.value })
                }
                type="text"
                placeholder="Enter Employee Designation.."
              />
            </div>

            <div className="col-75 password-field">
              <input
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter password"
                disabled={!!employee}
              />
              <i
                className={`fa-regular ${
                  passwordVisible ? "fa-eye" : "fa-eye-slash"
                }`}
                onClick={() => setPasswordVisible(!passwordVisible)}
              ></i>
            </div>
          </div>

          <div className="field_t">
            <div className="col-75">
              <select
                value={values.department_id}
                onChange={(e) =>
                  setValues({ ...values, department_id: e.target.value })
                }
              >
                <option value="">-- Choose Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-75">
              <select
                value={values.role_id}
                onChange={(e) =>
                  setValues({ ...values, role_id: e.target.value })
                }
              >
                <option value="">-- Choose User Role --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <button type="submit" id="btn_submit">
              {employee ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ShowModal;
