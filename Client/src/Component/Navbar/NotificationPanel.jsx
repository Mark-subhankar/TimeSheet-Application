import React, { useEffect } from "react";
import "../Navbar/NotificationPanel.css";

const NotificationPanel = ({ closeNotifyModal }) => {
  useEffect(() => {
    document.body.classList.add("modal-open"); // Prevent scrolling

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  const Notify = [
    {
      subject: "Lorem ipsum dolor sit",
      desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Amet alias porro optio perferendis modi unde provident ipsum veritatis architecto. Fugit pariatur in eum ducimus, nobis facere amet sint voluptas numquam inventore? Debitis itaque, dolorum doloribus quis vel quidem soluta magni ad eveniet consequuntur in nostrum ab odio deleniti dolorem non.",
    },
    {
      subject: "Lorem ipsum dolor sit",
      desc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Amet alias porro optio perferendis modi unde provident ipsum veritatis architecto. Fugit pariatur in eum ducimus, nobis facere amet sint voluptas numquam inventore? Debitis itaque, dolorum doloribus quis vel quidem soluta magni ad eveniet consequuntur in nostrum ab odio deleniti dolorem non.",
    },
  ];

  return (
    <>
      <div onClick={closeNotifyModal} className="t_modal-wrapper"></div>
      <div className="t_modal-container">
        <div className="notify-container">
          <h1>Notification</h1>
        </div>
        <div className="close-btn" onClick={closeNotifyModal}>
          <i className="fa-solid fa-xmark"></i>
        </div>
        <div className="div-clearall">
          <button>Clear All</button>
        </div>

        {Notify.map((notify, index) => (
          <div className="text-card" key={index}>
            <h3 className="text-card-title">{notify.subject}</h3>
            <p className="text-card-description">{notify.desc}</p>
            <button>Mark as Close</button>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationPanel;
