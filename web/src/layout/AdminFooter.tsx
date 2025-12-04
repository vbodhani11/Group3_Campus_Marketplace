import "../style/adminfooter.scss";

export default function AdminFooter() {
  return (
    <footer className="admin-footer" role="contentinfo">
      <div className="af-inner">
        <div className="af-line">
          <strong>Campus Marketplace</strong>
          <span className="sep">|</span>
          <span>Purdue University Fort Wayne</span>
        </div>
        <div className="af-line small">© {new Date().getFullYear()} — All Rights Reserved</div>
      </div>
    </footer>
  );
}
