import React, { useEffect, useState } from "react";
import "../Weekly_Task/TaskModal.css";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const AssignedTaskModal = ({ closeTaskModal, taskData }) => {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const [employee, setEmployee] = useState([]);
  const [project, setProject] = useState([]);
  const [statusData, setStatusData] = useState([]);

  const [values, setValues] = useState({
    task_name: taskData ? taskData.task_name : "",
    task_description: taskData ? taskData.task_description : "",
    project_id: taskData ? taskData.project_id : "",
    tag_user_id: taskData ? taskData.tag_user_id : "",
    status_id: taskData ? taskData.status_id : "",
    hours: taskData ? taskData.hours : "",
    start_date: taskData ? taskData.start_date : "",
    end_date: taskData ? taskData.end_date : "",
  });

  const fetchEmployee = () => {
    axios
      .get("http://localhost:8081/general-setup/employee/fetch/employee", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setEmployee(res.data.employees);
      })
      .catch((err) => {
        toast.error("You are not authorized! 🔒");
        navigate("/login");
        return;
      });
  };

  const fetchStatus = () => {
    axios
      .get("http://localhost:8081/weekly-task/task-assigne/fetch/task-Status", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setStatusData(res.data.statusData);
      })
      .catch((err) => {
        toast.error("You are not authorized! 🔒");
        navigate("/login");
        return;
      });
  };

  const fetchProject = () => {
    axios
      .get("http://localhost:8081/weekly-task/project/fetch/projects", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setProject(res.data.project);
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
    fetchProject();
    fetchStatus();
  }, []);

  useEffect(() => {
    if (taskData) {
      setValues({
        task_name: taskData.task_name,
        task_description: taskData.task_description,
        project_id: taskData.project_id,
        tag_user_id: taskData.tag_user_id,
        status_id: taskData.status_id,
        hours: taskData.hours,
        start_date: taskData.start_date,
        end_date: taskData.end_date,
      });
    }
  }, [taskData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (taskData) {
        response = await axios.put(
          `http://localhost:8081/weekly-task/task-assigne/edit/task/${taskData.id}`,
          values,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        toast.success("Task updated successfully");
      } else {
        toast.error("Something went to wrong");
      }
      closeTaskModal();
    } catch (err) {
      console.error("Error response:", err.response);

      // Extract backend validation errors and show them
      if (err.response && err.response.data) {
        const { errors, message, error } = err.response.data;

        if (Array.isArray(errors)) {
          errors.forEach((e) => toast.error(e.msg));
        } else if (message) {
          toast.error(message);
        } else if (error) {
          toast.error(error);
        } else {
          toast.error("An unexpected error occurred.");
        }
      } else {
        toast.error("Server not responding.");
      }
    }
  };

  const formatTimeInput = (value) => {
    const clean = value.replace(/\D/g, ""); // Remove non-numeric
    if (clean.length === 3) {
      return `0${clean[0]}:${clean.slice(1)}:00`; // e.g., 850 -> 08:50:00
    } else if (clean.length === 4) {
      return `${clean.slice(0, 2)}:${clean.slice(2)}:00`; // e.g., 1230 -> 12:30:00
    } else if (/^\d{2}:\d{2}$/.test(value)) {
      return `${value}:00`; // if already HH:MM, add :00
    } else if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return value; // already valid format
    }
    return value; // fallback
  };

  const normalizeDate = (input) => {
    // Replace common separators with slash
    const cleaned = input.replace(/[-.]/g, "/").trim();
    const parts = cleaned.split("/");

    let day, month, year;

    if (parts.length === 3) {
      // Try different common orders
      if (parts[0].length === 4) {
        // yyyy/mm/dd
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts[2].length === 4) {
        // dd/mm/yyyy or mm/dd/yyyy (guessing dd/mm/yyyy)
        day = parts[0];
        month = parts[1];
        year = parts[2];
      } else {
        return input; // Unrecognized, return as is
      }

      // Pad day and month
      day = day.padStart(2, "0");
      month = month.padStart(2, "0");

      return `${day}/${month}/${year}`;
    }

    return input; // fallback
  };

  return (
    <>
      <div onClick={closeTaskModal} className="modal-wrapper-employee"></div>
      <div className="modal-container">
        <h1>{taskData ? "Edit " : "Create "} Task Details</h1>
        <div className="close-btn" onClick={closeTaskModal}>
          <i className="fa-solid fa-xmark"></i>
        </div>
        <form className="emp_form" onSubmit={handleSubmit}>
          <div className="field_t">
            <div className="col-75">
              <input
                value={values.task_name}
                onChange={(e) =>
                  setValues({ ...values, task_name: e.target.value })
                }
                type="text"
                placeholder="Enter Task Name"
                disabled={true}
              />
            </div>
          </div>
          <div className="col-75">
            <textarea
              value={values.task_description}
              onChange={(e) =>
                setValues({ ...values, task_description: e.target.value })
              }
              type="text"
              placeholder="Enter Task Description "
              disabled={true}
            />
          </div>

          <div className="field_t">
            <div className="col-75">
              <select
                value={values.project_id}
                onChange={(e) =>
                  setValues({ ...values, project_id: e.target.value })
                }
                disabled={true}
              >
                <option value="">-- Choose Project --</option>
                {project.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-75">
              <select
                value={values.status_id}
                onChange={(e) =>
                  setValues({ ...values, status_id: e.target.value })
                }
              >
                <option value="">-- Status --</option>
                {statusData.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field_t">
            <div className="col-75" id="time-input">
              <input
                value={values.hours}
                onChange={(e) => {
                  const raw = e.target.value;
                  setValues({ ...values, hours: raw });
                }}
                onBlur={(e) => {
                  const formatted = formatTimeInput(e.target.value);
                  setValues({ ...values, hours: formatted });
                }}
                type="text"
                placeholder="Enter Hours (e.g. 850)"
                disabled={true}
              />
            </div>
            <div className="col-75">
              <input
                value={values.start_date}
                onChange={(e) =>
                  setValues({ ...values, start_date: e.target.value })
                }
                onBlur={(e) => {
                  const formatted = normalizeDate(e.target.value);
                  setValues({ ...values, start_date: formatted });
                }}
                type="text"
                placeholder="Enter Start Date.."
                disabled={true}
              />
            </div>

            <div className="col-75">
              <input
                value={values.end_date}
                onChange={(e) =>
                  setValues({ ...values, end_date: e.target.value })
                }
                onBlur={(e) => {
                  const formatted = normalizeDate(e.target.value);
                  setValues({ ...values, end_date: formatted });
                }}
                type="text"
                placeholder="Enter End Date.."
                disabled={true}
              />
            </div>
          </div>

          <div className="row">
            <button type="submit" id="btn_submit">
              {taskData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AssignedTaskModal;
