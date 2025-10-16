import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card>
        <h1 className="text-2xl font-bold mb-4 text-center">
          Tailwind Setup ✅
        </h1>
        <div className="flex flex-col gap-3">
          <Input placeholder="Type something..." />
          <Button>Click Me</Button>
        </div>
      </Card>
    </div>
  );
}
