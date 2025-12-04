import { jsx as _jsx } from "react/jsx-runtime";
import "../style/header.scss";
export default function Header() {
    return (_jsx("header", { className: "header", children: _jsx("div", { className: "logo", children: "Campus Marketplace" }) }));
}
