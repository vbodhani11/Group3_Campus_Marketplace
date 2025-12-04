import { type ReactNode } from "react";
export interface CartItem {
    id: number;
    title: string;
    price: string;
    image: string;
}
interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
}
export declare function CartProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useCart(): CartContextType;
export {};
