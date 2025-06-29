import React, { useState } from "react";
import "../RolePermission/UserRolePermission.css"
import ModalRolePermission from "./ModalRolePermission";

// export default function Employee() {
  export default function Countries() {

  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };
  
  return (
    <div>
      <h2 id="emp_id">Employee Role Permission</h2>

      <div className="search-container">
        <input type="text" placeholder="Search.." />
        <button onClick={openModal} id="create_btn">
          Create
        </button>
      </div>

      {showModal && <ModalRolePermission closeModal={closeModal} />}

      <table>
        <thead>
          <tr>
            <th>Edit</th>
            <th>Emoloyee</th>
            <th>Role Name</th>
            <th>Comment</th>
            <th>Created By</th>
            <th>Created At</th>
            <th>Updated By</th>
            <th>Updated At</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td ><i onClick={openModal} className="fa-regular fa-pen-to-square"></i></td>
            <td>Subhankar das</td>
            <td>Admin</td>
            <td>Created for Access resone</td>
            <td>vivk@gmail.com</td>
            <td>08-03-2024</td>
            <td>nooruk@gmail.com</td>
            <td>09-05-2024</td>
            <td><i className="fa-solid fa-trash"></i></td>
          </tr>
          <tr>
            <td><i onClick={openModal} className="fa-regular fa-pen-to-square"></i></td>
            <td>Subhankar das</td>
            <td>Admin</td>
            <td>Created for Access resone</td>
            <td>vivk@gmail.com</td>
            <td>08-03-2024</td>
            <td>nooruk@gmail.com</td>
            <td>09-05-2024</td>
            <td><i className="fa-solid fa-trash"></i></td>
          </tr>
          <tr>
            <td><i onClick={openModal} className="fa-regular fa-pen-to-square"></i></td>
            <td>Subhankar das</td>
            <td>Admin</td>
            <td>Created for Access resone</td>
            <td>vivk@gmail.com</td>
            <td>08-03-2024</td>
            <td>nooruk@gmail.com</td>
            <td>09-05-2024</td>
            <td><i className="fa-solid fa-trash"></i></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
