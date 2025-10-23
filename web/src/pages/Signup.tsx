import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL as string;

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.error ?? (Array.isArray(data.errors) ? data.errors[0] : "Sign up failed");
        setError(msg);
        return;
      }

      setSuccess("Account created. Check your email later to verify.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (  //  The following was made with the help of AI
    <div style={{ maxWidth: 420, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Sign up</h1>
      {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
      {success && <div style={{ color: "green", marginBottom: 8 }}>{success}</div>}
      <form onSubmit={onSubmit}>
        <label>
          Email<br />
          <input
            type="email"
            required
            placeholder="you@purdue.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 6 }}
          />
        </label>
        <label>
          Password<br />
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 6 }}
          />
        </label>
        <label>
          Confirm Password<br />
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
