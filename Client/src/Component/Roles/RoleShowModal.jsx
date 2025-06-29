import React, { useEffect , useState} from "react";
import "../Roles/RoleShowModal.css";
import axios from "axios";
import { toast } from "react-toastify";


const RoleShowModal = ({ closeModal ,roles}) => {
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  const [values, setValues] = useState({
    role: roles ? roles.role : "",
    description: roles ? roles.description : "",
  });

  useEffect(() => {
    if (roles) {
      setValues({
        role: roles.role,
        description: roles.description,
      });
    }
  }, [roles]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (roles) {
        // Update Role
        await axios.put(
          `http://localhost:8081/general-setup/role/edit/role/${roles.id}`,
          values,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        toast.success("Role updated successfully");
      } else {
        // Create Department
        await axios.post(
          "http://localhost:8081/general-setup/role/create/roles",
          values,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        toast.success("Role created successfully");
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
        <h1>{roles ? "Edit" : "Create"} Roles Details</h1>
        <div className="close-btn" onClick={closeModal}>
          <i class="fa-solid fa-xmark"></i>
        </div>
        <form className="emp_from" onSubmit={handleSubmit}>
          <div className="col-75">
            <input type="text" placeholder="Enter Roles Name.." value={values.role} onChange={(e) => setValues({ ...values, role: e.target.value })}/>
          </div>

          <div className="col-75">
            <textarea type="text" placeholder="Enter Roles Description.." value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })}/>
          </div>
          <div className="row">
            {/* <input  value="Create" /> */}
            <button type="submit"  id="btn_submit">
            {roles ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RoleShowModal;
