import React, { useEffect, useState } from "react";
import "../Department/DepartmentModal.css";
import axios from "axios";
import { toast } from "react-toastify";

const DepartmentModal = ({ closeModal, department }) => {
  // Lock background scroll when modal opens
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  const [values, setValues] = useState({
    name: department ? department.department_name : "",
    description: department ? department.description : "",
  });

  useEffect(() => {
    if (department) {
      setValues({
        name: department.department_name,
        description: department.description,
      });
    }
  }, [department]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (department) {
        // Update Department
        await axios.put(
          `http://localhost:8081/general-setup/department/edit/department/${department.id}`,
          values,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        toast.success("Department updated successfully");
      } else {
        // Create Department
        await axios.post(
          "http://localhost:8081/general-setup/department/create/department",
          values,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        toast.success("Department created successfully");
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
      <div onClick={closeModal} className="modal-wrapper-department"></div>
      <div className="modal-container">
        <h1>{department ? "Edit" : "Create"} Department Details</h1>
        <div className="close-btn" onClick={closeModal}>
          <i className="fa-solid fa-xmark"></i>
        </div>
        <form className="emp_from" onSubmit={handleSubmit}>
          <div className="col-75">
            <input
              type="text"
              placeholder="Enter Department Name.."
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
            />
          </div>

          <div className="col-75">
            <textarea
              placeholder="Enter Description.."
              value={values.description}
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>

          <div className="row">
            <button type="submit" id="btn_submit">
              {department ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default DepartmentModal;
