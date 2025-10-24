export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="p-4 bg-white rounded-xl shadow-md">{children}</div>;
}
