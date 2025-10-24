import { useState, useRef } from "react"
import Layout from "../layout/Layout"

type Condition = "New" | "Like New" | "Good" | "Fair"

export default function Sell() {
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("General")
  const [condition, setCondition] = useState<Condition>("Good")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  function onPickImage() {
    fileRef.current?.click()
  }

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.")
      return
    }
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setError(null)
  }

  function validate(): string | null {
    if (!title.trim()) return "Please enter a title."
    const p = Number(price)
    if (Number.isNaN(p) || p < 0) return "Please enter a valid price."
    if (!description.trim()) return "Please add a short description."
    return null
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccess(null)
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setError(null)

    //Mock “save” to localStorage so we can see it later
    const listing = {
      id: Date.now(),
      title: title.trim(),
      price: Number(price).toFixed(2),
      category,
      condition,
      description: description.trim(),
      imageUrl,
    }
    const key = "cm_listings"
    const prev = (() => {
      try { return JSON.parse(localStorage.getItem(key) || "[]") } catch { return [] }
    })()
    localStorage.setItem(key, JSON.stringify([listing, ...prev]))

    // Reset form + show success
    setTitle("")
    setPrice("")
    setCategory("General")
    setCondition("Good")
    setDescription("")
    setImageUrl(null)
    if (fileRef.current) fileRef.current.value = ""
    setSuccess("Listing created! (Saved locally)")
  }

  return (
    <Layout title="Sell an Item">
      <div className="pfw-auth">
        <form className="pfw-card sell-form" onSubmit={onSubmit} style={{ maxWidth: 720, width: "100%" }}>
          <div className="pfw-card__body">
            {success && (
              <div className="sell-banner success" role="status">{success}</div>
            )}
            {error && (
              <div className="sell-banner error" role="alert">{error}</div>
            )}

            <div className="pfw-field">
              <label className="pfw-label" htmlFor="title">Title</label>
              <input
                id="title"
                className="pfw-input"
                placeholder="e.g., TI-84 Plus Calculator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="sell-row">
              <div className="pfw-field" style={{ flex: 1 }}>
                <label className="pfw-label" htmlFor="price">Price (USD)</label>
                <input
                  id="price"
                  className="pfw-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 45"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="pfw-field" style={{ flex: 1 }}>
                <label className="pfw-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  className="pfw-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>General</option>
                  <option>Books</option>
                  <option>Electronics</option>
                  <option>Furniture</option>
                  <option>Clothing</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="pfw-field" style={{ flex: 1 }}>
                <label className="pfw-label" htmlFor="condition">Condition</label>
                <select
                  id="condition"
                  className="pfw-input"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Condition)}
                >
                  <option>New</option>
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
              </div>
            </div>

            <div className="pfw-field">
              <label className="pfw-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                className="pfw-input"
                placeholder="Include important details like model, condition notes, pickup on campus, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
              <div className="pfw-help">Tip: buyers love clear, brief descriptions.</div>
            </div>

            <div className="pfw-field">
              <label className="pfw-label">Photos</label>
              <div className="sell-photos">
                <button type="button" onClick={onPickImage} className="pfw-btn pfw-btn--outline">Upload Photo</button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  style={{ display: "none" }}
                />
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="sell-preview" />
                ) : (
                  <div className="sell-placeholder">No photo selected</div>
                )}
              </div>
              <div className="pfw-help">One photo for now (front-end). We’ll add multiple later.</div>
            </div>

            <div className="pfw-form-actions">
              <button type="submit" className="pfw-btn pfw-btn--gold">Publish Listing</button>
              <a className="pfw-btn pfw-btn--outline" href="/listings">Cancel</a>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}
