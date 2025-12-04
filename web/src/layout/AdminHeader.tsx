import "../style/adminheader.scss";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

export default function AdminHeader({ open, setOpen }: Props) {
  return (
    <header className="admin-header">
      <button
        className="brand"
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Toggle admin sidebar"
      >
        Campus Marketplace
      </button>
      <div /> 
    </header>
  );
}
