import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "../style/card.scss";
export default function FeatureCard({ icon, title, desc, }) {
    return (_jsxs("div", { className: "feature-card", children: [_jsx("div", { className: "icon", children: icon }), _jsx("h3", { children: title }), _jsx("p", { children: desc })] }));
}
