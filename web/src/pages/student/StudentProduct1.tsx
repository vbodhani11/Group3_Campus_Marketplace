import "../../style/StudentProduct.scss";

export default function StudentProduct() {
  // mock product
  const product = {
    id: 1,
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

  return (
    <section className="student-product">
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

            <div className="seller-card">
              <div className="avatar">{product.seller.name[0]}</div>
              <div className="info">
                <div className="name">{product.seller.name}</div>
                <div className="email">{product.seller.email}</div>
              </div>
              <a href="/messages" className="btn primary">
                Message Seller
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
