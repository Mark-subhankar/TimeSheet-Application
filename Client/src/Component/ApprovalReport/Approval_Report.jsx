import React, { useState, useEffect } from "react";
import "../ApprovalReport/Approval_Report.css";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Department() {
  const [reportData, setreportData] = useState([]);
  const [filteredReport, setfilteredReport] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const token = Cookies.get("token");

  // Function to fetch reportData from the API
  const fetchReport = () => {
    axios
      .get("http://localhost:8081/approval-Report/fetch/report-data", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setreportData(res.data.report_data);
        setfilteredReport(res.data.report_data);
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
    fetchReport();
  }, []);

  // Global search filter function (search in all fields)
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setfilteredReport(reportData);
    } else {
      setfilteredReport(
        reportData.filter((dept) =>
          Object.values(dept).some(
            (field) => field && field.toString().toLowerCase().includes(value)
          )
        )
      );
    }
  };

  return (
    <div>
      <h2 id="emp_id_report">Approval Report Section</h2>

      <div className="search-container_report">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="table-container_report">
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Project Name</th>
              <th>Project Manager</th>
              <th>Task Name</th>
              <th>Work Date</th>
              <th>Week Day</th>
              <th>Working Hours</th>
              <th>Task Description</th>
              <th>Status</th>
              <th>Approved By</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {filteredReport.length > 0 ? (
              filteredReport.map((d) => (
                <tr key={d.id}>
                  <td>{d.Employee_name}</td>
                  <td>{d.project_name}</td>
                  <td>{d.project_manager}</td>
                  <td>{d.task_name}</td>
                  <td>{d.work_date}</td>
                  <td>{d.week_day}</td>
                  <td>{d.hours_worked}</td>
                  <td>{d.task_description}</td>
                  <td>{d.status}</td>
                  <td>{d.approved_by}</td>
                  <td>{d.comment}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11">No Data Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
