import "../../style/AdminDashboard.scss";

export default function AdminDashboard() {
  return (
    <section className="dash">
      <div className="dash-header">
        <h1>Dashboard</h1>
      </div>

      <div className="kpi-grid">
        <div className="kpi card">
          <div className="kpi-title">Total Users</div>
          <div className="kpi-value">2,543</div>
          <div className="kpi-delta up">+12.5% from last month</div>
        </div>
        <div className="kpi card">
          <div className="kpi-title">Total Posts</div>
          <div className="kpi-value">1,234</div>
          <div className="kpi-delta up">+8.2% from last month</div>
        </div>
        <div className="kpi card">
          <div className="kpi-title">Engagement Rate</div>
          <div className="kpi-value">68.4%</div>
          <div className="kpi-delta up">+3.1% from last month</div>
        </div>
        <div className="kpi card">
          <div className="kpi-title">Revenue</div>
          <div className="kpi-value">$45,231</div>
          <div className="kpi-delta down">-2.4% from last month</div>
        </div>
      </div>

      <div className="card activity">
        <div className="activity-title">Recent Activity</div>

        <div className="row">
          <div>
            <b>John Doe</b> created a new post
            <div className="time">2 minutes ago</div>
          </div>
          <span className="badge ok">active</span>
        </div>

        <div className="row">
          <div>
            <b>Jane Smith</b> updated their profile
            <div className="time">15 minutes ago</div>
          </div>
          <span className="badge ok">active</span>
        </div>

        <div className="row">
          <div>
            <b>Bob Johnson</b> deleted a comment
            <div className="time">1 hour ago</div>
          </div>
          <span className="badge warn">warning</span>
        </div>

        <div className="row">
          <div>
            <b>Alice Williams</b> reported a post
            <div className="time">2 hours ago</div>
          </div>
          <span className="badge danger">error</span>
        </div>
      </div>
    </section>
  );
}
