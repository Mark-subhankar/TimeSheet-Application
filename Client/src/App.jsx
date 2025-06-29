import { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Component/Navbar/Navbar";
import Dashboard from "./Component/Dashboard/Dashboard";
import Timelog from "./Component/TimeLog/Timelog";
import Defaulter from "./Component/Defaulter/Defaulter";
import WeeklyTask from "./Component/Weekly_Task/WeeklyTask";
import ApprovalConsole from "./Component/ApprovalConsole/ApprovalConsole";
import ResourceMatrix from "./Component/ResourceMatrix/ResourceMatrix";
import Employee from "./Component/Employee/Employee";
import Unallocated_Emp from "./Component/UnallocatedEmployee/Unallocated_Emp";
import Approval_Report from "./Component/ApprovalReport/Approval_Report";
import Roles from "./Component/Roles/Roles";
import UserRolePermission from "./Component/RolePermission/UserRolePermission";
import Countries from "./Component/Countries/Countries";
import "../src/App.css";
import TopNavbar from "./Component/Navbar/TopNavbar";
import Department from "./Component/Department/Department";
import Login from "./Component/LoginPage/Login";
import ChangePassword from "./Component/ChangePassword/ChangePassword";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="app">
      <Router>
        {loading ? (
          // Show spinner while loading
          <div className="spinner-container">
            <ClipLoader color={"red"} loading={loading} size={50} />
          </div>
        ) : (
          <>
            {location.pathname !== "/login" &&
              location.pathname !== "/change" && (
                <>
                  <TopNavbar />
                  <Navbar />
                </>
              )}
            <ToastContainer
              position="top-center"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              transition={Bounce}
            />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/change" element={<ChangePassword />} />
              <Route exact path="/" element={<Dashboard />} />
              <Route exact path="/timelog" element={<Timelog />} />
              <Route exact path="/weekly-task" element={<WeeklyTask />} />
              <Route
                exact
                path="/approval-console"
                element={<ApprovalConsole />}
              />
              <Route
                exact
                path="/resource-matrix"
                element={<ResourceMatrix />}
              />

              <Route
                exact
                path="/general-setup/employee"
                element={<Employee />}
              />

              <Route exact path="/general-setup/roles" element={<Roles />} />
              <Route
                exact
                path="/general-setup/role-permissions"
                element={<UserRolePermission />}
              />
              <Route
                exact
                path="/general-setup/countries"
                element={<Countries />}
              />

              <Route
                exact
                path="/general-setup/department"
                element={<Department />}
              />
              <Route
                exact
                path="/report/unallocated-emp"
                element={<Unallocated_Emp />}
              />

              <Route
                exact
                path="/report/approval-report"
                element={<Approval_Report />}
              />

              <Route exact path="/report/defaulter" element={<Defaulter />} />
            </Routes>
          </>
        )}
      </Router>
    </div>
  );
}

export default App;
