import React, { useEffect } from "react";
import "../ApprovalConsole/ShowDescModal.css";

const ShowDescModal = ({ closeModal, description }) => {
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  return (
    <>
      <div onClick={closeModal} className="modal-wrapper-desc"></div>
      <div className="modal-container-desc">
        <h1>Description</h1>
        <div className="close-btn" onClick={closeModal}>
          <i className="fa-solid fa-xmark"></i>
        </div>
        <form className="desc_from">
          <div className="col-75">
            <textarea
              id="textDesc"
              placeholder="Description..."
              value={description?.description || ""}
              readOnly
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default ShowDescModal;
