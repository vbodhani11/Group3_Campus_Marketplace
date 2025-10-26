import "../../style/AdminDashboard.scss"; // optional if you want to style it later

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, Admin 👋</p>

        <div className="admin-stats">
          <div className="card">
            <h3>Total Users</h3>
            <p>120</p>
          </div>
          <div className="card">
            <h3>Total Listings</h3>
            <p>48</p>
          </div>
          <div className="card">
            <h3>Reports</h3>
            <p>3 pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}
