import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function VerifyPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const userEmail = searchParams.get("email");
    if (userEmail) {
      setEmail(userEmail);
      setMessage(`A verification code has been sent to ${userEmail}.`);
    } else {
      setError("No email address provided. Please register again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          throw new Error(data.errors.map((err) => err.msg).join(", "));
        }
        throw new Error(data.message || "Verification failed.");
      }
      navigate("/login", { state: { message: "Account verified successfully! You can now log in." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("Sending a new code...");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email, password: "dummyPassword", username: "dummyUser" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to resend code.");
      setMessage("A new verification code has been sent to your email.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 -m-4 md:-m-8 relative overflow-hidden" style={{ minHeight: "calc(100vh - 120px)" }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-green-300/15 to-emerald-300/15 rounded-full blur-2xl animate-bounce" style={{ animationDuration: "3.5s" }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-gradient-to-br from-yellow-300/20 to-amber-300/20 rounded-full blur-xl animate-ping" style={{ animationDuration: "4s" }}></div>

        <div className="absolute top-1/4 left-1/3 opacity-10 animate-float" style={{ animationDelay: "0s", animationDuration: "6s" }}>
          <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>
        <div className="absolute top-2/3 right-1/3 opacity-10 animate-float" style={{ animationDelay: "2s", animationDuration: "5s" }}>
          <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6 relative z-10 hover:shadow-3xl hover:bg-white/90 transition-all duration-500 hover:scale-[1.02] group animate-in fade-in slide-in-from-bottom duration-700">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-3 group-hover:animate-pulse">
            <svg className="w-8 h-8 text-white transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-all duration-500 animate-in slide-in-from-top duration-500">Verify Your Account</h1>
          <p className="text-gray-500 text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">Enter the verification code sent to your email</p>
          <div className="h-0.5 w-20 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-x-0 group-hover:scale-x-100"></div>
        </div>

        {message && (
          <div className="p-3 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl animate-in slide-in-from-top duration-300 hover:bg-blue-100/80 transition-all duration-200 hover:scale-[1.01]">
            <p className="text-sm text-blue-700 font-medium flex items-center justify-center">
              <svg className="w-4 h-4 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group/field animate-in slide-in-from-bottom duration-500" style={{ animationDelay: "100ms" }}>
            <label htmlFor="verificationCode" className="block text-sm font-semibold text-gray-700 mb-3 text-center transition-all duration-200 group-focus-within/field:text-blue-600">
              <span className="flex items-center justify-center">
                Verification Code
                <span className="ml-2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-focus-within/field:opacity-100 transition-all duration-300 animate-pulse"></span>
              </span>
            </label>

            <div className="relative group-hover/field:shadow-lg transition-all duration-300">
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                maxLength="6"
                className="w-full px-4 py-4 text-2xl font-bold tracking-[0.5em] text-center rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/80 group-hover/field:border-gray-300 hover:scale-[1.01] focus:scale-[1.02] hover:shadow-sm"
                placeholder="123456"
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-focus-within/field:scale-x-100 transition-transform duration-500 ease-out rounded-full mx-4"></div>

              {verificationCode && verificationCode.length === 6 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 animate-in fade-in zoom-in duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center mt-2 animate-in fade-in duration-300" style={{ animationDelay: "200ms" }}>
              Check your email for the 6-digit code
            </p>

            <div className="flex justify-center mt-3 space-x-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i < verificationCode.length ? "bg-blue-500 scale-110" : "bg-gray-300 scale-100"}`} />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl animate-in slide-in-from-top duration-300 hover:bg-red-100/80 transition-all duration-200 hover:scale-[1.01]">
              <p className="text-sm text-red-700 font-medium flex items-center justify-center">
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
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group/btn animate-in slide-in-from-bottom duration-500"
            style={{ animationDelay: "300ms" }}
          >
            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>

            <span className="flex items-center justify-center relative z-10">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="animate-pulse">Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Account</span>
                  <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        <div className="text-center animate-in fade-in duration-500" style={{ animationDelay: "400ms" }}>
          <p className="text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button type="button" onClick={handleResend} className="font-semibold text-blue-600 hover:text-blue-700 transition-all duration-200 hover:underline focus:outline-none relative group/resend inline-block">
              <span className="relative z-10 transition-transform duration-200 group-hover/resend:translate-x-0.5">Resend Code</span>
              <span className="absolute inset-0 bg-blue-100/50 rounded scale-x-0 group-hover/resend:scale-x-100 transition-transform duration-200 origin-left -z-10"></span>
            </button>
          </p>
        </div>

        <div className="text-center animate-in fade-in duration-500" style={{ animationDelay: "500ms" }}>
          <p className="text-xs text-gray-400">💡 Check your spam folder if you don't see the email</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(5deg);
          }
          50% {
            transform: translateY(-5px) rotate(-5deg);
          }
          75% {
            transform: translateY(-15px) rotate(3deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default VerifyPage;
