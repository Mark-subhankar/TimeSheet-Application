import React, { useEffect, useRef, useState, Fragment } from "react";
import "../Dashboard/Dashboard.css";
import Logo from "../ImageSource/Logo.png";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ArcElement,
  PieController,
  Tooltip,
  Legend,
} from "chart.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const [natCardData, setNatCardData] = useState([]);
  const [taskSheet, setTaskSheet] = useState([]);

  const [totalHours, setTotalHours] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [taskStatus, setTaskStatus] = useState([]);
  const chartInstancesRef = useRef([]);


  // Existing pie chart refs
  const pieChartRef1 = useRef(null);
  const pieChartRef2 = useRef(null);
  const pieChartRef3 = useRef(null);

  // New donut chart refs
  const donutChartRef1 = useRef(null);
  const donutChartRef2 = useRef(null);
  const donutChartRef3 = useRef(null);

  Chart.register(
    CategoryScale,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    ArcElement,
    PieController,
    Tooltip,
    Legend
  );

  const fetchNatCardData = () => {
    //Fetch nat card data
    axios
      .get("http://localhost:8081/dashboard/fetch/dashboard-natcard", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setNatCardData(res.data.NatCardData);
      })
      .catch((err) => {
        toast.error("You are not authorized! 🔒");
        navigate("/login");
        return;
      });
  };

  const fetchTaskStatus = () => {
    //Fetch nat card data
    axios
      .get("http://localhost:8081/dashboard/fetch/dashboard-sheet", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        setTaskSheet(res.data.taskSheet);
      })
      .catch((err) => {
        // toast.error("You are not authorized! 🔒");
        navigate("/login");
        return;
      });
  };

  const fetchChartData = () => {
    axios
      .get("http://localhost:8081/dashboard/fetch/dashboard-chart", {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        const data = res.data; // <- fix this
        setTotalHours(data.total_hours_per_project || []);
        console.log(data.total_hours_per_project);
        setRoles(data.employees_per_role || []);
        setDepartments(data.employees_per_department || []);
        setSalaries(data.employee_count_by_salary || []);
        setDesignations(data.employees_by_designation || []);
        setTaskStatus(data.status_Employees || []);
      })
      .catch((err) => {
        // toast.error("You are not authorized! 🔒");
        navigate("/login");
      });
  };

  useEffect(() => {
    fetchNatCardData();
    fetchTaskStatus();
    fetchChartData();
  }, []);

  // Pie chart data (first 3)
  const pieChartDataSets = [
    {
      ref: pieChartRef1,
      title: "Total hours worked per project",
      data: totalHours.map((item) => {
        item.total_hours_decimal;
        console.log("item.total_hours_decimal :", item.total_hours_decimal);
      }),
      colors: ["#36A2EB", "#FF6384", "#9966FF", "#FFCD56", "#4BC0C0"],
      labels: totalHours.map((item) => item.project_name),
      type: "pie",
    },

    {
      ref: pieChartRef2,
      title: "Employee Per Role",
      data: roles.map((item) => item.employee_count),
      colors: ["#4BC0C0", "#FF9F40", "#35e157"],
      labels: roles.map((item) => item.role),
      type: "pie",
    },
    {
      ref: pieChartRef3,
      title: "Employee Per Department",
      data: departments.map((item) => item.employee_count),
      colors: ["#9966FF", "#FFCD56"],
      labels: departments.map((item) => item.department_name),
      type: "pie",
    },
  ];

  // Donut chart data (next 3)
  const donutChartDataSets = [
    {
      ref: donutChartRef1,
      title: "No Of Employee by Salary",
      data: salaries.map((item) => item.employee_count),
      colors: ["#FF6384", "#36A2EB"],
      labels: salaries.map((item) => item.salary),
      type: "doughnut",
    },
    {
      ref: donutChartRef2,
      title: "Designation Wise Employee",
      data: designations.map((item) => item.employee_count),
      colors: ["#FF6384", "#FFCE56", "#117a65"],
      labels: designations.map((item) => item.designation),
      type: "doughnut",
    },
    {
      ref: donutChartRef3,
      title: "Employee Task Status",
      data: taskStatus.map((item) => item.count_Emp),
      colors: ["#4BC0C0", "#FF6384", "#d4ac0d"],
      labels: taskStatus.map((item) => item.status),
      type: "doughnut",
    },
  ];

  useEffect(() => {
  const allChartsData = [...pieChartDataSets, ...donutChartDataSets];

  // ✅ Clean up old charts safely
  chartInstancesRef.current.forEach((chart) => {
    if (chart) chart.destroy();
  });

  const newChartInstances = allChartsData.map(({ ref, data, colors, labels, type }) => {
    if (!ref.current || data.length === 0) return null;

    const ctx = ref.current.getContext("2d");
    return new Chart(ctx, {
      type: type === "doughnut" ? "doughnut" : "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: type === "doughnut" ? "50%" : 0,
      },
    });
  });

  chartInstancesRef.current = newChartInstances.filter(Boolean);

  return () => {
    chartInstancesRef.current.forEach((chart) => {
      if (chart) chart.destroy();
    });
  };
}, [totalHours, roles, departments, salaries, designations, taskStatus]);


  return (
    <>
      <div className="apex-breadcrumb">
        <span className="breadcrumb-icon">
          <img src={Logo} alt="Logo" className="logo_img" />
        </span>
        <span className="breadcrumb-text active">Nexustime Timesheet</span>
      </div>

      <div className="container-natcard">
        {natCardData.map((n, index) => (
          <React.Fragment key={index}>
            <div className="box">
              <h1 className="box-heading">No of Employee</h1>
              <h1 className="box-value">{n.employee_count}</h1>
            </div>
            <div className="box">
              <h1 className="box-heading">No of Departments</h1>
              <h1 className="box-value">{n.department_count}</h1>
            </div>
            <div className="box">
              <h1 className="box-heading">No of Projects</h1>
              <h1 className="box-value">{n.project_count}</h1>
            </div>
            <div className="box">
              <h1 className="box-heading">Unapproved Tasks</h1>
              <h1 className="box-value">{n.Unapproved_task_count}</h1>
            </div>
            <div className="box">
              <h1 className="box-heading">Approved Tasks</h1>
              <h1 className="box-value">{n.Approved_task_count}</h1>
            </div>
            <div className="box">
              <h1 className="box-heading">Rejected Tasks</h1>
              <h1 className="box-value">{n.Rejected_task_count}</h1>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="cotainer-table">
        <h1>Employee Task Status </h1>
        <div className="table-data">
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Manager Name</th>
                <th>Task Name</th>
                <th>Project Name</th>
                <th>Status</th>
                <th>Hours</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>

            <tbody>
              {taskSheet.length > 0 ? (
                taskSheet.map((t) => (
                  <tr key={t.id}>
                    <td>{t.employee_name}</td>
                    <td>{t.manager_name}</td>
                    <td>{t.task_name}</td>
                    <td>{t.project}</td>
                    <td>{t.status}</td>
                    <td>{t.hours}</td>
                    <td>{t.start_date}</td>
                    <td>{t.end_date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No Data Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="container-chart">
        {[...pieChartDataSets, ...donutChartDataSets].map(
          ({ ref, title, data }, idx) => (
            <div className="chart-section" key={idx}>
              <h3 className="chart-heading">{title}</h3>
              <div className="box-chart">
                {data.length === 0 ? (
                  <div className="no-data-found">No Data Found</div>
                ) : (
                  <canvas ref={ref} height="300" />
                )}
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}
