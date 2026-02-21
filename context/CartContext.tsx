
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, TDLProduct } from '../types';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: TDLProduct) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    isInCart: (productId: string) => boolean;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'tallypro_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = useCallback((product: TDLProduct) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                // Already in cart — don't duplicate
                return prev;
            }
            return [...prev, { product, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const isInCart = useCallback((productId: string) => {
        return cartItems.some(item => item.product.id === productId);
    }, [cartItems]);

    const cartCount = cartItems.length;
    const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, isInCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
