
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  const successMessage = location.state?.message;


  const handleQuickLogin = async (userType) => {
    setError("");
    setLoading(true);

    try {
      const credentials =
        userType === "admin"
          ? {
              email: import.meta.env.VITE_ADMIN_EMAIL,
              password: import.meta.env.VITE_ADMIN_PASSWORD,
            }
          : {
              email: import.meta.env.VITE_TEST_USER_EMAIL,
              password: import.meta.env.VITE_TEST_USER_PASSWORD,
            };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to log in");

      login(data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to log in");
      login(data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 -m-4 md:-m-8 relative overflow-hidden" style={{ minHeight: "calc(100vh - 120px)" }}>

      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />


        <div className="absolute top-1/3 left-1/5 w-24 h-24 bg-gradient-to-br from-emerald-300/15 to-teal-300/15 rounded-full blur-2xl animate-bounce" style={{ animationDuration: "4s" }}></div>
        <div className="absolute bottom-1/3 right-1/5 w-16 h-16 bg-gradient-to-br from-rose-300/20 to-pink-300/20 rounded-full blur-xl animate-ping" style={{ animationDuration: "3s" }}></div>


        <div className="absolute top-1/4 left-3/4 w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-ping" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute top-3/4 left-1/4 w-2 h-2 bg-purple-400/35 rounded-full animate-ping" style={{ animationDelay: "1.5s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400/45 rounded-full animate-ping" style={{ animationDelay: "2.5s" }}></div>
      </div>


      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-10 space-y-6 relative z-10 transition-all duration-500 hover:shadow-3xl hover:bg-white/95 hover:scale-[1.02] group animate-in fade-in slide-in-from-bottom duration-700">

        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-3 group-hover:animate-pulse">
            <svg className="w-8 h-8 text-white transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-all duration-500 animate-in slide-in-from-top duration-500">Welcome Back!</h1>
          <div className="h-0.5 w-20 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-x-0 group-hover:scale-x-100"></div>
        </div>


        {successMessage && (
          <div className="p-3 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl animate-in slide-in-from-top duration-300 hover:bg-green-100/80 transition-all duration-200 hover:scale-[1.01]">
            <p className="text-sm text-green-700 font-medium flex items-center">
              <svg className="w-5 h-5 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </p>
          </div>
        )}


        <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm border border-amber-200/50 rounded-xl p-4 space-y-3 animate-in slide-in-from-top duration-500" style={{ animationDelay: "100ms" }}>
          <div className="text-center">
            <p className="text-xs font-semibold text-amber-700 flex items-center justify-center">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Portfolio Demo - Quick Login
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin("user")}
              disabled={loading}
              className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group/demo"
            >
              <div className="absolute inset-0 -translate-x-full group-hover/demo:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <svg className="w-3.5 h-3.5 mr-1.5 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="relative z-10">{loading ? "Logging..." : "Test User"}</span>
            </button>
            <button
              onClick={() => handleQuickLogin("admin")}
              disabled={loading}
              className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group/demo"
            >
              <div className="absolute inset-0 -translate-x-full group-hover/demo:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <svg className="w-3.5 h-3.5 mr-1.5 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="relative z-10">{loading ? "Logging..." : "Admin"}</span>
            </button>
          </div>
        </div>


        <a
          href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md group/google relative overflow-hidden animate-in slide-in-from-left duration-500"
          style={{ animationDelay: "200ms" }}
        >

          <div className="absolute inset-0 -translate-x-full group-hover/google:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

          <svg className="w-5 h-5 mr-3 transition-transform duration-200 group-hover/google:scale-110" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M43.611 20.083H24v8.53h11.303c-1.649 4.657-6.08 8.12-11.303 8.12-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l6.464-6.464C34.643 4.125 29.643 2 24 2 11.852 2 2 11.852 2 24s9.852 22 22 22c11.996 0 21.227-8.388 21.227-21.227 0-1.319-.122-2.61-.355-3.868z"></path>
          </svg>
          <span className="relative z-10">Sign in with Google</span>
        </a>


        <div className="relative animate-in fade-in duration-500" style={{ animationDelay: "300ms" }}>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white/90 backdrop-blur-sm text-gray-500 rounded-full">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="group/field animate-in slide-in-from-left duration-500" style={{ animationDelay: "400ms" }}>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1 transition-all duration-200 group-focus-within/field:text-blue-600 group-focus-within/field:translate-x-1">
              <span className="flex items-center">
                Email Address
                <span className="ml-2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-focus-within/field:opacity-100 transition-all duration-300 animate-pulse"></span>
              </span>
            </label>
            <div className="relative overflow-hidden rounded-xl group-hover/field:shadow-lg transition-all duration-300">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/60 focus:outline-none transition-all duration-300 hover:bg-white/80 hover:scale-[1.01] focus:scale-[1.01] hover:shadow-sm group-hover/field:border-gray-300"
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 scale-x-0 group-focus-within/field:scale-x-100 transform transition-transform duration-500 ease-out" />


              {email && email.includes("@") && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 animate-in fade-in zoom-in duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>


          <div className="group/field animate-in slide-in-from-left duration-500" style={{ animationDelay: "500ms" }}>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1 transition-all duration-200 group-focus-within/field:text-blue-600 group-focus-within/field:translate-x-1">
              <span className="flex items-center">
                Password
                <span className="ml-2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-focus-within/field:opacity-100 transition-all duration-300 animate-pulse"></span>
              </span>
            </label>
            <div className="relative overflow-hidden rounded-xl group-hover/field:shadow-lg transition-all duration-300">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/60 focus:outline-none transition-all duration-300 hover:bg-white/80 hover:scale-[1.01] focus:scale-[1.01] hover:shadow-sm group-hover/field:border-gray-300"
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 scale-x-0 group-focus-within/field:scale-x-100 transform transition-transform duration-500 ease-out" />


              {password && password.length >= 1 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 animate-in fade-in zoom-in duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div className="text-right mt-2">
              <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 relative group/forgot inline-block">
                <span className="relative z-10 transition-transform duration-200 group-hover/forgot:translate-x-0.5">Forgot Password?</span>
                <span className="absolute inset-0 bg-blue-100/50 rounded scale-x-0 group-hover/forgot:scale-x-100 transition-transform duration-200 origin-right -z-10"></span>
              </Link>
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
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group/btn animate-in slide-in-from-bottom duration-500"
            style={{ animationDelay: "600ms" }}
          >

            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>

            <span className="flex items-center justify-center relative z-10">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="animate-pulse">Logging In...</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>


        <p className="text-sm text-center text-gray-600 animate-in fade-in duration-500" style={{ animationDelay: "700ms" }}>
          Need an account?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-all duration-200 hover:underline relative group/link inline-block">
            <span className="relative z-10 transition-transform duration-200 group-hover/link:translate-x-0.5">Sign Up</span>
            <span className="absolute inset-0 bg-blue-100/50 rounded scale-x-0 group-hover/link:scale-x-100 transition-transform duration-200 origin-left -z-10"></span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
