import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

// Converte qualquer formato de preço para número float
// Aceita: 50.00 (número), "50.00", "R$ 50,00", "R$ 1.299,90"
function parsePreco(valor) {
  if (typeof valor === "number") return valor;
  const str = String(valor || "0").trim();

  // Remove "R$" e espaços
  let limpo = str.replace("R$", "").replace(/\s/g, "");

  // Formato brasileiro: "1.299,90" → detecta vírgula como decimal
  if (/\d+\.\d{3},\d{2}/.test(limpo)) {
    // Tem separador de milhar (ponto) E decimal (vírgula)
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  } else if (limpo.includes(",")) {
    // Só vírgula como decimal: "50,00"
    limpo = limpo.replace(",", ".");
  }
  // Caso seja "50.00" puro (ponto como decimal) — não mexe

  return parseFloat(limpo) || 0;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    const nome = product.nome || product.name;
    setToast('"' + nome + '" adicionado! 🎉');
    setTimeout(() => setToast(null), 2500);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  // Usa parsePreco robusto — funciona com número puro OU string formatada
  const totalPrice = cart.reduce((s, i) => {
    return s + parsePreco(i.preco || i.price) * i.qty;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, cartOpen, setCartOpen, toast, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
export { parsePreco };
