function FormAlert({ type = "error", message }) {
  if (!message) return null;

  const styles = {
    error: "bg-red-50 border-red-200 text-red-700",
    success: "bg-green-50 border-green-200 text-green-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return <div className={`px-4 py-3 rounded-xl border text-sm font-medium ${styles[type]}`}>{message}</div>;
}

export default FormAlert;
