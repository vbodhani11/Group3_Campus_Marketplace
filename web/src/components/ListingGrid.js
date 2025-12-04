import { jsx as _jsx } from "react/jsx-runtime";
import ListingCard from "./ListingCard";
export default function ListingGrid({ listings }) {
    return (_jsx("div", { className: "listing-grid", children: listings.map((l) => (_jsx(ListingCard, { listing: l }, l.id))) }));
}
