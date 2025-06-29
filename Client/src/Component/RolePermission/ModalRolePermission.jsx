import React, { useEffect } from "react";
import "../RolePermission/ModalRolePermission.css";

const ModalRolePermission = ({ closeModal }) => {
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  return (
    <>
      <div onClick={closeModal} className="modal-wrapper-emp-role"></div>
      <div className="modal-container">
        <h1>Edit/Save Employee Role Permission</h1>
        <div className="close-btn" onClick={closeModal}>
          <i class="fa-solid fa-xmark"></i>
        </div>
        <form className="emp_from" action="action_page.php">
          <div className="col-75">
            <select>
              <option selected>-- Choose Employee --</option>
              <option>Subhankar das</option>
              <option>Vivk Mondal</option>
              <option>Noorul Ansary</option>
            </select>
          </div>

          <div className="col-75">
            <select>
              <option selected>-- Choose Role --</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>Employee</option>
            </select>
          </div>

          <div className="col-75">
              <textarea type="text" placeholder="Enter Comment.." />
            </div>
          <div className="row">
            <button onClick={closeModal} id="btn_submit">
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ModalRolePermission;
