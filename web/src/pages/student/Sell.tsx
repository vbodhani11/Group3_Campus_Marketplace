import { useState } from "react";
import "../../style/StudentSell.scss";

export default function StudentSell() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Books");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    // TODO: upload image to Supabase storage later
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: save listing to Supabase database
      alert("Listing submitted successfully!");
      setTitle("");
      setDesc("");
      setPrice("");
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      alert("Failed to submit listing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="student-sell">
      <div className="card">
        <h1>Sell an Item</h1>
        <p className="muted-sub">
          Fill out the form below to post your item to the Campus Marketplace.
        </p>

        <form className="form" onSubmit={onSubmit}>
          <div className="image-upload">
            <img
              className="preview"
              src={imagePreview || "/placeholder-image.png"}
              alt="Image Preview"
            />
            <label className="upload-btn">
              Upload Photo
              <input type="file" accept="image/*" onChange={onImageChange} />
            </label>
          </div>

          <div className="grid">
            <div className="field">
              <label>Title</label>
              <input
                placeholder="Ex: Used Laptop - Dell XPS 13"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Books</option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Clothing</option>
                <option>Other</option>
              </select>
            </div>

            <div className="field">
              <label>Price ($)</label>
              <input
                type="number"
                placeholder="Ex: 50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="field span-2">
              <label>Description</label>
              <textarea
                placeholder="Describe the condition, brand, and any important details..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <div className="actions">
            <button
              className="btn primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Posting..." : "Post Listing"}
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
