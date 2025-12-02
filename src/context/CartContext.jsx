import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

const LOCAL_KEY = "gosporty_cart";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    return token && token !== "undefined" && token !== "null";
  };

  // Lấy cart từ localStorage
  const getLocalCart = () => {
    const data = localStorage.getItem(LOCAL_KEY);
    try {
      const parsed = JSON.parse(data);
      return parsed && Array.isArray(parsed.items) ? parsed : { items: [] };
    } catch {
      return { items: [] };
    }
  };

  // Lưu vào localStorage
  const saveLocal = (newCart) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(newCart));
    setCart(newCart);
  };

  // Sync cart từ localStorage lên server
  const syncCartToServer = async () => {
    try {
      const localCart = getLocalCart();
      
      if (!localCart.items || localCart.items.length === 0) {
        console.log("📦 No items in localStorage to sync");
        return;
      }

      console.log("🔄 Syncing", localCart.items.length, "items to server...");

      // Gửi từng item lên server
      for (const item of localCart.items) {
        try {
          await api.post("/cart", {
            productId: item.productId,
            qty: item.qty,
            selectedColor: item.selectedColor || "Mặc định",
            selectedSize: item.selectedSize || "One Size",
            price: item.price,
            name: item.name,
            image: item.image,
          });
          console.log("✅ Synced item:", item.name);
        } catch (err) {
          console.error("⚠️ Failed to sync item:", item.name, err.message);
        }
      }

      // Clear localStorage sau khi sync
      localStorage.removeItem(LOCAL_KEY);
      console.log("✅ Cart synced and localStorage cleared");

      // Fetch cart mới từ server
      const res = await api.get("/cart");
      setCart(res.data);
      console.log("✅ Cart loaded from server:", res.data);

    } catch (err) {
      console.error("❌ Sync cart failed:", err.message);
    }
  };

  // Init load cart
  useEffect(() => {
    const init = async () => {
      if (isLoggedIn()) {
        // User đã login -> fetch từ server
        try {
          setLoading(true);
          const res = await api.get("/cart");
          console.log("✅ Cart from server:", res.data);
          
          if (res.data && res.data.items) {
            setCart(res.data);
          } else {
            setCart({ items: [] });
          }
        } catch (err) {
          console.warn("⚠️ Fetch cart from server failed:", err.message);
          // Fallback to localStorage
          const local = getLocalCart();
          setCart(local);
        } finally {
          setLoading(false);
        }
      } else {
        // User chưa login -> dùng localStorage
        const local = getLocalCart();
        console.log("📦 Cart from localStorage:", local);
        setCart(local);
      }
    };

    init();
  }, []);

  // addToCart
  const addToCart = async (payload) => {
    const { productId, qty, selectedColor, selectedSize, price, name, image, quantity, _id } = payload;
    
    // Chuẩn hóa
    const actualQty = qty || quantity || 1;
    const actualProductId = productId || _id;
    const actualColor = selectedColor || "Mặc định";
    const actualSize = selectedSize || "One Size";

    console.log("🛒 Adding to cart:", { 
      actualProductId, 
      actualQty, 
      actualColor, 
      actualSize 
    });

    if (isLoggedIn()) {
      // ✅ User đã login -> Gọi API
      try {
        const res = await api.post("/cart", {
          productId: actualProductId,
          qty: actualQty,
          selectedColor: actualColor,
          selectedSize: actualSize,
          price: price || 0,
          name: name || "Sản phẩm",
          image: image || "",
        });

        console.log("✅ Added to server cart:", res.data);
        setCart(res.data);
        return res.data;

      } catch (err) {
        console.error("❌ Add to cart API failed:", err.message);
        console.error("Error response:", err.response?.status, err.response?.data);
        
        // ✅ FIX: Luôn fallback về localStorage khi API thất bại
        console.log("⚠️ Falling back to localStorage");
        return addToLocalCart(payload);
      }
    } else {
      // ✅ User chưa login -> Lưu vào localStorage
      return addToLocalCart(payload);
    }
  };

  // Helper: Add to localStorage
  const addToLocalCart = (payload) => {
    const { productId, qty, selectedColor, selectedSize, price, name, image, quantity, _id } = payload;
    
    const actualQty = qty || quantity || 1;
    const actualProductId = productId || _id;
    const actualColor = selectedColor || "Mặc định";
    const actualSize = selectedSize || "One Size";

    // ✅ FIX: Lấy cart từ localStorage thay vì từ state
    const currentCart = getLocalCart();
    
    if (!Array.isArray(currentCart.items)) {
      currentCart.items = [];
    }

    const existingIndex = currentCart.items.findIndex(
      (i) =>
        i.productId === actualProductId &&
        i.selectedColor === actualColor &&
        i.selectedSize === actualSize
    );

    if (existingIndex > -1) {
      currentCart.items[existingIndex].qty += actualQty;
      console.log("📝 Updated existing item in localStorage");
    } else {
      currentCart.items.push({
        productId: actualProductId,
        qty: actualQty,
        selectedColor: actualColor,
        selectedSize: actualSize,
        price: price || 0,
        name: name || "Sản phẩm",
        image: image || "",
      });
      console.log("➕ Added new item to localStorage");
    }

    console.log("💾 Saving cart with", currentCart.items.length, "items");
    saveLocal(currentCart);
    return currentCart;
  };

  // updateQuantity
  const updateQuantity = async (productId, selectedColor, selectedSize, newQty) => {
    console.log("🔄 Updating quantity:", { productId, selectedColor, selectedSize, newQty });

    if (isLoggedIn()) {
      // Update trên server
      try {
        const res = await api.put("/cart/update", {
          productId,
          selectedColor,
          selectedSize,
          qty: newQty,
        });

        console.log("✅ Updated quantity on server");
        setCart(res.data);
        return res.data;

      } catch (err) {
        console.error("❌ Update quantity API failed:", err.message);
        
        // Fallback to localStorage if unauthorized
        if (err.response?.status === 401) {
          updateLocalQuantity(productId, selectedColor, selectedSize, newQty);
        }
        
        throw err;
      }
    } else {
      // Update localStorage
      updateLocalQuantity(productId, selectedColor, selectedSize, newQty);
    }
  };

  // Helper: Update localStorage quantity
  const updateLocalQuantity = (productId, selectedColor, selectedSize, newQty) => {
    // ✅ FIX: Lấy từ localStorage thay vì state
    const currentCart = getLocalCart();
    
    if (newQty < 1) {
      currentCart.items = currentCart.items.filter(
        (i) =>
          !(
            i.productId === productId &&
            i.selectedColor === selectedColor &&
            i.selectedSize === selectedSize
          )
      );
    } else {
      const itemIndex = currentCart.items.findIndex(
        (i) =>
          i.productId === productId &&
          i.selectedColor === selectedColor &&
          i.selectedSize === selectedSize
      );

      if (itemIndex > -1) {
        currentCart.items[itemIndex].qty = newQty;
      }
    }

    console.log("💾 Saving updated cart with", currentCart.items.length, "items");
    saveLocal(currentCart);
    return currentCart;
  };

  // removeItem
  const removeItem = async (productId, selectedColor, selectedSize) => {
    console.log("🗑️ Removing item:", { productId, selectedColor, selectedSize });

    if (isLoggedIn()) {
      // Remove từ server
      try {
        const res = await api.delete("/cart/remove", {
          data: {
            productId,
            selectedColor,
            selectedSize,
          }
        });

        console.log("✅ Removed from server cart");
        setCart(res.data);
        return res.data;

      } catch (err) {
        console.error("❌ Remove item API failed:", err.message);
        
        if (err.response?.status === 401) {
          removeLocalItem(productId, selectedColor, selectedSize);
        }
        
        throw err;
      }
    } else {
      // Remove từ localStorage
      removeLocalItem(productId, selectedColor, selectedSize);
    }
  };

  // Helper: Remove from localStorage
  const removeLocalItem = (productId, selectedColor, selectedSize) => {
    // ✅ FIX: Lấy từ localStorage thay vì state
    const currentCart = getLocalCart();
    currentCart.items = currentCart.items.filter(
      (i) =>
        !(
          i.productId === productId &&
          i.selectedColor === selectedColor &&
          i.selectedSize === selectedSize
        )
    );

    console.log("💾 Saving cart after removal with", currentCart.items.length, "items");
    saveLocal(currentCart);
    return currentCart;
  };

  // clearCartLocal
  const clearCart = async () => {
    console.log("🗑️ Clearing cart");

    if (isLoggedIn()) {
      try {
        await api.delete("/cart/clear");
        console.log("✅ Cleared server cart");
      } catch (err) {
        console.error("❌ Clear cart API failed:", err.message);
      }
    }
    
    saveLocal({ items: [] });
  };

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        loading, 
        addToCart, 
        updateQuantity,
        removeItem,
        setCart, 
        clearCart,
        syncCartToServer, // Export để dùng khi login
      }}
    >
      {children}
    </CartContext.Provider>
  );
};