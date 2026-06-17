import { useCart } from "../context/CartContext";
import { parsePreco } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";

const fmtPrice = (n) => "R$ " + n.toFixed(2).replace(".", ",");
const FALLBACK = "https://placehold.co/80x80/eee/999?text=Produto";

export default function Carrinho() {
  const { cart, removeFromCart, updateQty, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#f5f5f5" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

      {/* Header simples */}
      <div style={{ background: "#FFDF26", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ background: "#013F79", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
          ← Voltar
        </button>
        <span style={{ fontWeight: 900, fontSize: 20, color: "#12733A", display: "flex", alignItems: "center", gap: 6 }}>
          <img src={Logo} alt="HarpyToys" style={{ width: 36, height: 36, objectFit: "contain" }} />
          Harpy<span style={{ color: "#013F79" }}>Toys</span>
        </span>
      </div>

      <main className="ht-page-content" style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ color: "#013F79", fontWeight: 900, fontSize: 26, marginBottom: 24 }}>🛒 Meu Carrinho</h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#aaa" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Seu carrinho está vazio</p>
            <button onClick={() => navigate("/")} style={{ background: "#12733A", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Explorar produtos
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Lista de itens */}
            <div style={{ flex: "1 1 500px" }}>
              {cart.map((item) => {
                const nome = item.nome || item.name;
                const img = item.imagem_url || item.img || FALLBACK;
                const price = parsePreco(item.preco || item.price);

                return (
                  <div key={item.id} style={{
                    background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 14,
                    display: "flex", gap: 16, alignItems: "center",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "2px solid #e8e8e8"
                  }}>
                    <img src={img} alt={nome} onError={(e) => (e.target.src = FALLBACK)}
                      style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#222" }}>{nome}</p>
                      <p style={{ margin: "0 0 8px", fontWeight: 800, color: "#12733A", fontSize: 16 }}>{fmtPrice(price)}</p>
                      {/* Controle de quantidade */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid #013F79", background: "#fff", color: "#013F79", fontWeight: 900, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>−</button>
                        <span style={{ fontWeight: 800, fontSize: 16, minWidth: 24, textAlign: "center" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid #013F79", background: "#013F79", color: "#fff", fontWeight: 900, fontSize: 18, cursor: "pointer", lineHeight: 1 }}>+</button>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ margin: "0 0 8px", fontWeight: 900, color: "#c00", fontSize: 16 }}>{fmtPrice(price * item.qty)}</p>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "#c00", fontSize: 22, cursor: "pointer" }} title="Remover">🗑</button>
                    </div>
                  </div>
                );
              })}

              <button onClick={clearCart} style={{ background: "none", color: "#c00", border: "2px solid #c00", borderRadius: 10, padding: "10px 20px", fontWeight: 800, fontSize: 13, cursor: "pointer", marginTop: 8 }}>
                Limpar Carrinho
              </button>
            </div>

            {/* Resumo */}
            <div style={{ flex: "0 1 280px", background: "#fff", borderRadius: 14, padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.09)", border: "2px solid #e8e8e8", position: "sticky", top: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <img src={Logo} alt="HarpyToys" style={{ width: 32, height: 32, objectFit: "contain" }} />
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#013F79" }}>Resumo do Pedido</h2>
              </div>
              <div style={{ borderBottom: "1px solid #eee", paddingBottom: 14, marginBottom: 14 }}>
                {cart.map((item) => {
                  const nome = item.nome || item.name;
                  const price = parsePreco(item.preco || item.price);
                  return (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#555", marginBottom: 5 }}>
                      <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome} x{item.qty}</span>
                      <span style={{ fontWeight: 700 }}>{fmtPrice(price * item.qty)}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 18, color: "#12733A", marginBottom: 20 }}>
                <span>Total</span>
                <span>{fmtPrice(totalPrice)}</span>
              </div>
              <button onClick={() => navigate("/finalizar")}
                style={{ background: "#12733A", color: "#fff", border: "none", borderRadius: 10, padding: "14px 0", fontWeight: 900, fontSize: 15, width: "100%", cursor: "pointer", marginBottom: 10 }}>
                ✔ Finalizar Compra
              </button>
              <button onClick={() => navigate("/")} style={{ background: "#FFDF26", color: "#013F79", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 800, fontSize: 13, width: "100%", cursor: "pointer" }}>
                ← Continuar Comprando
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}