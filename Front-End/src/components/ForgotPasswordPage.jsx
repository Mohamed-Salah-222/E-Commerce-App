
import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link.");
      }

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 -m-4 md:-m-8 relative overflow-hidden" style={{ minHeight: "calc(100vh - 120px)" }}>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-300/20 to-orange-300/20 rounded-full blur-2xl animate-bounce opacity-70" style={{ animationDuration: "6s", animationDelay: "2s" }}></div>

     
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/60 rounded-full animate-ping" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-ping" style={{ animationDelay: "1.5s" }}></div>
        <div className="absolute bottom-32 left-20 w-3 h-3 bg-cyan-400/60 rounded-full animate-ping" style={{ animationDelay: "2.5s" }}></div>
        <div className="absolute bottom-20 right-40 w-2 h-2 bg-pink-400/60 rounded-full animate-ping" style={{ animationDelay: "3s" }}></div>
      </div>

  
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 space-y-6 relative z-10 transform transition-all duration-700 hover:shadow-[0_35px_60px_-12px_rgba(0,0,0,0.25)] hover:scale-[1.02] group">

        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

        <div className="text-center space-y-2 transform transition-all duration-500">
          <div className="inline-block p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4 transform transition-all duration-500 hover:scale-110 hover:rotate-3">
            <svg className="w-8 h-8 text-blue-600 transform transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent relative">
            <span className="bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent animate-[gradient-shift_3s_ease_infinite]">Forgot Your Password?</span>
          </h1>
          <p className="text-gray-500 text-sm transform transition-all duration-300 hover:text-gray-600">No problem. Enter your email address below and we'll send you a link to reset it.</p>
        </div>


        {message && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl transform transition-all duration-500 shadow-lg animate-[slideInDown_0.5s_ease-out]">
            <p className="text-sm text-green-700 font-medium flex items-center">
              <div className="w-5 h-5 mr-2 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              {message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="group">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 transform transition-all duration-200 group-focus-within:text-blue-600 group-focus-within:scale-105 origin-left">
              Email Address
            </label>
            <div className="relative overflow-hidden rounded-xl transform transition-all duration-300 hover:scale-[1.02]">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-4 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 group-hover:border-gray-300 placeholder-gray-400 text-gray-800"
              />

              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 rounded-full"></div>


              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 group-focus-within:text-blue-500 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>


          {error && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl transform transition-all duration-500 shadow-lg animate-[shake_0.5s_ease-in-out]">
              <p className="text-sm text-red-700 font-medium flex items-center">
                <div className="w-5 h-5 mr-2 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                {error}
              </p>
            </div>
          )}


          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden group/button"
          >

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/button:translate-x-full transition-transform duration-1000"></div>

            <span className="relative flex items-center justify-center space-x-2">
              {loading && <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>}
              <span className="transition-all duration-200">{loading ? "Sending Link..." : "Send Reset Link"}</span>
              {!loading && (
                <svg className="w-5 h-5 transform transition-transform duration-200 group-hover/button:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </span>
          </button>
        </form>


        <p className="text-sm text-center text-gray-600 transform transition-all duration-300 hover:scale-105">
          Remembered your password?{" "}
          <Link to="/login" className="font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 transition-all duration-300 relative group/link">
            <span className="relative">
              Back to Login
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left"></span>
            </span>
          </Link>
        </p>
      </div>


      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        @keyframes slideInDown {
          from {
            transform: translate3d(0, -100%, 0);
            opacity: 0;
          }
          to {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(2px);
          }
        }
      `}</style>
    </div>
  );
}

export default ForgotPasswordPage;
