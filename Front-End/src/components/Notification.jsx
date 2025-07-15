import { useNotification } from "../context/NotificationContext";

function Notification() {
  const { notification } = useNotification();

  if (!notification) {
    return null;
  }

  const baseStyle = "fixed top-20 right-5 p-4 rounded-lg shadow-2xl text-white text-sm font-semibold transition-all duration-500 ease-in-out transform";

  const typeStyles = {
    success: "bg-green-500",
    error: "bg-red-500",
  };

  return <div className={`${baseStyle} ${typeStyles[notification.type] || typeStyles.success} z-50`}>{notification.message}</div>;
}

export default Notification;
