import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../Navbar/Nav.css";
import Logo from "../ImageSource/Logo.png";
import Cookies from "js-cookie";

function Navbar() {
  const [isActive, setIsActive] = useState(false);
  const [role, setRole] = useState(null);
  const token = Cookies.get("token");
  const toggleMenu = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/general-setup/employee/fetch/authorize",
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        // Assuming response is { "Authorize_Role": [ { "role": "User" } ] }
        const fetchedRole = response.data?.Authorize_Role?.[0]?.role;
        console.log("Fetched role from backend:", fetchedRole);
        setRole(fetchedRole);
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };

    fetchRole();
  }, []);

  return (
    <>
      <header className={isActive ? "active" : ""}>
        <Link to="#" className="logo">
          {/* <img src={Logo} alt="Logo" className="logo_img" /> */}
        </Link>
        <div className="menuToggle" onClick={toggleMenu}></div>
        <nav>
          <ul>
            {role && (
              <>
                <li>
                  <Link to="/timelog">Timesheet</Link>
                </li>
                {(role === "Manager" || role === "Admin") && (
                  <>
                    <li>
                      <Link to="/weekly-task">Weekly Task</Link>
                    </li>
                    <li>
                      <Link to="/approval-console">Approval Console</Link>
                    </li>
                  </>
                )}

                {role === "Admin" && (
                  <>
                    <li>
                      <Link to="/">Dashboard</Link>
                    </li>
                    <li>
                      <Link to="/resource-matrix">
                        Resource Utilization Matrix
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        General Setup &nbsp;
                        <i className="fa-solid fa-caret-down"></i>
                      </Link>
                      <ul>
                        <li>
                          <Link to="/general-setup/employee">Employee</Link>
                        </li>
                        <li>
                          <Link to="/general-setup/roles">Roles</Link>
                        </li>
                        <li>
                          <Link to="/general-setup/department">Department</Link>
                        </li>
                      </ul>
                    </li>

                    <li>
                      <Link to="/report">
                        Report Section &nbsp;
                        <i className="fa-solid fa-caret-down"></i>
                      </Link>
                      <ul>
                        <li>
                          <Link to="/report/approval-report">
                            Approval Report
                          </Link>
                        </li>
                        {/* <li>
                          <Link to="/report/defaulter">Defaulter</Link>
                        </li> */}
                        {/* <li>
                          <Link to="/report/timelog-report">
                            TimeLog Report
                          </Link>
                        </li>
                        <li>
                          <Link to="/report/hours">Hours Utilization</Link>
                        </li> */}
                        <li>
                          <Link to="/report/unallocated-emp">Unallocated Employee</Link>
                        </li>
                      </ul>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </nav>
      </header>
    </>
  );
}

export default Navbar;
