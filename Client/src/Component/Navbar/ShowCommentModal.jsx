import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./ShowCommentModal.css";
import Cookies from "js-cookie";

const ShowCommentModal = ({ closeModal }) => {
  const [values, setValues] = useState({
    description: "",
  });

  const token = Cookies.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:8081/submitFeedback/submit/feedback",
        values,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      toast.success("Thanks for sharing your feedback");
      closeModal();
    } catch (err) {
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
      <div className="scm-modal-wrapper" onClick={closeModal}></div>

      <div className="scm-modal">
        <div className="scm-modal-header">
          <h2>Feedback</h2>
          <span className="scm-close-btn" onClick={closeModal}>
            ×
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            className="scm-textarea"
            placeholder="Enter your application feedback..."
            value={values.description}
            onChange={(e) =>
              setValues({ ...values, description: e.target.value })
            }
          />

          <button type="submit" className="scm-submit-btn">
            Submit Feedback
          </button>
        </form>
      </div>
    </>
  );
};

export default ShowCommentModal;
