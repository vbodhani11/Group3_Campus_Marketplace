import DashboardSection from "../../components/DashboardSection";
import { useListings } from "../../lib/UseListing";
import type { Listing } from "../../lib/listings";
import { useNavigate } from "react-router-dom"; 
import "../../style/Dashboard.scss";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function DashboardPage() {
  const { listings, loading, error } = useListings();
  const navigate = useNavigate();

  const electronics: Listing[] = listings.filter(
    (l) => l.category === "electronics"
  );
  const books: Listing[] = listings.filter((l) => l.category === "books");
  const furniture: Listing[] = listings.filter(
    (l) => l.category === "furniture"
  );

  const recommended: Listing[] = [...listings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <>
    <Header />
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div className="dashboard-page__header-content">
          <h1 className="dashboard-page__title">Campus Marketplace</h1>
          <p className="dashboard-page__subtitle">
            Quick glance at what’s new and relevant for you.
          </p>
        </div>
      </header>

      <main className="dashboard-page__sections">
        <DashboardSection
          title="Recommended for you"
          listings={recommended}
          onSeeAll={() => navigate("/listings")}
        />

        <DashboardSection
          title="Popular Electronics"
          listings={electronics}
          onSeeAll={() => navigate("/listings?category=electronics")}
        />

        <DashboardSection
          title="Books & Textbooks"
          listings={books}
          onSeeAll={() => navigate("/listings?category=books")}
        />

        <DashboardSection
          title="Dorm Essentials"
          listings={furniture}
          onSeeAll={() => navigate("/listings?category=furniture")}
        />
      </main>
    </div>
    <Footer />
    </>
  );
}
