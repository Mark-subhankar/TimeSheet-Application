import React, { useState, useEffect } from "react";
import "../UnallocatedEmployee/UnallocatedEmployee.css";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Department() {
  const [unassignedEmployees, setunassignedEmployees] = useState([]);
  const [filteredUnallocatedEmployee, setfilteredUnallocatedEmployee] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");


  const navigate = useNavigate();
  const token = Cookies.get("token");

  // Function to fetch unassignedEmployees from the API
  const fetchUnallocatedEmployee = () => {
    axios
      .get("http://localhost:8081/unallocated-employee/fetch/unassigned-data", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setunassignedEmployees(res.data.unassigned_Employees);
        setfilteredUnallocatedEmployee(res.data.unassigned_Employees);
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
    fetchUnallocatedEmployee();
  }, []);

  // Global search filter function (search in all fields)
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setfilteredUnallocatedEmployee(unassignedEmployees);
    } else {
      setfilteredUnallocatedEmployee(
        unassignedEmployees.filter((dept) =>
          Object.values(dept).some(
            (field) => field && field.toString().toLowerCase().includes(value)
          )
        )
      );
    }
  };

  return (
    <div>
      <h2 id="emp_id_un">Unallocated Employee List</h2>

      <div className="search-container_un">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="table-container_un">
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Designation</th>
              <th>Department Name</th>
              <th>Role Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredUnallocatedEmployee.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.designation}</td>
                <td>{d.department_name}</td>
                <td>{d.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
