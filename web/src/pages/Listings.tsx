import Layout from "../layout/Layout"

interface Listing {
  id: number
  title: string
  price: string
  image: string
  seller: string
}

// temporary mock data
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
]

export default function Listings() {
  const hasListings = listings.length > 0

  return (
    <Layout title="Browse Listings">
      <div className="pfw-container" style={{ marginTop: 12 }}>
        {hasListings ? (
          <div className="listing-grid">
            {listings.map((item) => (
              <div key={item.id} className="pfw-card listing-card">
                <img
                  src={item.image}
                  alt={item.title}
                  className="listing-img"
                />
                <div className="pfw-card__body">
                  <h2 className="listing-title">{item.title}</h2>
                  <p className="listing-price">{item.price}</p>
                  <p className="listing-seller">Sold by {item.seller}</p>
                  <a href={`/listing/${item.id}`} className="pfw-btn pfw-btn--outline">
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p className="pfw-muted">No listings available right now.</p>
            <a href="/sell" className="pfw-btn pfw-btn--gold" style={{ marginTop: 16 }}>
              Sell an Item
            </a>
          </div>
        )}
      </div>
    </Layout>
  )
}
