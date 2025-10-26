import { useNavigate } from "react-router-dom";
import "../style/landing.scss";
import Footer from "../components/Footer";
import FeatureCard from "../components/FeatureCard";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="overlay"></div>
        <div className="hero-content">
          <h1>Campus Marketplace</h1>
          <p>Buy, Sell, and Swap: All Within Your Campus Community.</p>
          <div className="buttons">
            <button className="btn login" onClick={() => navigate("/login")}>Login</button>
            <button className="btn signup" onClick={() => navigate("/register")}>Sign Up</button>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>How Campus Marketplace Helps You</h2>
        <div className="card-grid">
          <FeatureCard
            icon="🛍️"
            title="Buy & Sell Anything"
            desc="Find textbooks, electronics, dorm essentials, and more from students right on your campus. Safe, fast, and affordable."
          />
          <FeatureCard
            icon="🎓"
            title="Student-to-Student Deals"
            desc="Skip middlemen. Connect directly with other students for trusted, local exchanges and verified listings."
          />
          <FeatureCard
            icon="📢"
            title="Post & Promote Easily"
            desc="List your items or services in seconds. Manage chats, track your listings, and close deals all from one platform."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
