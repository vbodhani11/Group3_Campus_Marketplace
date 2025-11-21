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
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      // 1) Create user in Supabase Auth (auth.users)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (authError || !authData.user) {
        console.error("Auth signUp error:", authError);
        alert(authError?.message || "Error creating account.");
        return;
      }

      const authUser = authData.user; // has authUser.id, authUser.email, ...

      // 2) Create matching entry in public.users
      //    id will use its own default; we just link via auth_user_id
      const { error: profileError } = await supabase.from("users").insert([
        {
          full_name: name,
          email,
          password,              // ⚠️ plain-text just to match your current Login.tsx
          auth_user_id: authUser.id, // links to auth.users
          // role, is_active, status, etc. will use your table defaults
        },
      ]);

      if (profileError) {
        console.error("Error saving data in public.users:", profileError);
        alert(
          "Account created in auth, but failed to save profile: " +
            profileError.message
        );
        return;
      }

      alert("Registration successful! You can now log in.");
      navigate("/login");
    } finally {
      setSubmitting(false);
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

          <button type="submit" className="register-btn" disabled={submitting}>
            {submitting ? "Signing up..." : "Sign Up"}
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
