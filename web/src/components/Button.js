import { jsx as _jsx } from "react/jsx-runtime";
export default function Button({ children }) {
    return (_jsx("button", { className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg", children: children }));
}
