import "../../style/StudentProduct.scss";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function StudentProduct() {
  // simulate fetching by id from the URL
  //useParams<{ id: string }>();
  //const { id } = useParams();
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  // mock product
  const product = {
    id: Number(id) || 0,
    title: "Used Laptop - Dell XPS 13",
    price: "$480",
    condition: "Good",
    category: "Electronics",
    seller: { name: "Maya R.", email: "maya@campus.edu" },
    image: "https://placehold.co/600x400?text=Dell+XPS+13",
    description:
      "Lightweight Dell XPS 13 (2020) with 16GB RAM, 512GB SSD, and Intel i7 processor. Excellent battery life and performance for campus work.",
    postedOn: "Nov 10, 2025",
  };

  const handleAddToCart = () => {
    addToCart(product);
    alert(`${product.title} added to cart!`);
  };

  // mock related data
  /*
  const moreFromSeller = [
    {
      id: 2,
      title: "Wireless Keyboard",
      price: "$25",
      image: "https://placehold.co/400x300?text=Keyboard",
    },
    {
      id: 3,
      title: "Laptop Stand",
      price: "$30",
      image: "https://placehold.co/400x300?text=Stand",
    },
  ];

  const similarListings = [
    {
      id: 4,
      title: "MacBook Pro 2019",
      price: "$850",
      image: "https://placehold.co/400x300?text=MacBook+Pro",
    },
    {
      id: 5,
      title: "HP Envy 15",
      price: "$620",
      image: "https://placehold.co/400x300?text=HP+Envy",
    },
  ];
*/

  return (
    <section className="student-product">
      {/* ---- Breadcrumb ---- */}
      {/* <nav className="breadcrumb">
        <Link to="/listings">Home</Link> <span>/</span>
        <Link to={`/category/${product.category.toLowerCase()}`}>
          {product.category}
        </Link>{" "}
        <span>/</span>
        <span className="active">{product.title}</span>
      </nav> */}

      <div className="card">
        <div className="product-grid">
          {/* Left: Product image */}
          <div className="image-wrap">
            <img src={product.image} alt={product.title} />
          </div>

          {/* Right: Product details */}
          <div className="details">
            <h1 className="title">{product.title}</h1>
            <p className="category">{product.category}</p>
            <p className="price">{product.price}</p>
            <p className="condition">Condition: {product.condition}</p>
            <p className="posted">Posted on {product.postedOn}</p>

            <p className="desc">{product.description}</p>

            {/* Actions */}
            <div className="actions">
              <button className="btn primary">Add to Cart</button>
              <Link to="/student/messages" className="btn ghost">
                Message Seller
              </Link>
            </div>

            {/* Seller info */}
            <div className="seller-card">
              <div className="avatar">{product.seller.name[0]}</div>
              <div className="info">
                <div className="name">{product.seller.name}</div>
                <div className="email">{product.seller.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- More from Seller ---- */}
      {/* 
      <div className="related-section">
        <h2>More from {product.seller.name}</h2>
        <div className="related-grid">
          {moreFromSeller.map((item) => (
        <Link to={`/listing/${item.id}`} key={item.id} className="related-card">
          <img src={item.image} alt={item.title} />
          <div className="rc-body">
            <h3>{item.title}</h3>
            <p>{item.price}</p>
          </div>
        </Link>
          ))}
        </div>
      </div>
      */}

      {/* ---- Similar Listings ---- */}
      {/* 
      <div className="related-section">
        <h2>Similar Listings</h2>
        <div className="related-grid">
          {similarListings.map((item) => (
        <Link to={`/listing/${item.id}`} key={item.id} className="related-card">
          <img src={item.image} alt={item.title} />
          <div className="rc-body">
            <h3>{item.title}</h3>
            <p>{item.price}</p>
          </div>
        </Link>
          ))}
        </div>
      </div>
      */}
    </section>
  );
}
