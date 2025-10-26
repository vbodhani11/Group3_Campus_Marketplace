import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "../../style/Login.scss"; // reuse the same card style

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // Supabase built-in reset password method
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password", // update later for production
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Password reset link sent to your email!");
      navigate("/login");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Forgot Password</h2>
        <p className="small-text">
          Enter your registered email to receive a password reset link.
        </p>

        <form onSubmit={handleReset}>
          <label>Email Address *</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            Send Reset Link
          </button>
        </form>

        <button className="back-btn" onClick={() => navigate("/login")}>
          Back to Login
        </button>
      </div>
    </div>
  );
}
