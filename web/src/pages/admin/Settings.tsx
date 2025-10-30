import React, { useMemo, useState } from "react";
import "../../style/admin-settings.scss";

type Tab = "general" | "categories" | "moderation" | "payments" | "notifications";

type ToggleProps = { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean };
function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      className={`tg ${checked ? "on" : ""} ${disabled ? "disabled" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="knob" />
    </button>
  );
}

function FieldRow({
  label,
  sub,
  children,
  right,
}: {
  label: string;
  sub?: string;
  children?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="field-row">
      <div className="left">
        <div className="label">{label}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
      <div className="mid">{children}</div>
      <div className="right">{right}</div>
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState<Tab>("general");

  // General
  const [platform, setPlatform] = useState({
    name: "Campus Marketplace",
    tagline: "Buy and Sell with Fellow Students",
    desc: "A trusted marketplace for students to buy and sell items within the campus community.",
    email: "support@campus.edu",
  });
  const [policies, setPolicies] = useState({
    autoApprove: false,
    maxPrice: 10000,
    defaultDuration: "30 days",
    allowNegotiation: true,
  });

  // Categories
  const [newCat, setNewCat] = useState("");
  const [cats, setCats] = useState<string[]>([
    "Electronics",
    "Books",
    "Furniture",
    "Clothing",
    "Sports & Outdoors",
    "Home & Garden",
  ]);
  const [catSettings, setCatSettings] = useState({
    requireSelection: true,
    allowMultiple: false,
  });

  // Moderation
  const [mod, setMod] = useState({
    manualApproval: true,
    profanityFilter: true,
    duplicateDetect: true,
    autoApproveAfter: "24 hours",
  });
  const [restrictions, setRestrictions] = useState({
    requireEmailVerification: true,
    campusEmailRequired: true,
    maxActiveListings: 10,
  });

  // Payments
  const [payments, setPayments] = useState({
    enableOnline: false,
    methods: {
      cashOnPickup: true,
      venmo: true,
      paypal: false,
      card: false,
    },
    feesEnabled: false,
    platformFeePct: 5,
    minFee: 0.5,
  });

  // Notifications
  const [notif, setNotif] = useState({
    email: {
      newListing: true,
      sale: true,
      reviewReminders: true,
      weeklyReports: true,
    },
    user: {
      approved: true,
      rejected: true,
      newMessage: false,
      priceDrop: false,
    },
  });

  const canSave = useMemo(() => true, []);

  const addCategory = () => {
    const v = newCat.trim();
    if (!v || cats.includes(v)) return;
    setCats([...cats, v]);
    setNewCat("");
  };
  const removeCategory = (name: string) => setCats(cats.filter((c) => c !== name));

  return (
    <div className="admin-settings">
      <h1 className="page-title">Settings</h1>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Marketplace Settings</div>
            <div className="panel-sub">Configure your campus marketplace platform</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {([
            { k: "general", t: "General" },
            { k: "categories", t: "Categories" },
            { k: "moderation", t: "Moderation" },
            { k: "payments", t: "Payments" },
            { k: "notifications", t: "Notifications" },
          ] as { k: Tab; t: string }[]).map((x) => (
            <button key={x.k} className={`tab ${tab === x.k ? "is-active" : ""}`} onClick={() => setTab(x.k)}>
              {x.t}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {tab === "general" && (
          <>
            <section className="section">
              <div className="section-head">
                <div className="section-title">Platform Information</div>
                <div className="section-sub">Basic configuration for your marketplace</div>
              </div>

              <FieldRow label="Marketplace Name">
                <input
                  className="input"
                  value={platform.name}
                  onChange={(e) => setPlatform({ ...platform, name: e.target.value })}
                />
              </FieldRow>

              <FieldRow label="Tagline">
                <input
                  className="input"
                  value={platform.tagline}
                  onChange={(e) => setPlatform({ ...platform, tagline: e.target.value })}
                />
              </FieldRow>

              <FieldRow label="Description">
                <textarea
                  className="textarea"
                  rows={3}
                  value={platform.desc}
                  onChange={(e) => setPlatform({ ...platform, desc: e.target.value })}
                />
              </FieldRow>

              <FieldRow label="Support Email">
                <input
                  className="input"
                  value={platform.email}
                  onChange={(e) => setPlatform({ ...platform, email: e.target.value })}
                />
              </FieldRow>
            </section>

            <section className="section">
              <div className="section-head">
                <div className="section-title">Listing Policies</div>
                <div className="section-sub">Configure default rules for marketplace listings</div>
              </div>

              <FieldRow
                label="Auto-approve Listings"
                sub="Automatically approve new listings without review"
                right={<Toggle checked={policies.autoApprove} onChange={(v) => setPolicies({ ...policies, autoApprove: v })} />}
              />

              <FieldRow label="Maximum Listing Price ($)">
                <input
                  type="number"
                  className="input"
                  value={policies.maxPrice}
                  onChange={(e) => setPolicies({ ...policies, maxPrice: Number(e.target.value) })}
                />
              </FieldRow>

              <FieldRow label="Default Listing Duration (days)">
                <select
                  className="select"
                  value={policies.defaultDuration}
                  onChange={(e) => setPolicies({ ...policies, defaultDuration: e.target.value })}
                >
                  <option>7 days</option>
                  <option>14 days</option>
                  <option>30 days</option>
                  <option>60 days</option>
                </select>
              </FieldRow>

              <FieldRow
                label="Allow Price Negotiation"
                sub="Let buyers make offers below asking price"
                right={
                  <Toggle
                    checked={policies.allowNegotiation}
                    onChange={(v) => setPolicies({ ...policies, allowNegotiation: v })}
                  />
                }
              />
            </section>

            <div className="savebar">
              <button className="btn btn--primary" disabled={!canSave}>
                <span className="ico-disk" />
                Save Changes
              </button>
            </div>
          </>
        )}

        {tab === "categories" && (
          <>
            <section className="section">
              <div className="section-head">
                <div className="section-title">Manage Categories</div>
                <div className="section-sub">Add, edit, or remove listing categories</div>
              </div>

              <div className="add-row">
                <input
                  className="input"
                  placeholder="Enter new category name"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                />
                <button className="btn btn--dark" onClick={addCategory}>
                  + Add
                </button>
              </div>

              <div className="chips">
                {cats.map((c) => (
                  <span className="chip" key={c}>
                    <span className="chip-ico">🏷️</span>
                    {c}
                    <button className="chip-x" onClick={() => removeCategory(c)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </section>

            <section className="section">
              <div className="section-head">
                <div className="section-title">Category Settings</div>
                <div className="section-sub">Configure category-specific options</div>
              </div>

              <FieldRow
                label="Require Category Selection"
                sub="Force users to select a category when creating listings"
                right={
                  <Toggle
                    checked={catSettings.requireSelection}
                    onChange={(v) => setCatSettings({ ...catSettings, requireSelection: v })}
                  />
                }
              />

              <FieldRow
                label="Allow Multiple Categories"
                sub="Let sellers assign multiple categories to a listing"
                right={
                  <Toggle
                    checked={catSettings.allowMultiple}
                    onChange={(v) => setCatSettings({ ...catSettings, allowMultiple: v })}
                  />
                }
              />
            </section>

            <div className="savebar">
              <button className="btn btn--primary">
                <span className="ico-disk" />
                Save Changes
              </button>
            </div>
          </>
        )}

        {tab === "moderation" && (
          <>
            <section className="section">
              <div className="section-head">
                <div className="section-title">Content Moderation</div>
                <div className="section-sub">Set rules for content review and moderation</div>
              </div>

              <FieldRow
                label="Manual Approval Required"
                sub="Review all new listings before they go live"
                right={<Toggle checked={mod.manualApproval} onChange={(v) => setMod({ ...mod, manualApproval: v })} />}
              />
              <FieldRow
                label="Profanity Filter"
                sub="Automatically flag listings with inappropriate language"
                right={<Toggle checked={mod.profanityFilter} onChange={(v) => setMod({ ...mod, profanityFilter: v })} />}
              />
              <FieldRow
                label="Duplicate Detection"
                sub="Detect and prevent duplicate listings"
                right={<Toggle checked={mod.duplicateDetect} onChange={(v) => setMod({ ...mod, duplicateDetect: v })} />}
              />
              <FieldRow label="Auto-approve After (hours)">
                <select
                  className="select"
                  value={mod.autoApproveAfter}
                  onChange={(e) => setMod({ ...mod, autoApproveAfter: e.target.value })}
                >
                  <option>12 hours</option>
                  <option>24 hours</option>
                  <option>48 hours</option>
                </select>
              </FieldRow>
            </section>

            <section className="section">
              <div className="section-head">
                <div className="section-title">User Restrictions</div>
                <div className="section-sub">Configure user access and restrictions</div>
              </div>

              <FieldRow
                label="Require Email Verification"
                sub="Users must verify email before posting"
                right={
                  <Toggle
                    checked={restrictions.requireEmailVerification}
                    onChange={(v) => setRestrictions({ ...restrictions, requireEmailVerification: v })}
                  />
                }
              />
              <FieldRow
                label="Campus Email Required"
                sub="Only allow .edu email addresses"
                right={
                  <Toggle
                    checked={restrictions.campusEmailRequired}
                    onChange={(v) => setRestrictions({ ...restrictions, campusEmailRequired: v })}
                  />
                }
              />
              <FieldRow label="Max Active Listings per User">
                <input
                  type="number"
                  className="input"
                  value={restrictions.maxActiveListings}
                  onChange={(e) => setRestrictions({ ...restrictions, maxActiveListings: Number(e.target.value) })}
                />
              </FieldRow>
            </section>

            <div className="savebar">
              <button className="btn btn--primary">
                <span className="ico-disk" />
                Save Changes
              </button>
            </div>
          </>
        )}

        {tab === "payments" && (
          <>
            <section className="section">
              <div className="section-head">
                <div className="section-title">Payment Settings</div>
                <div className="section-sub">Configure payment and transaction options</div>
              </div>

              <FieldRow
                label="Enable Online Payments"
                sub="Allow buyers to pay through the platform"
                right={<Toggle checked={payments.enableOnline} onChange={(v) => setPayments({ ...payments, enableOnline: v })} />}
              />

              <div className="pm-group">
                <div className="pm-label">Payment Methods</div>
                <div className="pm-list">
                  {([
                    ["cashOnPickup", "Cash on Pickup"],
                    ["venmo", "Venmo"],
                    ["paypal", "PayPal"],
                    ["card", "Credit/Debit Card"],
                  ] as const).map(([key, label]) => (
                    <label className={`pm-item ${payments.methods[key] ? "on" : ""}`} key={key}>
                      <input
                        type="checkbox"
                        checked={payments.methods[key]}
                        onChange={(e) =>
                          setPayments({
                            ...payments,
                            methods: { ...payments.methods, [key]: e.target.checked },
                          })
                        }
                      />
                      <span className="pm-switch" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-head">
                <div className="section-title">Transaction Fees</div>
                <div className="section-sub">Set platform fees for transactions</div>
              </div>

              <FieldRow
                label="Charge Transaction Fees"
                sub="Take a percentage of each sale"
                right={<Toggle checked={payments.feesEnabled} onChange={(v) => setPayments({ ...payments, feesEnabled: v })} />}
              />
              <FieldRow label="Platform Fee (%)">
                <input
                  type="number"
                  className="input"
                  value={payments.platformFeePct}
                  disabled={!payments.feesEnabled}
                  onChange={(e) => setPayments({ ...payments, platformFeePct: Number(e.target.value) })}
                />
              </FieldRow>
              <FieldRow label="Minimum Fee ($)">
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={payments.minFee}
                  disabled={!payments.feesEnabled}
                  onChange={(e) => setPayments({ ...payments, minFee: Number(e.target.value) })}
                />
              </FieldRow>
            </section>

            <div className="savebar">
              <button className="btn btn--primary">
                <span className="ico-disk" />
                Save Changes
              </button>
            </div>
          </>
        )}

        {tab === "notifications" && (
          <>
            <section className="section">
              <div className="section-head">
                <div className="section-title">Email Notifications</div>
                <div className="section-sub">Configure automated email notifications</div>
              </div>

              <FieldRow
                label="New Listing Notifications"
                sub="Notify admins when new listings are posted"
                right={<Toggle checked={notif.email.newListing} onChange={(v) => setNotif({ ...notif, email: { ...notif.email, newListing: v } })} />}
              />
              <FieldRow
                label="Sale Notifications"
                sub="Notify sellers when items are marked as sold"
                right={<Toggle checked={notif.email.sale} onChange={(v) => setNotif({ ...notif, email: { ...notif.email, sale: v } })} />}
              />
              <FieldRow
                label="Review Reminders"
                sub="Remind admins of pending listings to review"
                right={<Toggle checked={notif.email.reviewReminders} onChange={(v) => setNotif({ ...notif, email: { ...notif.email, reviewReminders: v } })} />}
              />
              <FieldRow
                label="Weekly Reports"
                sub="Send weekly marketplace performance reports"
                right={<Toggle checked={notif.email.weeklyReports} onChange={(v) => setNotif({ ...notif, email: { ...notif.email, weeklyReports: v } })} />}
              />
            </section>

            <section className="section">
              <div className="section-head">
                <div className="section-title">User Notifications</div>
                <div className="section-sub">Configure notifications sent to users</div>
              </div>

              <FieldRow
                label="Listing Approved"
                sub="Notify when their listing is approved"
                right={<Toggle checked={notif.user.approved} onChange={(v) => setNotif({ ...notif, user: { ...notif.user, approved: v } })} />}
              />
              <FieldRow
                label="Listing Rejected"
                sub="Notify when their listing is rejected with reason"
                right={<Toggle checked={notif.user.rejected} onChange={(v) => setNotif({ ...notif, user: { ...notif.user, rejected: v } })} />}
              />
              <FieldRow
                label="New Message"
                sub="Notify when they receive a message about their listing"
                right={<Toggle checked={notif.user.newMessage} onChange={(v) => setNotif({ ...notif, user: { ...notif.user, newMessage: v } })} />}
              />
              <FieldRow
                label="Price Drop Alerts"
                sub="Notify interested buyers of price reductions"
                right={<Toggle checked={notif.user.priceDrop} onChange={(v) => setNotif({ ...notif, user: { ...notif.user, priceDrop: v } })} />}
              />
            </section>

            <div className="savebar">
              <button className="btn btn--primary">
                <span className="ico-disk" />
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
