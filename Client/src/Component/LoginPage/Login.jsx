import React, { useEffect, useState } from "react";
import "../LoginPage/Login.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";  

const ShowModal = ({ closeModal }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();  

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "scroll";
    };
  }, []);

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8081/general-setup/employee/login", values, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true    // this is crucial
      });
      
      // toast.success("Login successfully done");

      navigate("/timelog", { replace: true });
      setTimeout(() => {
        window.location.reload();
      }, 100); 


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
      <div className="modal-wrapper"></div>
      <div className="modal-container">
        <h1>Login</h1>
        <form className="emp_from" onSubmit={handleSubmit}>
          <div className="col-75">
            <input
              type="text"
              placeholder="Enter your email.."
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
            />
          </div>
          <div className="col-75 password-field">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password.."
              value={values.password}
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
            />
            <i
              className={`fa-regular ${
                passwordVisible ? "fa-eye" : "fa-eye-slash"
              }`}
              onClick={() => setPasswordVisible(!passwordVisible)}
            ></i>
          </div>

          <div className="row">
            <button type="submit" id="btn_login_submit">
              Log In
            </button>
          </div>

          <div className="row_change">
            <p>
              Do you want to change the password ?{" "}
              <a href="/change">Change Password</a>
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

export default ShowModal;
