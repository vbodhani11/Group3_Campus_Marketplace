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
          <p>Bridging the gap between students and faculty at Purdue.</p>
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
            icon="💼"
            title="Find Opportunities"
            desc="Discover TA, research, grader, and other campus positions posted directly by professors who in turn can easily reach interested and qualified students."
          />
          <FeatureCard
            icon="🤝"
            title="Connect Directly"
            desc="Streamline communication, allowing students to express their interest and professors to manage potential candidates all in one place."
          />
          <FeatureCard
            icon="🔍"
            title="Explore & Discover"
            desc="Browse faculty profiles to learn about research interests and courses offered. Find students with relevant skills and experience."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
