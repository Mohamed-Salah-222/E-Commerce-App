// src/components/VerifyPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function VerifyPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  // useSearchParams is a hook from React Router to read URL query parameters
  const [searchParams] = useSearchParams();

  // This useEffect hook runs once to get the email from the URL
  useEffect(() => {
    const userEmail = searchParams.get("email");
    if (userEmail) {
      setEmail(userEmail);
      setMessage(`A verification code has been sent to ${userEmail}.`);
    } else {
      // This is a fallback in case the user lands here without an email
      setError("No email address provided. Please register again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Verification failed.");
      }

      // On success, redirect to the login page with a success message
      navigate("/login", { state: { message: "Account verified successfully! You can now log in." } });
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 bg-slate-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800">Verify Your Account</h1>
        <p className="text-center text-gray-500">{message}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input type="text" id="verificationCode" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required className="w-full text-center tracking-[0.5em] font-bold text-lg px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          <div>
            <button type="submit" className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Verify Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyPage;
