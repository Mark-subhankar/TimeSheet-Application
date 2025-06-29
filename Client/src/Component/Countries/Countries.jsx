import React, { useState } from "react";
import "../Countries/Countries.css"
import CountryShowModal from "./CountryShowModal";

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
      <h2 id="emp_id">Country Details</h2>

      <div className="search-container">
        <input type="text" placeholder="Search.." />
        <button onClick={openModal} id="create_btn">
          Create
        </button>
      </div>

      {showModal && <CountryShowModal closeModal={closeModal} />}

      <table>
        <thead>
          <tr>
            <th>Edit</th>
            <th>Country Name</th>
            <th>Description</th>
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
            <td>India</td>
            <td>I love India</td>
            <td>subhankardas@gmail.com</td>
            <td>08-03-2024</td>
            <td>nooruk@gmail.com</td>
            <td>09-05-2024</td>
            <td><i className="fa-solid fa-trash"></i></td>
          </tr>
          <tr>
            <td><i onClick={openModal} className="fa-regular fa-pen-to-square"></i></td>
            <td>India</td>
            <td>I love India</td>
            <td>subhankardas@gmail.com</td>
            <td>08-03-2024</td>
            <td>nooruk@gmail.com</td>
            <td>09-05-2024</td>
            <td><i className="fa-solid fa-trash"></i></td>
          </tr>
          <tr>
            <td><i onClick={openModal} className="fa-regular fa-pen-to-square"></i></td>
            <td>India</td>
            <td>I love India</td>
            <td>subhankardas@gmail.com</td>
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
