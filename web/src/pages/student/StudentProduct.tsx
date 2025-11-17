import { useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../style/StudentProduct.scss";
import { Link } from "lucide-react";

export default function StudentProduct() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  if (!id) return <div className="student-product__notfound">Product not found.</div>;

  const product = {
    id: Number(id),
    title: "Dell XPS 13 - Used Laptop",
    price: "$480",
    condition: "Used - Excellent",
    category: "Electronics",
    seller: {
      name: "Maya R.",
      email: "maya@campus.com",
    },
    image: "https://placehold.co/600x400?text=Dell+XPS+13",
    description:
      "This Dell XPS 13 is in excellent condition, used for one semester. Sleek, lightweight, and perfect for student work.",
    postedOn: "Nov 12, 2025",
  };

  const handleAddToCart = () => {
    addToCart(product);
    alert(`${product.title} added to cart!`);
  };

  return (
    <section className="student-product">
      <div className="sp-container">
        <div className="sp-image-wrap">
          <img src={product.image} alt={product.title} className="sp-image" />
        </div>

        <div className="sp-details">
          <h1 className="sp-title">{product.title}</h1>
          <p className="sp-category">{product.category}</p>
          <p className="sp-condition">{product.condition}</p>
          <p className="sp-price">{product.price}</p>

          <div className="sp-meta">
            <p>
              <strong>Seller:</strong> {product.seller.name}
            </p>
            <p className="sp-date">Posted on {product.postedOn}</p>
          </div>

          <p className="sp-desc">{product.description}</p>

          <div className="actions">
              <button className="btn primary">Add to Cart</button>
              <Link to="/student/messages" className="btn ghost">
                Message Seller
              </Link>
            </div>
        </div>
      </div>
    </section>
  );
}
