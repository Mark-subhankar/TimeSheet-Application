import React, { useState, useEffect } from "react";
import "../Timelog/Timelog.css";
import TimelogModal from "./TimelogModal";
import LastWeekModal from "./LastWeekModal";
import AssignedTaskModal from "./AssignedTaskModal";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export default function Timelog() {
  const [showModal, setShowModal] = useState(false);
  const [lastWeekModal, setlastWeekModal] = useState(false);
  const [showAssTaskModal, setShowAssTaskModal] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTask, setSearchTask] = useState("");

  const [timesheets, setTimesheets] = useState([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [searchTimesheet, setSearchTimesheet] = useState("");

  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);

  const navigate = useNavigate();
  const token = Cookies.get("token");

  const fetchTimesheets = () => {
    axios
      .get("http://localhost:8081/timesheet/fetch/timesheet-data", {
        headers: { Authorization: token },
      })
      .then((res) => {
        const data = res.data.TimesheetData || [];
        setTimesheets(data);
        setFilteredTimesheets(data);
      })
      .catch((err) => {
        toast.error("You are not authorized! 🔒");
        navigate("/login");
      });
  };

  const fetchAssignedTasks = () => {
    axios
      .get("http://localhost:8081/timesheet/fetch/assiged-task", {
        headers: { Authorization: token },
      })
      .then((res) => {
        const data = res.data.AssignedTask || [];
        setAssignedTasks(data);
        setFilteredTasks(data);
      })
      .catch((err) => {
        toast.error("You are not authorized person! 🔒");
        navigate("/login");
      });
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login first! 🔒");
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.email);
    } catch (error) {
      console.error("Invalid Token:", error);
    }

    fetchAssignedTasks();
    fetchTimesheets();
  }, []);

  const handleTaskSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTask(value);
    setFilteredTasks(
      value
        ? assignedTasks.filter((task) =>
            Object.values(task).some((field) =>
              field?.toString().toLowerCase().includes(value)
            )
          )
        : assignedTasks
    );
  };

  const handleTimesheetSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTimesheet(value);
    setFilteredTimesheets(
      value
        ? timesheets.filter((ts) =>
            Object.values(ts).some((field) =>
              field?.toString().toLowerCase().includes(value)
            )
          )
        : timesheets
    );
  };

  const openTimesheetModal = (timesheet = null) => {
    setSelectedTimesheet(timesheet);
    setShowModal(true);
  };

  const closeTimesheetModal = () => {
    setShowModal(false);
    fetchTimesheets();
  };

  const openLastWeekModal = () => {
    setlastWeekModal(true);
  };

  const closeLastWeekModal = () => {
    setlastWeekModal(false);
    fetchTimesheets();
  };

  const openTaskModal = (task = null) => {
    setSelectedTask(task);
    setShowAssTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowAssTaskModal(false);
    fetchAssignedTasks();
  };

  const handleDeleteTimesheet = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8081/timesheet/delete/timesheet/${id}`
      );
      toast.success("Record deleted successfully!");
      fetchTimesheets();
    } catch (error) {
      toast.error("❌ Failed to delete record");
    }
  };

  return (
    <div>
      {/* Assigned Task Section */}
      <div className="boder-containter">
        <h2 id="emp_id">Assigned Task</h2>

        <div className="speace-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search..."
              value={searchTask}
              onChange={handleTaskSearch}
            />
          </div>

          {showAssTaskModal && (
            <AssignedTaskModal
              closeTaskModal={closeTaskModal}
              taskData={selectedTask}
            />
          )}

          {lastWeekModal && (
            <LastWeekModal closeLastWeekModal={closeLastWeekModal} />
          )}

          <div className="table-container-assTask">
            <table>
              <thead>
                <tr>
                  <th>Edit</th>
                  <th>Task Name</th>
                  <th>Task Description</th>
                  <th>Project Assigned</th>
                  <th>Status</th>
                  <th>Hours</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <i
                          onClick={() => openTaskModal(task)}
                          className="fa-regular fa-pen-to-square"
                        ></i>
                      </td>
                      <td>{task.task_name}</td>
                      <td>{task.task_description}</td>
                      <td>{task.project}</td>
                      <td>{task.status}</td>
                      <td>{task.hours}</td>
                      <td>{task.start_date}</td>
                      <td>{task.end_date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No tasks found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Timesheet Section */}
      <div className="boder-containter">
        <h2 id="emp_id">Timesheet</h2>

        <div className="speace-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search..."
              value={searchTimesheet}
              onChange={handleTimesheetSearch}
            />
            <button onClick={() => openLastWeekModal()} id="create_btn">
              <i className="fa-solid fa-circle-chevron-left"></i> Last Week
            </button>
            <button onClick={() => openTimesheetModal(null)} id="create_btn">
              Create
            </button>
          </div>

          {showModal && (
            <TimelogModal
              closeModal={closeTimesheetModal}
              timesheetData={selectedTimesheet}
            />
          )}

          <div className="table-container-Timesheet">
            <table>
              <thead>
                <tr>
                  <th>Edit</th>
                  <th>Project Name</th>
                  <th>Task Name</th>
                  <th>Work Date</th>
                  <th>Week Day</th>
                  <th>Hours Worked</th>
                  <th>Description</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimesheets.length > 0 ? (
                  filteredTimesheets.map((ts) => (
                    <tr key={ts.id}>
                      <td>
                        <i
                          onClick={() => openTimesheetModal(ts)}
                          className="fa-regular fa-pen-to-square"
                        ></i>
                      </td>
                      <td>{ts.project_name}</td>
                      <td>{ts.task_name}</td>
                      <td>{ts.working_date}</td>
                      <td>{ts.week_day}</td>
                      <td>{ts.hours_worked}</td>
                      <td>{ts.description}</td>
                      <td>{ts.created_by}</td>
                      <td>{ts.created_at}</td>
                      <td>
                        <i
                          className="fa-solid fa-trash"
                          onClick={() => handleDeleteTimesheet(ts.id)}
                        ></i>
                      </td>
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
      </div>
    </div>
  );
}
