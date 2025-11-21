// web/src/pages/auth/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "../../style/Login.scss";

type Role = "student" | "admin";

export default function Login() {
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // Look up the user in the custom users table
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password) // NOTE: for real apps, never store plain passwords!
        .single();

      if (error || !data) {
        alert("Invalid email or password");
        return;
      }

      // if the tab says "admin", we can double-check role matches
      if (role === "admin" && data.role !== "admin") {
        alert("This account is not an admin.");
        return;
      }

      // 🔹 Record login event for analytics
      try {
        await supabase.from("user_logins").insert({
          user_id: data.id,
          // If you created extra columns on user_logins you can add them here:
          // user_agent: navigator.userAgent,
          // logged_in_at: new Date().toISOString(),
        });
      } catch (logErr) {
        console.error("Failed to record login event", logErr);
        // don't block login if analytics write fails
      }

      // Persist a lightweight session for the UI (sidebar, etc.)
      localStorage.setItem(
        "cm_user",
        JSON.stringify({
          id: data.id, // uuid/string
          email: data.email,
          full_name: data.full_name,
          role: data.role as Role,
        })
      );

      // Route by role (your AppRoutes should already have these paths)
      if (data.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="role-tabs">
          <button
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
            type="button"
          >
            Student
          </button>
          <button
            className={role === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
            type="button"
          >
            Admin
          </button>
        </div>

        <h2>{role === "student" ? "Student Login" : "Admin Login"}</h2>

        <form onSubmit={handleLogin}>
          <label>Email Address *</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          <label>Password *</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <p
            className="forgot-password-link"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </p>

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="divider">OR</div>

        <button className="google-btn" type="button">
          <img src="/Google-icon.jpeg" alt="Google" />
          Sign in with Google
        </button>

        <button className="back-btn" onClick={() => navigate("/")} type="button">
          Back to Landing Page
        </button>
      </div>
    </div>
  );
}
