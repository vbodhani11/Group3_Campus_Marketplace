import type { Listing } from "../lib/listings";
interface DashboardSectionProps {
    title: string;
    listings: Listing[];
    onSeeAll?: () => void;
}
export default function DashboardSection({ title, listings, onSeeAll }: DashboardSectionProps): import("react/jsx-runtime").JSX.Element;
export {};
