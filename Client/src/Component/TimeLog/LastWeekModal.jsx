import React, { useEffect, useState } from "react";
import "../TimeLog/LastWeekModal.css";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const LastWeekModal = ({closeLastWeekModal}) => {
  const [lastWeekData, setLastWeekData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();
  const token = Cookies.get("token");
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  const fetchLastweekData = () => {
    axios
      .get("http://localhost:8081/timesheet/fetch/last-week", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setLastWeekData(res.data.TimesheetData);
        setFilteredData(res.data.TimesheetData);
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
    fetchLastweekData();
  }, []);

  return (
    <div className="modal-wrapper-lastweek" onClick={closeLastWeekModal}>
      <div className="modal-lastweek" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <span onClick={closeLastWeekModal} className="close">
            &times;
          </span>
          <h2 id="text_heading">Previous Week Report</h2>
          <div className="week-border-last">
            <div className="table-container-Timesheet-lastweek">
              <table>
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Project Name</th>
                    <th>Week Day</th>
                    <th> Remark</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Approved By</th>
                    <th>Working Date</th>
                    <th>Hours Worked</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((ts) => (
                      <tr key={ts.id}>
                        <td>{ts.task_name}</td>
                        <td>{ts.project_name || "-"}</td>
                        <td>{ts.week_day || "-"}</td>
                        <td>{ts.comment}</td>
                        <td className="description-cell">{ts.description}</td>
                        <td>{ts.status}</td>
                        <td>{ts.approved_by}</td>
                        <td>{ts.working_date}</td>
                        <td>{ts.hours_worked}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="14">No timesheets found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastWeekModal;
