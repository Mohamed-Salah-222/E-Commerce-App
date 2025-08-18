import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      navigate(`/verify-email?email=${email}`);
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].msg);
      } else {
        setError(err.message || "An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 -m-4 md:-m-8 relative overflow-hidden" style={{ minHeight: "calc(100vh - 120px)" }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-pink-300/10 to-orange-300/10 rounded-full blur-2xl animate-bounce" style={{ animationDuration: "3s" }}></div>
        <div className="absolute top-3/4 right-1/4 w-20 h-20 bg-gradient-to-br from-green-300/15 to-blue-300/15 rounded-full blur-xl animate-ping" style={{ animationDuration: "4s" }}></div>

        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-blue-400/40 rounded-full animate-ping" style={{ animationDelay: "0s" }}></div>
        <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-ping" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 right-1/3 w-2.5 h-2.5 bg-cyan-400/35 rounded-full animate-ping" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6 relative z-10 hover:shadow-3xl hover:bg-white/90 transition-all duration-500 hover:scale-[1.02] group animate-in fade-in slide-in-from-bottom duration-700">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-3 group-hover:animate-pulse">
            <svg className="w-8 h-8 text-white transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-all duration-500 animate-in slide-in-from-top duration-500">Create Your Account</h1>
          <div className="h-0.5 w-16 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-x-0 group-hover:scale-x-100"></div>
        </div>

        <div className="space-y-5">
          <div className="group/field animate-in slide-in-from-left duration-500" style={{ animationDelay: "100ms" }}>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2 transition-all duration-200 group-focus-within/field:text-blue-600 group-focus-within/field:translate-x-1">
              <span className="flex items-center">
                Username
                <span className="ml-2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-focus-within/field:opacity-100 transition-all duration-300 animate-pulse"></span>
              </span>
            </label>
            <div className="relative overflow-hidden rounded-xl group-hover/field:shadow-lg transition-all duration-300">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., mohamed_dev"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 group-hover/field:border-gray-300 hover:scale-[1.01] focus:scale-[1.01] hover:shadow-sm"
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 ease-out"></div>

              {username && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 animate-in fade-in zoom-in duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="group/field animate-in slide-in-from-left duration-500" style={{ animationDelay: "200ms" }}>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 transition-all duration-200 group-focus-within/field:text-blue-600 group-focus-within/field:translate-x-1">
              <span className="flex items-center">
                Email Address
                <span className="ml-2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-focus-within/field:opacity-100 transition-all duration-300 animate-pulse"></span>
              </span>
            </label>
            <div className="relative overflow-hidden rounded-xl group-hover/field:shadow-lg transition-all duration-300">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 group-hover/field:border-gray-300 hover:scale-[1.01] focus:scale-[1.01] hover:shadow-sm"
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 ease-out"></div>

              {email && email.includes("@") && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 animate-in fade-in zoom-in duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="group/field animate-in slide-in-from-left duration-500" style={{ animationDelay: "300ms" }}>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 transition-all duration-200 group-focus-within/field:text-blue-600 group-focus-within/field:translate-x-1">
              <span className="flex items-center justify-between">
                <span className="flex items-center">
                  Password
                  <span className="ml-2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-focus-within/field:opacity-100 transition-all duration-300 animate-pulse"></span>
                </span>
                <span className="text-xs text-gray-500 font-normal">(min. 8 characters)</span>
              </span>
            </label>
            <div className="relative overflow-hidden rounded-xl group-hover/field:shadow-lg transition-all duration-300">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 group-hover/field:border-gray-300 hover:scale-[1.01] focus:scale-[1.01] hover:shadow-sm"
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 ease-out"></div>

              {password && password.length >= 8 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 animate-in fade-in zoom-in duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl animate-in slide-in-from-top duration-300 hover:bg-red-100/80 transition-all duration-200 hover:scale-[1.01]">
              <p className="text-sm text-red-700 font-medium flex items-center">
                <svg className="w-4 h-4 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl relative overflow-hidden group/btn animate-in slide-in-from-bottom duration-500"
            style={{ animationDelay: "400ms" }}
          >
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>

            <span className="flex items-center justify-center relative z-10">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="animate-pulse">Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </div>

        <div className="text-center animate-in fade-in duration-500" style={{ animationDelay: "500ms" }}>
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-all duration-200 hover:underline cursor-pointer relative group/link inline-block">
              <span className="relative z-10 transition-transform duration-200 group-hover/link:translate-x-0.5">Log In</span>
              <span className="absolute inset-0 bg-blue-100/50 rounded scale-x-0 group-hover/link:scale-x-100 transition-transform duration-200 origin-left -z-10"></span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
