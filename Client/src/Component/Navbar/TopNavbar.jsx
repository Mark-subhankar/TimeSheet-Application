import React, { useState ,useEffect} from "react";
import "../Navbar/TopNavbar.css";
import { Link } from "react-router-dom";
import ShowCommentModal from "./ShowCommentModal";
import NotificationPanel from "./NotificationPanel";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";


function TopNavbar() {
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const navigate = useNavigate();

  const token = Cookies.get("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token); 
        setUserEmail(decoded.email); 
      } catch (error) {
        console.error("Invalid Token:", error);
      }
    }
  }, []);

  const toggleMenu = () => {
    setIsActive(!isActive);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openNotifyModal = () => {
    setShowNotifyModal(true);
  };

  const closeNotifyModal = () => {
    setShowNotifyModal(false);
  };

  const handleSignOut = () => {
    Cookies.remove("token");
    toast.success("Logged out successfully done!");
    navigate("/login");
  };

  return (
    <>
      {showModal && <ShowCommentModal closeModal={closeModal} />}
      {showNotifyModal && (
        <NotificationPanel closeNotifyModal={closeNotifyModal} />
      )}

      <header id="top_header" className={isActive ? "active" : ""}>
        <div className="menuToggle" onClick={toggleMenu}></div>
        <nav>
          <ul>
            <li onClick={openNotifyModal}>
              <Link to="#">
                <i className="fa-solid fa-bell"></i> &nbsp; 1
              </Link>
            </li>

            <li onClick={openModal}>
              <Link to="#">
                <i className="fa-solid fa-comment"></i>
              </Link>
            </li>

            <li>
              <Link to="#">
                <i className="fa-regular fa-user"></i> &nbsp;
                {userEmail ? userEmail : "Guest User"}
              </Link>
            </li>  
            
            {/* LOGIN PASS= ac_y9`5^das`tp
            PROFILE_PASS = h_!35`sub9&p_das`d */}


            <li onClick={handleSignOut}>
              <Link to="#">
                <i className="fa-solid fa-arrow-right-from-bracket"></i> &nbsp;
                Sign Out
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

export default TopNavbar;
