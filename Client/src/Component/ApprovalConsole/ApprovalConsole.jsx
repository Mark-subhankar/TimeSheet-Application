import React, { useState, useEffect } from "react";
import "./ApprovalConsole.css";
import ShowDescModal from "./ShowDescModal";
import Approve_RejectModal from "./Approve_RejectModal";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function ApprovalConsole() {
  const [showModal, setShowModal] = useState(false);
  const [showModalCommend, setShowModalCommend] = useState(false);
  const [approvalData, setApprovalData] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [appStatus, setAppStatus] = useState(null);

  const navigate = useNavigate();
  const token = Cookies.get("token");

  // Fetch data from API
  const fetchData = () => {
    axios
      .get("http://localhost:8081/console/fetch/approval-data", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setData(res.data.ConsoleData);
        setFilteredData(res.data.ConsoleData);
      })
      .catch(() => {
        toast.error("You are not authorized! 🔒");
        navigate("/login");
      });
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login first! 🔒");
      navigate("/login");
    } else {
      fetchData();
    }
  }, []);

  // Global Search
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value) {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter((d) =>
          Object.values(d).some(
            (field) => field && field.toString().toLowerCase().includes(value)
          )
        )
      );
    }
  };

  // Filter by name or project
  useEffect(() => {
    let filtered = data;

    if (searchText) {
      filtered = filtered.filter((item) =>
        item.Employee_Name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedProject) {
      filtered = filtered.filter(
        (item) =>
          item.project_name.toLowerCase() === selectedProject.toLowerCase()
      );
    }

    setFilteredData(filtered);
  }, [searchText, selectedProject, data]);

  // Description Modal
  const openModal = (data = null) => {
    setSelectedData(data);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  // Approve/Reject Modal
  const openModalApproveReject = (status = null, data = null) => {
    setApprovalData(data);
    setAppStatus(status);
    setShowModalCommend(true);
  };
  const closeModalApproveReject = () => {
    fetchData(); // Refresh data after action
    setShowModalCommend(false);
  };

  return (
    <>
      <h1 className="h1_heading">Approval Console</h1>

      {/* Description Modal */}
      {showModal && (
        <ShowDescModal closeModal={closeModal} description={selectedData} />
      )}

      {/* Approve/Reject Modal */}
      {showModalCommend && (
        <Approve_RejectModal
          closeModal_Approve_Reject={closeModalApproveReject}
          approval_data={approvalData}
          status={appStatus}
        />
      )}

      <div className="approval-container">
        {filteredData.length > 0 ? (
          filteredData.map((d) => (
            <div className="card" key={d.id}>
              <div className="text_container">
                <b className="row-1">Employee Name:&nbsp;{d.Employee_Name}</b>
                <p className="row-1">Project:&nbsp;{d.project_name}</p>
                <p className="row-1">Designation:&nbsp;{d.designation}</p>
                <p className="row-1">Department:&nbsp;{d.department_name}</p>
                <p className="row-1">Date:&nbsp;{d.working_date}</p>
                <p className="row-1">Worked Hours:&nbsp;{d.hours_worked}</p>
                <p className="row-1">
                  Description:&nbsp;
                  {d.description.split(" ").length > 10 ? (
                    <>
                      {d.description.split(" ").slice(0, 4).join(" ")}...
                      <span
                        onClick={() => openModal(d)}
                        className="read-more"
                      >
                        &nbsp;Read More
                      </span>
                    </>
                  ) : (
                    d.description
                  )}
                </p>
              </div>

              <div className="btn_group">
                <button onClick={() => openModalApproveReject("approved", d)}>
                  Approve &nbsp; <i className="fa-solid fa-check"></i>
                </button>
                <button onClick={() => openModalApproveReject("rejected", d)}>
                  Reject &nbsp; <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            className="no_data_found"
          >
            No data found
          </div>
        )}
      </div>
    </>
  );
}
