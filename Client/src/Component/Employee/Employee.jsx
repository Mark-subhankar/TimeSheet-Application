import React, { useState, useEffect } from "react";
import "../Employee/Employee.css";
import ShowModal from "./ShowModal";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Employee() {
  const [showModal, setShowModal] = useState(false);
  const [employee, setemployee] = useState([]);
  const [filteredEmployee, setFilteredEmployee] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const navigate = useNavigate();
  const token = Cookies.get("token");

  const fetchEmployee = () => {
    axios
      .get("http://localhost:8081/general-setup/employee/fetch/employee", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        // toast.success("Login successfully done");
        setemployee(res.data.employees);
        setFilteredEmployee(res.data.employees);
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
    fetchEmployee();
  }, []);

  // Global search filter function (search in all fields)
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setFilteredEmployee(employee);
    } else {
      setFilteredEmployee(
        employee.filter((e) =>
          Object.values(e).some(
            (field) => field && field.toString().toLowerCase().includes(value)
          )
        )
      );
    }
  };

  const openModal = (employee = null) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    fetchEmployee();
  };

  const handleDelete = async (id) => {
    try {
      // Update the URL to match the backend endpoint for deleting an employee
      await axios.delete(
        `http://localhost:8081/general-setup/employee/delete/employee/${id}`
      );
      fetchEmployee(); // Fetch the updated list of employees after deletion
      toast.success("Employee deleted successfully!");
    } catch (error) {
      toast.error("❌ Failed to delete employee.");
    }
  };

  return (
    <div>
      <h2 id="emp_id">Employee Details</h2>

      <div className="search-container">
        <input
          value={searchTerm}
          onChange={handleSearch}
          type="text"
          placeholder="Search.."
        />
        <button onClick={() => openModal(null)} id="create_btn">
          Create
        </button>
      </div>

      {showModal && (
        <ShowModal closeModal={closeModal} employee={selectedEmployee} />
      )}
      <div className="table-container-employee">
        <table>
          <thead>
            <tr>
              <th>Edit</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Employee Role</th>
              <th>Salary</th>
              <th>Designation</th>
              <th>Password</th>
              <th>Created By</th>
              <th>Created At</th>
              <th>Updated By</th>
              <th>Updated At</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployee.map((e) => (
              <tr key={e.id}>
                <td>
                  <i
                    onClick={() => openModal(e)}
                    className="fa-regular fa-pen-to-square"
                  ></i>
                </td>
                <td>{e.name}</td>
                <td>{e.email}</td>
                <td>{e.department}</td>
                <td>{e.role}</td>
                <td>{e.salary}</td>
                <td>{e.designation} </td>
                <td>{e.password}</td>
                <td>{e.created_by}</td>
                <td>{e.created_at}</td>
                <td>{e.updated_by}</td>
                <td>{e.updated_at}</td>
                <td>
                  <i
                    onClick={() => handleDelete(e.id)}
                    className="fa-solid fa-trash"
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
