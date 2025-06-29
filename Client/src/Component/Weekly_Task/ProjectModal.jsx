import React, { useEffect, useState } from "react";
import "../Weekly_Task/ProjectModal.css";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";


const ProjectModal = ({ closeModal, project }) => {
  const [values, setValues] = useState({
    project_name: project ? project.project_name : "",
    project_description: project ? project.project_description : "",
  });
  const [manager, setManager] = useState([]);
  const navigate = useNavigate();
  const token = Cookies.get("token");


  const fetchManager = () => {
    axios
      .get("http://localhost:8081/general-setup/employee/fetch/managers")
      .then((res) => {
        setManager(res.data.managers);
      })
      .catch((err) => {
        toast.error("Something went to wrong", err);
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
    fetchManager();
  }, []);

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  useEffect(() => {
    if (project) {
      setValues({
        project_name: project ? project.project_name : "",
        project_description: project ? project.project_description : "",
        manager_id : project ? project.manager_id : ""
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (project) {
        // Update Department
        await axios.put(
          `http://localhost:8081/weekly-task/project/edit/project/${project.id}`,
          values,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        toast.success("Project updated successfully");
      } else {
        // Create Department
        await axios.post(
          "http://localhost:8081/weekly-task/project/create/project",
          values,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        toast.success("Project created successfully");
      }
      closeModal();
    } catch (err) {
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

  return (
    <>
      <div onClick={closeModal} className="modal-wrapper-role"></div>
      <div className="modal-container">
        <h1>
          {project ? "Edit " : "Create "}
          Project Details
        </h1>
        <div className="close-btn" onClick={closeModal}>
          <i className="fa-solid fa-xmark"></i>
        </div>
        <form className="emp_from" onSubmit={handleSubmit}>
          <div className="col-75">
            <input
              type="text"
              placeholder="Enter Project Name.."
              value={values.project_name}
              onChange={(e) =>
                setValues({ ...values, project_name: e.target.value })
              }
            />
          </div>

          <div className="col-75">
            <textarea
              type="text"
              placeholder="Enter Project Description.."
              value={values.project_description}
              onChange={(e) =>
                setValues({ ...values, project_description: e.target.value })
              }
            />
          </div>
          <div className="col-75">
            <select
              value={values.manager_id}
              onChange={(e) =>
                setValues({ ...values, manager_id: e.target.value })
              }
            >
              <option value="">-- Choose Manager --</option>
              {manager.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.employee_info}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <button type="submit" id="btn_submit">
              {project ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProjectModal;
