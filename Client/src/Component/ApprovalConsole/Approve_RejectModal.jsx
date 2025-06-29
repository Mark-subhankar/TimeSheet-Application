import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import "../ApprovalConsole/Approve_RejectModal.css";

const Approve_RejectModal = ({
  closeModal_Approve_Reject,
  approval_data,
  status,
}) => {
  const [comment, setComment] = useState("");
  const token = Cookies.get("token");

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    console.log("Approved Data: ", approval_data);
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        id: approval_data.id, // assuming this is your unique timesheet ID
        status: status === "approved" ? "A" : "R",
        comment: comment,
      };

      await axios.put(
        "http://localhost:8081/console/update/timesheet-status",
        payload,
        {
          headers: { Authorization: `${token}` },
        }
      );

      toast.success(
        `Timesheet successfully ${
          status === "approved" ? "approved" : "rejected"
        }!`
      );
      // setComment("");
      closeModal_Approve_Reject();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update timesheet status.");
    }
  };

  return (
    <>
      <div
        onClick={closeModal_Approve_Reject}
        className="modal-wrapper-app_rej"
      ></div>

      <div className="modal-container">
        <h1>
          {status === "approved"
            ? "Approve Comment Section"
            : "Reject Comment Section"}
        </h1>

        <div className="close-btn" onClick={closeModal_Approve_Reject}>
          <i className="fa-solid fa-xmark"></i>
        </div>

        <form className="emp_form" onSubmit={handleSubmit}>
          <div className="col-75">
            <textarea
              id="textDesc"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                status === "approved"
                  ? "Write approval reason (optional)..."
                  : "Write rejection reason (optional)..."
              }
              // Remove required since comment is optional
            />
          </div>

          <div className="row">
            <button type="submit" id="btn_submit">
              Send &nbsp; <i className="fa-regular fa-paper-plane"></i>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Approve_RejectModal;
