import React, { useState, useEffect } from "react";
import "../ResourceMatrix/ResourceMatrix.css";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function ResourceMatrix() {
  const [matrixData, setmatrixData] = useState([]);
  const [filteredMatrixData, setfilteredMatrixData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const token = Cookies.get("token");

  // Function to fetch matrixData from the API
  const fetchMatrixData = () => {
    axios
      .get(
        "http://localhost:8081/resource-utilization-matrix/fetch/matrix-data",
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      )
      .then((res) => {
        setmatrixData(res.data.employee_matrix_data);
        setfilteredMatrixData(res.data.employee_matrix_data);
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
    fetchMatrixData();
  }, []);

  // Global search filter function (search in all fields)
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setfilteredMatrixData(matrixData);
    } else {
      setfilteredMatrixData(
        matrixData.filter((dept) =>
          Object.values(dept).some(
            (field) => field && field.toString().toLowerCase().includes(value)
          )
        )
      );
    }
  };

  return (
    <div>
      <h2 id="emp_id_un">Resource Utilization Matrix</h2>

      <div className="search-container_matrix">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="table-container_matrix">
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Salary</th>
              <th>Total Hours Work</th>
              <th>Total Task Worked</th>
              <th>Project Name</th>
              <th>Project Manager</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatrixData.length > 0 ? (
              filteredMatrixData.map((d, index) => (
                <tr key={index}>
                  <td>{d.employee_name}</td>
                  <td>{d.salary}</td>
                  <td>{d.total_hours_worked}</td>
                  <td>{d.total_tasks}</td>
                  <td>{d.projects}</td>
                  <td>{d.project_managers}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10">No Data Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
