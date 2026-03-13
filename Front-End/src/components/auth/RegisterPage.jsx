import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import FormInput from "../ui/FormInput";
import FormAlert from "../ui/FormAlert";
import SubmitButton from "../ui/SubmitButton";

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
        throw new Error(data.errors?.[0]?.msg || data.message || "Registration failed");
      }

      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start shopping in minutes" footer={<AuthLayout.FooterLink to="/login" label="Already have an account?" linkText="Log in" />}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput id="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" required autoComplete="username" />

        <FormInput id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />

        <FormInput id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required hint="Min. 8 characters" autoComplete="new-password" />

        <FormAlert type="error" message={error} />
        <SubmitButton loading={loading} label="Create account" loadingLabel="Creating account..." />
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
