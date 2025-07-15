// src/components/GoogleAuthCallbackPage.jsx (Corrected)
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GoogleAuthCallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // This useEffect will now only run ONCE after the component first loads.
  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      console.log("Token found, logging in and redirecting...");
      // Use the login function from our global context to save the token
      login(token);
      // Redirect to the homepage. 'replace: true' prevents the user
      // from clicking the "back" button and getting stuck here again.
      navigate("/", { replace: true });
    } else {
      console.error("No token found in URL, redirecting to login.");
      // If for some reason there's no token, send them back to the login page.
      navigate("/login", { replace: true });
    }
  }, []); // <-- The key fix is this empty dependency array.

  // This page just shows a temporary loading message while it processes the token.
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg font-semibold">Finalizing your login...</p>
        {/* Optional: Add a spinner here later for better UX */}
      </div>
    </div>
  );
}

export default GoogleAuthCallbackPage;
