import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/Login.scss";

export default function Login() {
  const [role, setRole] = useState<"student" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "student") navigate("/student/home");
    else navigate("/admin/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="role-tabs">
          <button
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
          >
            Student
          </button>
          <button
            className={role === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
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
            required
          />

          <label>Password *</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>

        <div className="divider">OR</div>

        <button className="google-btn">
          <img src="/Google-icon.jpeg" alt="Google" />
          Sign in with Google
        </button>

        <button className="back-btn" onClick={() => navigate("/")}>
          Back to Landing Page
        </button>
      </div>
    </div>
  );
}
