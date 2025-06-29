import React, { useEffect, useState } from "react";
import "../ChangePassword/ChangePassword.css";

const ShowModal = ({ closeModal }) => {
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [conPasswordVisible, setConPasswordVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  return (
    <>
      <div className="modal-wrapper"></div>
      <div className="modal-container">
        <h1>Change Password</h1>
        <form className="emp_from" action="action_page.php">
          <div className="col-75 password-field">
            <input
              type={oldPasswordVisible ? "text" : "password"}
              placeholder="Enter your old password.."
            />
            <i
              className={`fa-regular ${
                oldPasswordVisible ? "fa-eye" : "fa-eye-slash"
              }`}
              onClick={() => setOldPasswordVisible(!oldPasswordVisible)}
            ></i>
          </div>
          <div className="col-75 password-field">
            <input
              type={newPasswordVisible ? "text" : "password"}
              placeholder="Enter your new password.."
            />
            <i
              className={`fa-regular ${
                newPasswordVisible ? "fa-eye" : "fa-eye-slash"
              }`}
              onClick={() => setNewPasswordVisible(!newPasswordVisible)}
            ></i>
          </div>{" "}
          <div className="col-75 password-field">
            <input
              type={conPasswordVisible ? "text" : "password"}
              placeholder="Enter your new confirm password.."
            />
            <i
              className={`fa-regular ${
                conPasswordVisible ? "fa-eye" : "fa-eye-slash"
              }`}
              onClick={() => setConPasswordVisible(!conPasswordVisible)}
            ></i>
          </div>
          <div className="row">
            <button id="btn_login_submit">Change</button>
          </div>

          <div className="row_change">
            <p>
              Do you want to change the password?<a href="/login">Back to login</a>
            </p>
          </div>


        </form>
      </div>
    </>
  );
};

export default ShowModal;
