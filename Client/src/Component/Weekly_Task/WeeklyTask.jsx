import React, { useState, useEffect } from "react";
import "../Weekly_Task/Weeklytask.css";
import ProjectModal from "./ProjectModal";
import TaskModal from "./TaskModal";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function WeeklyTask() {
  const [showModal, setShowModal] = useState(false);
  const [searchProject, setsearchProject] = useState("");
  const [selectedProject, setselectedProject] = useState(null);
  const [project, setProject] = useState([]);
  const [filterProject, setFilterProject] = useState([]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTask, setsearchTask] = useState("");
  const [selectedTask, setselectedTask] = useState(null);
  const [task, setTask] = useState([]);
  const [filterTask, setFilterTask] = useState([]);

  const navigate = useNavigate();

  const token = Cookies.get("token");

  // Fetch All Task =====>
  const fetchAllTask = () => {
    axios
      .get("http://localhost:8081/weekly-task/task-assigne/fetch/task", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setTask(res.data.task);
        setFilterTask(res.data.task);
        // console.log(res.data.project);
      })
      .catch((err) => {
        toast.error("You are not authorized! 🔒");
        navigate("/login");
        return;
      });
  };

  // Fetch Project Details ===>
  const fetchAllProjects = () => {
    axios
      .get("http://localhost:8081/weekly-task/project/fetch/projects", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setProject(res.data.project);
        setFilterProject(res.data.project);
        // console.log(res.data.project);
      })
      .catch((err) => {
        toast.error("You are not authorized! 🔒");
        navigate("/login");
        return;
      });
  };

  // Api call and check token exist or not ====>
  useEffect(() => {
    if (!token) {
      toast.error("Please login first! 🔒");
      navigate("/login");
      return;
    }
    fetchAllProjects(); // fetchProjects
    fetchAllTask(); // fetchTasks
  }, []);

  // delete the project data ====>
  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8081/weekly-task/project/delete/project/${id}`
      );
      fetchAllProjects();
      toast.success("Project deleted successfully!");
    } catch (error) {
      toast.error("❌ Failed to delete Task.");
    }
  };

  // delete task data ====>
  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8081/weekly-task/task-assigne/delete/task/${id}`
      );
      fetchAllTask();
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("❌ Failed to delete Task.");
    }
  };

  // project search field functionality =====>
  const handleSearchProject = (event) => {
    const value = event.target.value.toLowerCase();
    setsearchProject(value);

    if (value === "") {
      setFilterProject(project);
    } else {
      setFilterProject(
        project.filter((p) =>
          Object.values(p).some(
            (field) => field && field.toString().toLowerCase().includes(value)
          )
        )
      );
    }
  };

  // Task search field functionality =====>
  const handleSearchTask = (event) => {
    const value = event.target.value.toLowerCase();
    setsearchTask(value);

    if (value === "") {
      setFilterTask(task);
    } else {
      setFilterTask(
        task.filter((p) =>
          Object.values(p).some(
            (field) => field && field.toString().toLowerCase().includes(value)
          )
        )
      );
    }
  };

  const openModal = (project = null) => {
    setselectedProject(project);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    fetchAllProjects();
  };

  const openTaskModal = (taskDetails = null) => {
    setselectedTask(taskDetails);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    fetchAllTask();
  };

  return (
    <div>
      <div className="boder-containter-project">
        <h2 id="emp_id">Project Details</h2>

        <div className="speace-container">
          <div className="search-container-weektask">
            <input
              type="text"
              placeholder="Search.."
              value={searchProject}
              onChange={handleSearchProject}
            />
            <button onClick={() => openModal(null)} id="create_btn">
              Create
            </button>
          </div>

          {showModal && (
            <ProjectModal closeModal={closeModal} project={selectedProject} />
          )}
          {showTaskModal && (
            <TaskModal
              closeTaskModal={closeTaskModal}
              taskData={selectedTask}
            />
          )}

          <div className="table-container-project">
            <table>
              <thead>
                <tr>
                  <th>Edit</th>
                  <th>Project Name</th>
                  <th>Project Description</th>
                  <th>Assigned Manager</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Updated By</th>
                  <th>Updated At</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filterProject.length > 0 ? (
                  filterProject.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <i
                          className="fa-regular fa-pen-to-square"
                          onClick={() => openModal(p)}
                        ></i>
                      </td>
                      <td>{p.project_name}</td>
                      <td>{p.project_description}</td>
                      <td>{p.employee_name}</td>
                      <td>{p.created_by}</td>
                      <td>{p.created_at}</td>
                      <td>{p.updated_by}</td>
                      <td>{p.updated_at}</td>
                      <td>
                        <i
                          className="fa-solid fa-trash"
                          onClick={() => handleDeleteProject(p.id)}
                        ></i>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">No projects found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="boder-containter-project">
        <h2 id="emp_id">Task Assine Details</h2>

        <div className="speace-container">
          <div className="search-container-weektask">
            <input
              type="text"
              placeholder="Search.."
              value={searchTask}
              onChange={handleSearchTask}
            />
            <button onClick={() => openTaskModal(null)} id="create_btn">
              Create
            </button>
          </div>

          <div className="table-container-task">
            <table>
              <thead>
                <tr>
                  <th>Edit</th>
                  <th>Task Name</th>
                  <th>Task Description</th>
                  <th>Project Name</th>
                  <th>Tag User</th>
                  <th>Status</th>
                  <th>Hours</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Updated By</th>
                  <th>Updated At</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filterTask.length > 0 ? (
                  filterTask.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <i
                          onClick={() => openTaskModal(t)}
                          className="fa-regular fa-pen-to-square"
                        />
                      </td>
                      <td>{t.task_name}</td>
                      <td>{t.task_description}</td>
                      <td>{t.project}</td>
                      <td>{t.tag_user}</td>
                      <td>{t.status}</td>
                      <td>{t.hours}</td>
                      <td>{t.start_date}</td>
                      <td>{t.end_date}</td>
                      <td>{t.created_by}</td>
                      <td>{t.created_at}</td>
                      <td>{t.updated_by}</td>
                      <td>{t.updated_at}</td>
                      <td>
                        <i
                          className="fa-solid fa-trash"
                          onClick={() => handleDeleteTask(t.id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="15">No tasks found.</td>
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
