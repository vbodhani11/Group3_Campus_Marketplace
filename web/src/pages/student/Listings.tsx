import "../../style/StudentListings.scss";
import { Link } from "react-router-dom";

interface Listing {
  id: number;
  title: string;
  price: string;
  image: string;
  seller: string;
}

const listings: Listing[] = [
  {
    id: 1,
    title: "Textbooks - Engineering Set",
    price: "$60",
    image: "https://placehold.co/400x280?text=Books",
    seller: "Alex P.",
  },
  {
    id: 2,
    title: "Used Laptop - Dell XPS 13",
    price: "$480",
    image: "https://placehold.co/400x280?text=Laptop",
    seller: "Maya R.",
  },
  {
    id: 3,
    title: "Dorm Furniture Set",
    price: "$200",
    image: "https://placehold.co/400x280?text=Furniture",
    seller: "Chris J.",
  },
];

export default function StudentListings() {
  const hasListings = listings.length > 0;

  return (
    <div className="student-listings">
      <h1 className="page-title">Browse Marketplace Listings</h1>

      {hasListings ? (
        <div className="listing-grid">
          {listings.map((item) => (
            <div key={item.id} className="listing-card">
              <Link to={`/student/listing/${item.id}`}>
              <img src={item.image} alt={item.title} className="listing-img" />
              </Link>

              <div className="listing-body">
                <h2 className="listing-title">{item.title}</h2>
                <p className="listing-price">{item.price}</p>
                <p className="listing-seller">Sold by {item.seller}</p>
                <Link to={`/student/listing/${item.id}`} className="pfw-btn pfw-btn--outline">
                  View Details
                </Link>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="pfw-muted">No listings available right now.</p>
          <a href="/sell" className="pfw-btn pfw-btn--gold">
            Sell an Item
          </a>
        </div>
      )}
    </div>
  );
}
