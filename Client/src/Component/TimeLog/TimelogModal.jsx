import React, { useEffect, useState } from "react";
import "../TimeLog/TimelogModal.css";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TimelogModal = ({ closeModal, timesheetData }) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday=0, Monday=1, ..., Saturday=6
  const mondayOfWeek = new Date(today);
  mondayOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const [project, setProject] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [asstask, setAssTask] = useState([]);

  // const [selectedDate, setSelectedDate] = useState(
  //   timesheetData?.working_date ? new Date(timesheetData.working_date) : null
  // );

  const [selectedDate, setSelectedDate] = useState(() => {
    if (timesheetData && typeof timesheetData.working_date === "string") {
      const [day, month, year] = timesheetData.working_date.split("/");
      if (day && month && year) {
        return new Date(`${year}-${month}-${day}`);
      }
    }
    return null;
  });

  const [weekday, setWeekday] = useState(timesheetData?.week_day || "");

  const [values, setValues] = useState({
    project_id: timesheetData?.project_id || "",
    task_id: timesheetData?.task_id || "",
    working_date: timesheetData?.working_date || "",
    week_day: timesheetData?.week_day || "",
    hours: timesheetData?.hours_worked || "",
    description: timesheetData?.description || "",
  });

  const navigate = useNavigate();
  const token = Cookies.get("token");

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email);
      } catch (error) {
        console.error("Invalid Token:", error);
      }
    }
  }, [token]);
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const options = { weekday: "long" };
      const dayName = new Intl.DateTimeFormat("en-US", options).format(date);

      // Use local time to avoid timezone shift
      const formattedDate =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0");

      setWeekday(dayName);
      setValues((prev) => ({
        ...prev,
        working_date: formattedDate,
        week_day: dayName,
      }));
    } else {
      setWeekday("");
      setValues((prev) => ({
        ...prev,
        working_date: "",
        week_day: "",
      }));
    }
  };

  const fetchProject = () => {
    axios
      .get("http://localhost:8081/timesheet/fetch/assiged-task", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setProject(res.data.AssignedTask || []);
      })
      .catch(() => {
        toast.error("You are not authorized fetchProject! 🔒");
        navigate("/login");
      });
  };

  const fetchAssignedtask = () => {
    axios
      .get(`http://localhost:8081/timesheet/fetch/assiged-task`, {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setAssTask(res.data.AssignedTask || []);
        console.log(res.data.AssignedTask);
      })
      .catch(() => {
        toast.error("You are not authorized fetchAssignedtask! 🔒");
        navigate("/login");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (timesheetData) {
        await axios.put(
          `http://localhost:8081/timesheet/edit/timesheet/${timesheetData.id}`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );
        toast.success("Record updated successfully done");
      } else {
        await axios.post(
          "http://localhost:8081/timesheet/create/timesheet",
          values,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );
        toast.success("TimeSheet created successfully");
      }
      closeModal();
    } catch (err) {
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

  useEffect(() => {
    if (!token) {
      toast.error("Please login first! 🔒");
      navigate("/login");
    } else {
      fetchProject();
      fetchAssignedtask();
    }
  }, [token]);

  const formatTimeInput = (value) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length === 3) {
      return `0${clean[0]}:${clean.slice(1)}:00`;
    } else if (clean.length === 4) {
      return `${clean.slice(0, 2)}:${clean.slice(2)}:00`;
    } else if (/^\d{2}:\d{2}$/.test(value)) {
      return `${value}:00`;
    } else if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return value;
    }
    return value;
  };

  return (
    <>
      <div onClick={closeModal} className="modal-wrapper-timesheet"></div>
      <div className="modal-container">
        <h1>{timesheetData ? "Edit" : "Add"} TimeSheet</h1>
        <div className="close-btn" onClick={closeModal}>
          <i className="fa-solid fa-xmark"></i>
        </div>
        <form className="emp_from" onSubmit={handleSubmit}>
          <div className="field_t">
            <div className="col-75">
              <select
                required
                value={values.project_id}
                onChange={(e) =>
                  setValues({ ...values, project_id: e.target.value })
                }
              >
                <option value="">-- Choose Project --</option>
                {project.length > 0 ? (
                  project.map((p) => (
                    <option key={p.project_id} value={p.project_id}>
                      {p.project}
                    </option>
                  ))
                ) : (
                  <option disabled>No projects found...</option>
                )}
              </select>
            </div>

            <div className="col-75">
              <select
                required
                value={values.task_id}
                onChange={(e) =>
                  setValues({ ...values, task_id: e.target.value })
                }
              >
                <option value="">-- Choose Task --</option>
                {asstask.length > 0 ? (
                  asstask.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.task_name}
                    </option>
                  ))
                ) : (
                  <option disabled>No tasks found...</option>
                )}
              </select>
            </div>
          </div>

          <div className="field_t">
            <div className="col-75">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="-- Choose working date --"
                required
                minDate={mondayOfWeek}
                maxDate={today}
                filterDate={(date) => {
                  const day = date.getDay();
                  return day !== 0 && day !== 6; // Exclude Sunday (0) and Saturday (6)
                }}
              />
            </div>

            <div className="col-75">
              <input
                type="text"
                id="week"
                placeholder="Week Day"
                value={weekday}
                readOnly
              />
            </div>

            <div className="col-75" id="time-input">
              <input
                required
                value={values.hours}
                onChange={(e) =>
                  setValues({ ...values, hours: e.target.value })
                }
                onBlur={(e) =>
                  setValues({
                    ...values,
                    hours: formatTimeInput(e.target.value),
                  })
                }
                type="text"
                placeholder="Enter Hours (e.g. 850)"
              />
            </div>
          </div>

          <div className="col-75">
            <textarea
              placeholder="Enter Description.."
              value={values.description}
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
              required
            />
          </div>

          <div className="row">
            <button type="submit" id="btn_submit">
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TimelogModal;
