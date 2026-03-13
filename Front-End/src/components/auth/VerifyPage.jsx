import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import FormInput from "../ui/FormInput";
import FormAlert from "../ui/FormAlert";
import SubmitButton from "../ui/SubmitButton";

function VerifyPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const userEmail = searchParams.get("email");
    if (userEmail) {
      setEmail(userEmail);
      setInfo(`A verification code has been sent to ${userEmail}`);
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
        const msg = data.errors?.map((e) => e.msg).join(", ") || data.message || "Verification failed";
        throw new Error(msg);
      }

      navigate("/login", {
        state: { message: "Account verified! You can now log in." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResending(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to resend code");
      setInfo("A new verification code has been sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code we sent you">
      <FormAlert type="info" message={info} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput id="verificationCode" label="Verification code" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="123456" required maxLength={6} inputClassName="text-center text-xl tracking-[0.3em] font-bold" />

        <FormAlert type="error" message={error} />
        <SubmitButton loading={loading} label="Verify account" loadingLabel="Verifying..." />
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Didn't receive the code?{" "}
          <button type="button" onClick={handleResend} disabled={resending} className="font-semibold text-gray-900 hover:underline disabled:opacity-50">
            {resending ? "Sending..." : "Resend code"}
          </button>
        </p>
        <p className="text-xs text-gray-400 mt-2">Check your spam folder if you don't see it</p>
      </div>
    </AuthLayout>
  );
}

export default VerifyPage;
