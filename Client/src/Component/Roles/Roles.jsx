import React, { useState, useEffect } from "react";
import "../Roles/Roles.css";
import RoleShowModal from "./RoleShowModal";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

// export default function Employee() {
export default function Roles() {
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [filteredRole, setFilteredRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);

  const navigate = useNavigate();
  const token = Cookies.get("token");

  // Function to fetch Role from the API
  const fetchRoles = () => {
    axios
      .get("http://localhost:8081/general-setup/role/fetch/roles", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setRoles(res.data.roles);
        setFilteredRoles(res.data.roles);
      })
      .catch((err) => {
        toast.error("You are not authorized! 🔒");
        navigate("/login");
        return;
      });
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please login first! 🔒");
      navigate("/login");
      return;
    }
    fetchRoles();
  }, []);

  // Global search filter function (search in all fields)
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setFilteredRoles(roles);
    } else {
      setFilteredRoles(
        roles.filter((r) =>
          Object.values(r).some(
            (field) => field && field.toString().toLowerCase().includes(value)
          )
        )
      );
    }
  };

  const openModal = (department = null) => {
    setSelectedRole(department);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    fetchRoles();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8081/general-setup/role/delete/role/${id}`
      );
      fetchRoles();
      toast.success("Role deleted successfully!");
    } catch (error) {
      toast.error("❌ Failed to delete Role.");
    }
  };

  return (
    <div>
      <h2 id="role_heading_id">User Roles Details</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search.."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button
          onClick={() => {
            openModal(null);
          }}
          id="create_btn"
        >
          Create
        </button>
      </div>

      {showModal && (
        <RoleShowModal closeModal={closeModal} roles={selectedRole} />
      )}
      <div className="table-container_role">
        <table>
          <thead>
            <tr>
              <th>Edit</th>
              <th>Role Name</th>
              <th>Description</th>
              <th>Created By</th>
              <th>Created At</th>
              <th>Updated By</th>
              <th>Updated At</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredRole.map((r) => (
              <tr key={r.id}>
                <td>
                  <i
                    onClick={() => openModal(r)}
                    className="fa-regular fa-pen-to-square"
                  ></i>
                </td>
                <td>{r.role}</td>
                <td>{r.description}</td>
                <td>{r.created_by}</td>
                <td>{r.created_at}</td>
                <td>{r.updated_by}</td>
                <td>{r.updated_at}</td>
                <td>
                  <i
                    className="fa-solid fa-trash"
                    onClick={() => handleDelete(r.id)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
