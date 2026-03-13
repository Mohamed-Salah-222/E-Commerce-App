import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../layout/AuthLayout";
import FormInput from "../ui/FormInput";
import FormAlert from "../ui/FormAlert";
import SubmitButton from "../ui/SubmitButton";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  const successMessage = location.state?.message;

  const handleLogin = async (credentials) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.errors?.map((e) => e.msg).join(", ") || data.message || "Login failed";
        throw new Error(msg);
      }

      await login(data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin({ email, password });
  };

  const handleQuickLogin = (userType) => {
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
    handleLogin(credentials);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your account" footer={<AuthLayout.FooterLink to="/register" label="Don't have an account?" linkText="Sign up" />}>
      <FormAlert type="success" message={successMessage} />

      {/* Quick login for portfolio demo */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-medium text-amber-700 text-center mb-3">Portfolio Demo Quick Login</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => handleQuickLogin("user")} disabled={loading} className="px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
            Test User
          </button>
          <button type="button" onClick={() => handleQuickLogin("admin")} disabled={loading} className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            Admin
          </button>
        </div>
      </div>

      {/* Google OAuth */}
      <a href={`${import.meta.env.VITE_API_URL}/api/auth/google`} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M43.611 20.083H24v8.53h11.303c-1.649 4.657-6.08 8.12-11.303 8.12-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l6.464-6.464C34.643 4.125 29.643 2 24 2 11.852 2 2 11.852 2 24s9.852 22 22 22c11.996 0 21.227-8.388 21.227-21.227 0-1.319-.122-2.61-.355-3.868z" />
        </svg>
        Continue with Google
      </a>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">or continue with email</span>
        </div>
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput id="login-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />

        <div>
          <FormInput id="login-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password" />
          <div className="text-right mt-1.5">
            <a href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        <FormAlert type="error" message={error} />
        <SubmitButton loading={loading} label="Log in" loadingLabel="Logging in..." />
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
