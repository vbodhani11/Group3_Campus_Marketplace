import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "../../style/Register.scss";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const { error } = await supabase
      .from("users")
      .insert([{ full_name: name, email, password }]);

    if (error) {
      console.error(error);
      alert("Error saving data: " + error.message);
    } else {
      alert("Registration successful!");
      navigate("/login");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Student Sign Up</h2>

        <form onSubmit={handleRegister}>
          <label>Full Name *</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <label>Confirm Password *</label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="register-btn">
            Sign Up
          </button>
        </form>

        <div className="divider">OR</div>

        <button className="google-btn">
          <img src="/Google-icon.jpeg" alt="Google" />
          Sign up with Google
        </button>

        <button className="back-btn" onClick={() => navigate("/login")}>
          Already have an account? Log In
        </button>

        <button className="back-btn" onClick={() => navigate("/")}>
          Back to Landing Page
        </button>
      </div>
    </div>
  );
}
