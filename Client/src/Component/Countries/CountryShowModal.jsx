import React, { useEffect } from "react";
import "../Countries/CountryShowModal.css";

const CountryShowModal = ({ closeModal }) => {
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  return (
    <>
      <div onClick={closeModal} className="modal-wrapper"></div>
      <div className="modal-container">
        <h1>Edit/Save Country</h1>
        <div className="close-btn" onClick={closeModal}>
          <i class="fa-solid fa-xmark"></i>
        </div>
        <form className="emp_from" action="action_page.php">
          <div className="col-75">
            <input type="text" placeholder="Enter Country Name.." />
          </div>

          <div className="col-75">
            <textarea type="text" placeholder="Enter Country Description.." />
          </div>
          <div className="row">
            {/* <input  value="Create" /> */}
            <button onClick={closeModal} id="btn_submit">
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CountryShowModal;
