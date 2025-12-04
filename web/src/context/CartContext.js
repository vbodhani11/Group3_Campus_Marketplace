import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        const stored = localStorage.getItem("cart");
        return stored ? JSON.parse(stored) : [];
    });
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);
    const addToCart = (item) => {
        setCart((prev) => {
            const exists = prev.find((p) => p.id === item.id);
            if (exists)
                return prev;
            return [...prev, item];
        });
    };
    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((p) => p.id !== id));
    };
    const clearCart = () => setCart([]);
    return (_jsx(CartContext.Provider, { value: { cart, addToCart, removeFromCart, clearCart }, children: children }));
}
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx)
        throw new Error("useCart must be used inside a CartProvider");
    return ctx;
}
