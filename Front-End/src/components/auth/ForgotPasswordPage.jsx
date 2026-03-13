import { useState } from "react";
import AuthLayout from "../layout/AuthLayout";
import FormInput from "../ui/FormInput";
import FormAlert from "../ui/FormAlert";
import SubmitButton from "../ui/SubmitButton";

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
        const msg = data.errors?.map((e) => e.msg).join(", ") || data.message || "Failed to send reset link";
        throw new Error(msg);
      }

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link" footer={<AuthLayout.FooterLink to="/login" label="Remember your password?" linkText="Back to login" />}>
      <FormAlert type="success" message={message} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput id="forgot-email" label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />

        <FormAlert type="error" message={error} />
        <SubmitButton loading={loading} label="Send reset link" loadingLabel="Sending..." />
      </form>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
