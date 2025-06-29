import React, { useState, useEffect } from "react";
import "./Department.css";
import DepartmentModal from "./DepartmentModal";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Department() {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const token = Cookies.get("token");

  // Function to fetch departments from the API
  const fetchDepartments = () => {
    axios
      .get("http://localhost:8081/general-setup/department/fetch/department", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setDepartments(res.data.departments);
        setFilteredDepartments(res.data.departments);
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
    fetchDepartments();
  }, []);

  // Global search filter function (search in all fields)
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setFilteredDepartments(departments);
    } else {
      setFilteredDepartments(
        departments.filter((dept) =>
          Object.values(dept).some(
            (field) => field && field.toString().toLowerCase().includes(value)
          )
        )
      );
    }
  };

  const openModal = (department = null) => {
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    fetchDepartments();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8081/general-setup/department/delete/department/${id}`
      );
      fetchDepartments();
      toast.success("Department deleted successfully!");
    } catch (error) {
      toast.error("❌ Failed to delete department.");
    }
  };

  return (
    <div>
      <h2 id="emp_id">Department Details</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={() => openModal(null)} id="create_btn">
          Create
        </button>
      </div>

      {showModal && (
        <DepartmentModal
          closeModal={closeModal}
          department={selectedDepartment}
        />
      )}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Edit</th>
              <th>Department Name</th>
              <th>Description</th>
              <th>Created By</th>
              <th>Created At</th>
              <th>Updated By</th>
              <th>Updated At</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept) => (
                <tr key={dept.id}>
                  <td>
                    <i
                      onClick={() => openModal(dept)}
                      className="fa-regular fa-pen-to-square"
                    ></i>
                  </td>
                  <td>{dept.department_name}</td>
                  <td>{dept.description}</td>
                  <td>{dept.created_by}</td>
                  <td>{dept.created_at}</td>
                  <td>{dept.updated_by}</td>
                  <td>{dept.updated_at}</td>
                  <td>
                    <i
                      onClick={() => handleDelete(dept.id)}
                      className="fa-solid fa-trash"
                    ></i>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No Data Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
