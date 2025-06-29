import React, { useState } from "react";
import "../Defaulter/Defaulter.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Department() {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeData, setEmployeeData] = useState([]);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    if (startDate > endDate) {
      alert("Start date cannot be after end date.");
      return;
    }

    const formattedStart = startDate.toISOString().split("T")[0];
    const formattedEnd = endDate.toISOString().split("T")[0];

    try {
      const response = await axios.get("http://localhost:8081/defaulter/fetch/weekly-status", {
        params: {
          startDate: formattedStart,
          endDate: formattedEnd,
        },
        headers: {
          Authorization: `${token}`,
        },
      });

      setEmployeeData(response.data.weeklyStatus || []);
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to fetch data.");
    }
  };

  const filteredEmployees = employeeData.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 id="emp_id_defaulter">Defaulter List</h2>

      <div className="search-container_un_defaulter">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="-- Choose Start Date --"
        />

        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="-- Choose End Date --"
        />

        <button id="create_btn_defaulter" onClick={handleSubmit}>
          Submit
        </button>
      </div>

      <div className="table-container_un_defaulter">
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Designation</th>
              <th>Department Name</th>
              <th>Total Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.designation}</td>
                <td>{emp.department_name}</td>
                <td>{emp.total_hours}</td>
                <td>{emp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
