import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ListingGrid from "./ListingGrid";
export default function DashboardSection({ title, listings, onSeeAll }) {
    return (_jsxs("section", { className: "dashboard-section", children: [_jsxs("div", { className: "dashboard-section__header", children: [_jsx("h2", { className: "dashboard-section__title", children: title }), onSeeAll && (_jsx("button", { type: "button", className: "dashboard-section__see-all", onClick: onSeeAll, children: "See all" }))] }), _jsx(ListingGrid, { listings: listings })] }));
}
