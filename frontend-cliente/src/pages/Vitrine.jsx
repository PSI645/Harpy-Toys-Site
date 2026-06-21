// frontend/src/pages/Vitrine.jsx
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Logo from "../assets/Logo_2.png";
import { MOCK_PRODUTOS, CATEGORIAS } from "../data/mockProdutos";

// ── Quando integrar com banco, veja INTEGRACAO_BANCO.md ───────────────────────
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function Estrelas({ n }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? "#F8C131" : "#ddd", fontSize: 14 }}>★</span>
      ))}
    </span>
  );
}

export default function Vitrine() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();

  const catInfo = CATEGORIAS.find(c => c.slug === categoria);
  const label   = catInfo?.label || categoria;

  // ── Header states ─────────────────────────────────────────────────────────
  const [cepHeader, setCepHeader] = useState(() => localStorage.getItem("cep_usuario") || "");
  const [busca, setBusca]         = useState("");
  const [usuario, setUsuario]     = useState(() => {
    try { return JSON.parse(localStorage.getItem("usuario")); } catch { return null; }
  });

  useEffect(() => {
    const sync = () => {
      try { setUsuario(JSON.parse(localStorage.getItem("usuario"))); } catch { setUsuario(null); }
    };
    window.addEventListener("usuarioLogado", sync);
    window.addEventListener("usuarioDeslogado", sync);
    return () => { window.removeEventListener("usuarioLogado", sync); window.removeEventListener("usuarioDeslogado", sync); };
  }, []);

  // ── Filtros ──────────────────────────────────────────────────────────────────
  const [ordem, setOrdem]       = useState("relevancia");
  const [precoMax, setPrecoMax] = useState(500);
  const [somenteOfertas, setSomenteOfertas] = useState(false);

  const [todosProdutos, setTodosProdutos] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/produtos?categoria=${categoria}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTodosProdutos(data.map(p => ({
          ...p,
          preco_num: parseFloat(p.preco) || 0,
          estrelas: p.estrelas || 4,
        })));
      })
      .catch(() => setTodosProdutos([]));
  }, [categoria]);

  const produtos = useMemo(() => {
    let lista = [...todosProdutos];
    if (somenteOfertas) lista = lista.filter(p => p.desconto);
    lista = lista.filter(p => p.preco_num <= precoMax);
    if (ordem === "menor")    lista = [...lista].sort((a, b) => a.preco_num - b.preco_num);
    if (ordem === "maior")    lista = [...lista].sort((a, b) => b.preco_num - a.preco_num);
    if (ordem === "estrelas") lista = [...lista].sort((a, b) => b.estrelas - a.estrelas);
    return lista;
  }, [todosProdutos, ordem, precoMax, somenteOfertas]);

  const precoMaxGeral = Math.max(...todosProdutos.map(p => p.preco_num), 500);

  // ── Popup carrinho ───────────────────────────────────────────────────────
  const [popup, setPopup] = useState(null);

  const handleAddToCart = (p) => {
    addToCart({ id: p.id, nome: p.nome, preco: p.preco_num, imagem_url: p.imagem_url });
    setPopup(p.nome);
    setTimeout(() => setPopup(null), 2500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .card-produto:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.13) !important; }
        .btn-adicionar:hover { filter: brightness(1.1); }
        .btn-adicionar:active { transform: scale(0.97); }
        .filtro-check:hover { color: #12733A !important; }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(20px); } }
      `}</style>

      {/* ── Popup carrinho ── */}
      {popup && (
        <div style={{
          position: "fixed", bottom: 28, left: "60%", transform: "translateX(0%)",
          zIndex: 9999, background: "#12733A", color: "#fff",
          padding: "14px 28px", borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
          fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15,
          display: "flex", alignItems: "center", gap: 10,
          animation: "slideUp 0.3s ease",
          whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: 20 }}>🛒</span>
          <span>"{popup}" adicionado ao carrinho!</span>
          <span style={{ fontSize: 20 }}>🎉</span>
        </div>
      )}

      {/* ── Header ── */}
      <header className="ht-header-bar" style={{
        background: "#FFDF26", padding: "0 28px",
        height: 80, display: "flex", alignItems: "center", gap: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <img src={Logo} alt="HarpyToys"
          style={{ height: 64, cursor: "pointer", objectFit: "contain" }}
          onClick={() => navigate("/")} />

        {/* CEP */}
        <div className="ht-cep-wrap" style={{ display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#013F79", fontWeight: 700, whiteSpace: "nowrap" }}>
          <span>📍</span>
          <span>Entrega em: <strong>{cepHeader || "Seu CEP"}</strong></span>
        </div>

        {/* Barra de pesquisa — só na Vitrine */}
        <div className="ht-search-wrap" style={{ flex: 1, maxWidth: 520, display: "flex", alignItems: "center",
          background: "#fff", borderRadius: 12, border: "2px solid #013F79",
          overflow: "hidden", margin: "0 8px" }}>
          <span style={{ padding: "0 12px", fontSize: 16 }}>🔍</span>
          <input
            type="text"
            placeholder="Encontre o seu Brinquedo"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 14, fontFamily: "'Nunito', sans-serif",
              fontWeight: 700, padding: "10px 0", background: "transparent",
            }}
          />
        </div>

        {/* Ícones direita */}
        <div className="ht-icons-wrap" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}>
          {/* Favoritos */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, cursor: "pointer" }}
            title="Favoritos">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="#013F79" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#013F79" }}>Favoritos</span>
          </div>

          {/* Perfil */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, cursor: "pointer" }}
            onClick={() => navigate("/login")}
            title="Minha Conta">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="#013F79" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#013F79" }}>
              {usuario ? usuario.nome?.split(" ")[0] : "Entrar"}
            </span>
          </div>

          {/* Carrinho */}
          <div style={{ position: "relative", cursor: "pointer" }}
            onClick={() => navigate("/carrinho")} title="Carrinho">
            <div style={{
              background: "#013F79", color: "#fff", borderRadius: 12,
              padding: "8px 18px", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 14,
            }}>
              🛒 <span>Carrinho</span>
              {totalItems > 0 && (
                <span style={{
                  background: "#F8C131", color: "#013F79", borderRadius: "50%",
                  width: 20, height: 20, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 11, fontWeight: 900,
                }}>{totalItems}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", fontSize: 13, color: "#666" }}>
        <span style={{ cursor: "pointer", color: "#013F79" }} onClick={() => navigate("/")}>🏠 Início</span>
        <span style={{ margin: "0 8px" }}>›</span>
        <span style={{ fontWeight: 800, color: "#222" }}>{label}</span>
      </div>

      {/* ── Banner Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #013F79 0%, #12733A 100%)",
        padding: "36px 40px", marginBottom: 0,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h1 style={{
              margin: "0 0 10px", color: "#fff",
              fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900,
              fontFamily: "'Nunito', sans-serif", lineHeight: 1.1,
            }}>
              {catInfo?.icon} {label}
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 15,
              fontFamily: "'Nunito', sans-serif", maxWidth: 480 }}>
              Os melhores {label.toLowerCase()} para toda a família — entrega rápida e preços incríveis.
            </p>
          </div>
        </div>
      </div>

      <div className="vit-layout" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 40px", display: "flex", gap: 24 }}>

        {/* ── Coluna Filtros ── */}
        <aside className="vit-aside" style={{
          width: 260, flexShrink: 0,
          background: "#fff", borderRadius: 16, padding: 24,
          border: "1px solid #e8e8e8",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          alignSelf: "flex-start", position: "sticky", top: 88,
        }}>
          <h3 style={{ fontWeight: 900, fontSize: 16, color: "#222", margin: "0 0 20px" }}>Filtrar por...</h3>

          {/* Ordenação rápida */}
          <div style={{ marginBottom: 24 }}>
            {[
              { val: "relevancia", label: " Mais Relevantes" },
              { val: "menor",      label: " Menor Preço" },
              { val: "maior",      label: " Maior Preço" },
              { val: "estrelas",   label: " Mais Avaliados" },
            ].map(op => (
              <button key={op.val} onClick={() => setOrdem(op.val)}
                className="filtro-check"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "10px 14px", marginBottom: 8,
                  borderRadius: 10, border: "2px solid",
                  borderColor: ordem === op.val ? "#12733A" : "#e8e8e8",
                  background: ordem === op.val ? "#f0faf4" : "#fafafa",
                  color: ordem === op.val ? "#12733A" : "#444",
                  fontFamily: "'Nunito', sans-serif", fontWeight: 800,
                  fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                }}>{op.label}</button>
            ))}
          </div>

          {/* Faixa de preço */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontWeight: 900, fontSize: 14, color: "#222", margin: "0 0 12px" }}>Faixa de Preço</h4>
            <input type="range" min={0} max={precoMaxGeral} value={precoMax}
              onChange={e => setPrecoMax(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#12733A" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginTop: 4 }}>
              <span>R$ 0</span>
              <span style={{ fontWeight: 800, color: "#12733A" }}>até R$ {precoMax.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          {/* Somente ofertas */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#444" }}>
            <input type="checkbox" checked={somenteOfertas} onChange={e => setSomenteOfertas(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "#12733A" }} />
            🏷️ Somente Ofertas
          </label>
        </aside>

        {/* ── Coluna Produtos ── */}
        <main style={{ flex: 1 }}>
          {/* Cabeçalho da listagem */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: 22, color: "#013F79", margin: 0 }}>
                {catInfo?.icon} {label}
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
                {produtos.length} produto{produtos.length !== 1 ? "s" : ""} encontrado{produtos.length !== 1 ? "s" : ""}
              </p>
            </div>
            <select value={ordem} onChange={e => setOrdem(e.target.value)}
              style={{
                padding: "9px 14px", borderRadius: 10, border: "2px solid #e8e8e8",
                fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13,
                color: "#444", background: "#fff", cursor: "pointer",
              }}>
              <option value="relevancia">Ordenar: Relevância</option>
              <option value="menor">Menor Preço</option>
              <option value="maior">Maior Preço</option>
              <option value="estrelas">Mais Avaliados</option>
            </select>
          </div>

          {/* Grid de produtos */}
          {produtos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
              <p style={{ fontSize: 48, margin: "0 0 16px" }}>🔍</p>
              <p style={{ fontWeight: 800, fontSize: 18, color: "#888" }}>Nenhum produto encontrado</p>
              <p style={{ fontSize: 14 }}>Tente ajustar os filtros</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 18,
            }}>
              {produtos.map(p => (
                <div key={p.id} className="card-produto" style={{
                  background: "#fff", borderRadius: 16,
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  overflow: "hidden", cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  display: "flex", flexDirection: "column",
                }}>
                  {/* Imagem */}
                  <div style={{ position: "relative" }} onClick={() => navigate(`/produto/${p.id}`)}>
                    {p.badge && (
                      <span style={{
                        position: "absolute", top: 10, left: 10, zIndex: 1,
                        background: p.badge_cor, color: "#fff",
                        fontSize: 10, fontWeight: 900, padding: "3px 8px",
                        borderRadius: 6, letterSpacing: 0.5,
                      }}>{p.badge}</span>
                    )}
                    <img src={p.imagem_url ? (p.imagem_url.startsWith("/uploads") ? `${API_URL}${p.imagem_url}` : p.imagem_url) : "https://placehold.co/300x280/eee/999?text=Produto"} alt={p.nome}
                      style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px 14px 16px", flex: 1, display: "flex", flexDirection: "column" }}
                    onClick={() => navigate(`/produto/${p.id}`)}>
                    <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 800, color: "#222",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {p.nome}
                    </p>
                    <Estrelas n={p.estrelas} />
                    <span style={{ fontSize: 11, color: "#aaa", margin: "2px 0 8px" }}>({p.avaliacoes})</span>

                    {p.preco_antigo && (
                      <span style={{ fontSize: 11, color: "#aaa", textDecoration: "line-through" }}>{p.preco_antigo}</span>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: "#013F79" }}>{p.preco_fmt || (typeof p.preco === "number" ? "R$ " + p.preco.toFixed(2).replace(".", ",") : p.preco)}</span>
                      {p.desconto && (
                        <span style={{ background: "#c62828", color: "#fff", fontSize: 10,
                          fontWeight: 900, padding: "2px 6px", borderRadius: 5 }}>
                          {p.desconto}% OFF
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: "#12733A", fontWeight: 700, marginBottom: "auto" }}>
                      {p.parcelas}
                    </span>
                  </div>

                  {/* Botão */}
                  <div style={{ padding: "0 14px 14px" }}>
                    <button className="btn-adicionar"
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}
                      style={{
                        width: "100%", padding: "11px 0",
                        background: "#12733A", color: "#fff",
                        border: "none", borderRadius: 10,
                        fontFamily: "'Nunito', sans-serif", fontWeight: 900,
                        fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "filter 0.15s",
                      }}>
                      🛒 Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}