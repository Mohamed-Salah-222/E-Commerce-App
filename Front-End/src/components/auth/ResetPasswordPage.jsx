import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import FormInput from "../ui/FormInput";
import FormAlert from "../ui/FormAlert";
import SubmitButton from "../ui/SubmitButton";

function ResetPasswordPage() {
  const { userId, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${userId}/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.errors?.map((e) => e.msg).join(", ") || data.message || "Failed to reset password";
        throw new Error(msg);
      }

      navigate("/login", { state: { message: data.message } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FormInput id="new-password" label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required hint="Min. 8 characters" autoComplete="new-password" />

          {/* Password strength bar */}
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => {
                  const strength = password.length >= 12 ? 4 : password.length >= 8 ? 3 : password.length >= 5 ? 2 : 1;
                  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400"];
                  return <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${level <= strength ? colors[strength - 1] : "bg-gray-200"}`} />;
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <FormInput id="confirm-password" label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" required autoComplete="new-password" />
          {passwordsMatch && <p className="text-xs text-green-600 mt-1">Passwords match</p>}
          {passwordsMismatch && <p className="text-xs text-red-600 mt-1">Passwords do not match</p>}
        </div>

        <FormAlert type="error" message={error} />
        <SubmitButton loading={loading} label="Reset password" loadingLabel="Resetting..." />
      </form>
    </AuthLayout>
  );
}

export default ResetPasswordPage;
