import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Logo from "../assets/Logo.png";
import LegoLogo from "../assets/lego.png";
import PokemonLogo from "../assets/pokemon.png";
import HotWheelsLogo from "../assets/hotwheels.png";
import TransformersLogo from "../assets/transformers.png";
import BarbieLogo from "../assets/barbie.png";
import DisneyLogo from "../assets/disney.png";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";

import { MOCK_PRODUTOS } from "../data/mockProdutos";

const CATEGORIES_TABS = ["Educativos", "Pelucias", "Bonecas", "Carrinhos", "Jogos", "Quebra-Cabecas", "Esportes", "Ao-Ar-Livre", "Baby", "Geek"];
const NAV_LINKS = [
  { label: "Lançamentos",          slug: "Lançamentos" },
  { label: "Ofertas",              slug: "ofertas"   },
  { label: "Brinquedos Nacionais", slug: "nacionais"    },
  { label: "Área para Garotos",    slug: "garotos"    },
  { label: "Área para Garotas",    slug: "garotas"     },
];

const PROMOTIONS = [
  { label: "Novidades",   bg: "#4CAF50", icon: "🌟", slug: "Lançamentos" },
  { label: "Liquida",     bg: "#FF9800", icon: "🔥", slug: "ofertas" },
  { label: "Até 80% OFF", bg: "#F44336", icon: "🏷️", slug: "Ate-80%-OFF" },
  { label: "Livros",      bg: "#9C27B0", icon: "📚", slug: "Livros" },
  { label: "Jogos",       bg: "#FF5722", icon: "🎮", slug: "jogos1" },
  { label: "Coleções",    bg: "#607D8B", icon: "🗂️", slug: "geek" },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const FALLBACK = "https://placehold.co/180x160/eee/999?text=Produto";

// ── HELPERS ───────────────────────────────────────────────────────────────────
function Stars({ count }) {
  return (
    <span style={{ color: "#FFDF26", fontSize: 14, letterSpacing: 1 }}>
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </span>
  );
}

function arrowBtn(disabled) {
  return {
    background: disabled ? "#e8e8e8" : "#FFDF26",
    color: disabled ? "#aaa" : "#013F79",
    border: "none", borderRadius: "50%", width: 38, height: 38,
    fontSize: 24, fontWeight: 900, cursor: disabled ? "default" : "pointer",
    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s",
  };
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ msg }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "#12733A", color: "#fff", borderRadius: 12,
      padding: "14px 22px", fontWeight: 800, fontSize: 14,
      boxShadow: "0 6px 24px rgba(0,0,0,0.25)", animation: "fadeIn 0.25s",
    }}>
      {msg}
    </div>
  );
}

// ── CART DRAWER ───────────────────────────────────────────────────────────────
function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQty, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const fmtPrice = (n) => "R$ " + n.toFixed(2).replace(".", ",");

  if (!cartOpen) return null;

  return (
    <div onClick={() => setCartOpen(false)} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000,
      display: "flex", justifyContent: "flex-end",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", width: 380, maxWidth: "100vw", height: "100vh",
        overflowY: "auto", padding: 22, boxSizing: "border-box",
        boxShadow: "-6px 0 32px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column",
        fontFamily: "'Nunito', sans-serif",
      }}>
        {/* Cabeçalho */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#013F79" }}>🛒 Carrinho</h2>
          <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#555" }}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#bbb" }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>🛒</div>
            <p style={{ fontWeight: 700, fontSize: 16 }}>Carrinho vazio</p>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {cart.map((item) => {
                const nome = item.nome || item.name;
                const imgUrl = item.imagem_url || item.img || null;
                const img = imgUrl
                  ? (imgUrl.startsWith("/uploads") ? `${API_URL}${imgUrl}` : imgUrl)
                  : FALLBACK;
                const rawVal = item.preco || item.price || 0;
                const price = typeof rawVal === "number" ? rawVal
                  : (() => {
                      let s = String(rawVal).replace("R$","").replace(/\s/g,"");
                      if (/\d+\.\d{3},\d/.test(s)) s = s.replace(/\./g,"").replace(",",".");
                      else if (s.includes(",")) s = s.replace(",",".");
                      return parseFloat(s) || 0;
                    })();

                return (
                  <div key={item.id} style={{
                    display: "flex", gap: 12, alignItems: "center",
                    marginBottom: 14, borderBottom: "1px solid #f0f0f0", paddingBottom: 14,
                  }}>
                    <img src={img} alt={nome} onError={(e) => (e.target.src = FALLBACK)}
                      style={{ width: 58, height: 58, objectFit: "contain", borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#222", lineHeight: 1.3 }}>{nome}</p>
                      <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 900, color: "#12733A" }}>{fmtPrice(price * item.qty)}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid #013F79", background: "#fff", color: "#013F79", fontWeight: 900, fontSize: 16, cursor: "pointer" }}>−</button>
                        <span style={{ fontWeight: 800, fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: "#013F79", color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer" }}>+</button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", fontSize: 20, color: "#c00", cursor: "pointer" }}>🗑</button>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: "2px solid #eee", paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 18, color: "#013F79", marginBottom: 14 }}>
                <span>Total</span>
                <span>{fmtPrice(totalPrice)}</span>
              </div>
              <button onClick={() => { setCartOpen(false); navigate("/carrinho"); }}
                style={{ background: "#12733A", color: "#fff", border: "none", borderRadius: 10, padding: "13px 0", fontWeight: 900, fontSize: 15, width: "100%", marginBottom: 8, cursor: "pointer" }}>
                Ver Carrinho Completo →
              </button>
              <button onClick={() => { setCartOpen(false); navigate("/finalizar"); }}
                style={{ background: "#FFDF26", color: "#013F79", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 900, fontSize: 14, width: "100%", marginBottom: 8, cursor: "pointer" }}>
                ✔ Finalizar Compra
              </button>
              <button onClick={clearCart} style={{ background: "none", color: "#c00", border: "1px solid #c00", borderRadius: 8, padding: "8px 0", fontWeight: 700, fontSize: 12, width: "100%", cursor: "pointer" }}>
                Limpar Carrinho
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
function ProductCard({ item, badge }) {
  const [hover, setHover] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const nome = item.nome || item.name;
  const precoRaw = item.preco || item.price || 0;
  const preco = item.preco_fmt
    ? item.preco_fmt
    : typeof precoRaw === "number"
      ? "R$ " + precoRaw.toFixed(2).replace(".", ",")
      : precoRaw;
  const estrelas = item.estrelas ?? item.stars ?? 4;
  const imgRaw = item.imagem_url || item.img || null;
  const imagem = imgRaw
    ? (imgRaw.startsWith("/uploads") ? `${API_URL}${imgRaw}` : imgRaw)
    : null;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff", borderRadius: 16,
        border: `2px solid ${hover ? "#FFDF26" : "#e8e8e8"}`,
        padding: "14px 12px 12px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        minWidth: 170, maxWidth: 185,
        boxShadow: hover ? "0 8px 24px rgba(18,115,58,0.18)" : "0 2px 8px rgba(0,0,0,0.06)",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        transform: hover ? "translateY(-4px)" : "none",
        position: "relative", cursor: "pointer", flex: "0 0 auto",
      }}
    >
      {badge && (
        <span style={{
          position: "absolute", top: 10, left: 10,
          background: "#FFDF26", color: "#013F79",
          fontSize: 10, fontWeight: 800, padding: "2px 8px",
          borderRadius: 20, letterSpacing: 0.5,
        }}>{badge}</span>
      )}
      <img src={imagem || FALLBACK} alt={nome}
        onError={(e) => (e.target.src = FALLBACK)}
        style={{ width: 155, height: 135, objectFit: "contain", borderRadius: 8 }} />
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#222", textAlign: "center", lineHeight: 1.3, minHeight: 36 }}>{nome}</p>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#12733A" }}>{preco}</p>
      <Stars count={estrelas} />
      <div style={{ display: "flex", gap: 6, marginTop: 4, width: "100%" }}>
        <button
          onClick={() => navigate("/finalizar", { state: { product: item } })}
          style={{
            flex: 1, background: "#FFDF26", color: "#013F79",
            border: "none", borderRadius: 8, padding: "8px 0",
            fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 0.5,
          }}>COMPRAR</button>
        <button
          onClick={(e) => { e.stopPropagation(); addToCart(item); }}
          style={{
            background: "#013F79", color: "#fff",
            border: "none", borderRadius: 8, padding: "8px 10px",
            fontSize: 16, cursor: "pointer",
          }}>🛒</button>
      </div>
    </div>
  );
}

// ── CAROUSEL ──────────────────────────────────────────────────────────────────
function Carousel() {
  const [items, setItems] = useState(MOCK_PRODUTOS.slice(0, 5));
  const [index, setIndex] = useState(0);
  const VISIBLE = 4;
  const max = Math.max(0, items.length - VISIBLE);

  useEffect(() => {
    fetch(`${API_URL}/api/produtos/destaque`)
      .then(res => res.json())
      .then(data => { if (data.length > 0) setItems(data); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i >= max ? 0 : i + 1)), 3500);
    return () => clearInterval(t);
  }, [max]);

  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 20 }}>✨</span>
        <h2 style={{
          margin: 0, background: "#013F79", color: "#FFDF26",
          padding: "6px 32px", borderRadius: 30,
          fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: 2,
        }}>DESTAQUE</h2>
        <span style={{ fontSize: 20 }}>✨</span>
      </div>

      <div style={{
        background: "#fff", borderRadius: 20, border: "2px solid #e8e8e8",
        padding: "22px 16px", display: "flex", alignItems: "center", gap: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
      }}>
        <button onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0} style={arrowBtn(index === 0)}>‹</button>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div style={{
            display: "flex", gap: 14,
            transform: `translateX(calc(-${index} * (185px + 14px)))`,
            transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
          }}>
            {items.map(item => <ProductCard key={item.id} item={item} />)}
          </div>
        </div>
        <button onClick={() => setIndex(i => Math.min(max, i + 1))} disabled={index >= max} style={arrowBtn(index >= max)}>›</button>
      </div>
    </section>
  );
}
// ── BRANDS ────────────────────────────────────────────────────────────────────
function BrandsSection() {
  const navigate = useNavigate();
  const brandLogos = [
    { name: "LEGO",         src: LegoLogo,        slug: "geek", border: "#d0d0d0" },
    { name: "Hot Wheels",   src: HotWheelsLogo,    slug: "carrinhos",  border: "#CC0000" },
    { name: "Transformers", src: TransformersLogo, slug: "bonecas",  border: "#444"    },
    { name: "Barbie",       src: BarbieLogo,       slug: "bonecas",    border: "#E91E8C" },
    { name: "Disney",       src: DisneyLogo,       slug: "geek",    border: "#003087" },
  ];

  return (
    <section style={{ marginBottom: 32 }}>
      <h3 style={{
        margin: "0 0 20px", fontSize: 18, fontWeight: 900,
        color: "#12733A", fontFamily: "'Nunito', sans-serif",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ display: "inline-block", width: 6, height: 22, background: "#4CAF50", borderRadius: 4 }}></span>
        Marcas Favoritas
      </h3>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {brandLogos.map(brand => (
          <div
            key={brand.name}
            onClick={() => navigate(`/vitrine/${brand.slug}`)}
            style={{
              border: `2px solid ${brand.border}`,
              borderRadius: 16,
              width: 160,
              height: 90,
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              position: "relative",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
            }}
          >
            <img
              src={brand.src}
              alt={brand.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── PROMOTIONS ────────────────────────────────────────────────────────────────
function PromotionsRow() {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36, justifyContent: "center" }}>
      {PROMOTIONS.map(p => (
        <div key={p.label}
          onClick={() => navigate(`/vitrine/${p.slug}`)}
          style={{
            background: p.bg, color: "#fff", borderRadius: "50%",
            width: 80, height: 80, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", fontWeight: 800,
            fontSize: 11, cursor: "pointer", boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
            transition: "transform 0.15s", textAlign: "center", gap: 2,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={{ fontSize: 22 }}>{p.icon}</span>
          <span>{p.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── CATEGORY TABS + PRODUCTS ──────────────────────────────────────────────────
function CategorySection() {
  const [active, setActive] = useState("Novidades");
  const [produtos, setProdutos] = useState(MOCK_PRODUTOS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/produtos?categoria=${active}`)
      .then(res => res.json())
      .then(data => { if (data.length > 0) setProdutos(data); else setProdutos(MOCK_PRODUTOS); setLoading(false); })
      .catch(() => { setProdutos(MOCK_PRODUTOS); setLoading(false); });
  }, [active]);

  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap", justifyContent: "center" }}>
        {CATEGORIES_TABS.map(tab => (
          <button key={tab} onClick={() => setActive(tab)} style={{
            padding: "9px 22px", borderRadius: 30,
            border: active === tab ? "2px solid #013F79" : "2px solid #d0d0d0",
            background: active === tab ? "#013F79" : "#fff",
            color: active === tab ? "#FFDF26" : "#444",
            fontWeight: 800, fontSize: 14, cursor: "pointer",
            fontFamily: "'Nunito', sans-serif", transition: "all 0.18s",
          }}>{tab}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#12733A", fontWeight: 700 }}>Carregando produtos...</div>
      ) : (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          {produtos.map(item => (
            <ProductCard key={item.id} item={item} badge={active.toUpperCase()} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: "Conheça-nos", links: ["Sobre a HarpyToys", "Informações corporativas", "Comunidade", "Acessibilidade"] },
    { title: "Trabalhe Conosco", links: ["Venda na HarpyToys", "Associe-se ao Grupo", "Anuncie Seus Produtos"] },
    { title: "Pagamento", links: ["Meios de Pagamento", "Cupons de Desconto", "Vale Presente"] },
    { title: "Deixe-nos ajudar", links: ["Sua Conta", "Frete e Prazo de entrega", "Devolução e Reembolso", "Segurança", "Fale Conosco", "Ajuda"] },
  ];

  return (
    <footer style={{ background: "#12733A", color: "#fff", fontFamily: "'Nunito', sans-serif" }}>
      <div style={{
        textAlign: "center", padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.2)",
        cursor: "pointer", fontSize: 14, fontWeight: 700,
      }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        Voltar ao Início ↑
      </div>

      {/* Logo centralizada */}
      <div style={{ display: "flex", justifyContent: "center", padding: "28px 24px 0" }}>
        <div style={{
          background: "#FFDF26", borderRadius: 16, padding: "12px 20px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <img src={Logo} alt="HarpyToys" style={{ width: 44, height: 44, objectFit: "contain" }} />
          <span style={{ fontWeight: 900, fontSize: 22, color: "#12733A" }}>
            Harpy<span style={{ color: "#013F79" }}>Toys</span>
          </span>
        </div>
      </div>

      {/* Colunas de links */}
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "28px 24px 32px",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24,
      }}>
        {cols.map(col => (
          <div key={col.title}>
            <p style={{ margin: "0 0 10px", fontWeight: 900, fontSize: 14, color: "#FFDF26" }}>{col.title}</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {col.links.map(l => (
                <li key={l}>
                  <a href="#" style={{ color: "#e0f2e9", fontSize: 13, textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => e.target.style.color = "#FFDF26"}
                    onMouseLeave={e => e.target.style.color = "#e0f2e9"}
                  >{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ background: "#013F79", textAlign: "center", padding: "12px 24px", fontSize: 12, color: "#cdd8e8" }}>
        <div style={{ marginBottom: 4 }}>
          <a href="#" style={{ color: "#FFDF26", marginRight: 16, fontSize: 11 }}>REGRAS DE PRIVACIDADE</a>
          <a href="#" style={{ color: "#FFDF26", marginRight: 16, fontSize: 11 }}>TERMOS DE USO</a>
          <a href="#" style={{ color: "#FFDF26", fontSize: 11 }}>PROTEÇÃO DE DADOS</a>
        </div>
        R. Guaipá, 678 - Vila Leopoldina, São Paulo - SP, 05089-000 | © 2025 HarpyToys. Todos os direitos reservados.
      </div>
    </footer>
  );
}

// ── MAIN HOME ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem("usuario")); } catch { return null; }
  });
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY]     = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [cepModal, setCepModal]     = useState(false);
  const [cepInput, setCepInput]     = useState("");
  const [cepSalvo, setCepSalvo]     = useState(() => localStorage.getItem("cep_usuario") || "");
  const [cepErro, setCepErro]       = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  // Scroll hide/show header
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80) { setHeaderVisible(true); }
      else if (y < lastScrollY) { setHeaderVisible(true); }
      else { setHeaderVisible(false); }
      setLastScrollY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  // Pesquisa ao vivo
  const handleSearch = (val) => {
    setSearchVal(val);
    if (!val.trim()) { setSearchResults([]); setSearchOpen(false); return; }
    const termo = val.toLowerCase();
    const found = MOCK_PRODUTOS.filter(p =>
      (p.nome || p.name || "").toLowerCase().includes(termo)
    ).sort((a, b) => (a.nome || a.name || "").localeCompare(b.nome || b.name || ""));
    setSearchResults(found);
    setSearchOpen(true);
  };

  const salvarCep = async () => {
    const digits = cepInput.replace(/\D/g, "");
    if (digits.length !== 8) { setCepErro("Digite um CEP com 8 números."); return; }
    setCepErro("");
    setCepLoading(true);
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) { setCepErro("CEP não encontrado. Verifique e tente novamente."); setCepLoading(false); return; }
      const fmt = digits.slice(0,5) + "-" + digits.slice(5);
      localStorage.setItem("cep_usuario", fmt);
      localStorage.setItem("cep_cidade", `${data.localidade}/${data.uf}`);
      setCepSalvo(fmt);
      setCepModal(false);
      setCepInput("");
    } catch {
      setCepErro("Erro ao verificar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };
  const { totalItems, setCartOpen, cartOpen, toast } = useCart();
  const navigate = useNavigate();

  // Atualiza o usuário quando logar/deslogar
  useEffect(() => {
    const sync = () => {
      try { setUsuario(JSON.parse(localStorage.getItem("usuario"))); } catch { setUsuario(null); }
    };
    window.addEventListener("usuarioLogado", sync);
    window.addEventListener("usuarioDeslogado", sync);
    return () => {
      window.removeEventListener("usuarioLogado", sync);
      window.removeEventListener("usuarioDeslogado", sync);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    setUsuario(null);
    window.dispatchEvent(new Event("usuarioDeslogado"));
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", margin: 0, padding: 0, background: "#f5f5f5", minWidth: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #12733A; border-radius: 4px; }
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ════════════ HEADER ════════════ */}
      <header className="ht-header-fixed" style={{ position: "fixed", top: headerVisible ? 0 : "-160px", left: 0, right: 0, zIndex: 500, transition: "top 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
        {/* Barra amarela */}
        <div className="ht-header-bar" style={{
          background: "#FFDF26",
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 88, gap: 20, width: "100%",
        }}>
          {/* Logo */}
          <div style={{ fontWeight: 900, fontSize: 22, color: "#12733A", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src={Logo} alt="HarpyToys" style={{
              width: 130, height: 90
              , objectFit: "contain"
            }} />
          </div>

          {/* Endereço */}
          <div className="ht-cep-wrap" onClick={() => setCepModal(true)} style={{
            fontSize: 12, color: "#013F79", fontWeight: 700, whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 4, cursor: "pointer",
          }}>
            <span>📍</span>
            <span>Entrega em: <strong>{cepSalvo || "Seu CEP"}</strong></span>
          </div>

          {/* Busca — centralizada */}
          <div className="ht-search-wrap" style={{ flex: 1, maxWidth: 480, display: "flex", position: "relative" }}>
            <div style={{ display: "flex", width: "100%", position: "relative" }}>
              <input
                type="text"
                placeholder="🔍  Encontre o seu Brinquedo"
                value={searchVal}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => searchVal && setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
                style={{
                  width: "100%", padding: "11px 18px", borderRadius: "30px 0 0 30px",
                  border: "2px solid #fff", borderRight: "none", fontSize: 14, outline: "none",
                  fontFamily: "'Nunito', sans-serif", background: "#fff", color: "#333",
                }}
              />
              <button style={{
                background: "#013F79", color: "#fff", border: "none",
                borderRadius: "0 30px 30px 0", padding: "0 18px",
                fontWeight: 800, fontSize: 14, cursor: "pointer",
              }}>🔍</button>

              {/* Dropdown de resultados */}
              {searchOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                  background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  zIndex: 600, maxHeight: 340, overflowY: "auto",
                  border: "2px solid #FFDF26",
                }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: "20px 18px", textAlign: "center", color: "#aaa", fontWeight: 700, fontSize: 14 }}>
                      😕 Item não encontrado
                    </div>
                  ) : (
                    searchResults.map(item => (
                      <div key={item.id}
                        onMouseDown={() => { navigate(`/produto/${item.id}`); setSearchOpen(false); setSearchVal(""); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 16px", cursor: "pointer",
                          borderBottom: "1px solid #f5f5f5", transition: "background 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f0faf4"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                      >
                        <img src={item.imagem_url || FALLBACK} alt={item.nome}
                          onError={e => e.target.src = FALLBACK}
                          style={{ width: 42, height: 42, objectFit: "contain", borderRadius: 8, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.nome}</p>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#12733A" }}>{item.preco}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Redes sociais */}
          <div className="ht-social-wrap" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer"
              style={{ transition: "transform 0.15s", display: "flex" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <img src={Instagram} alt="Instagram" style={{ width: 28, height: 28, objectFit: "contain" }} />
            </a>
            <a href="https://www.whatsapp.com" target="_blank" rel="noreferrer"
              style={{ transition: "transform 0.15s", display: "flex" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <img src={Whatsapp} alt="WhatsApp" style={{ width: 28, height: 28, objectFit: "contain" }} />
            </a>
          </div>

          {/* Usuário */}
          {usuario ? (
            <div className="ht-user-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}
              onClick={() => navigate("/perfil")} title="Minha Conta">
              <div style={{
                width: 40, height: 40, background: "#12733A", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, color: "#FFDF26", border: "2px solid #013F79",
              }}>👤</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#013F79", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Olá, {usuario.nome?.split(" ")[0] || "Você"}
              </span>
            </div>
          ) : (
            <a href="/login" className="ht-user-wrap" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
                <div style={{
                  width: 40, height: 40, background: "#013F79", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, color: "#FFDF26",
                }}>👤</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#013F79" }}>Olá, Usuário</span>
              </div>
            </a>
          )}

          {/* Botão Carrinho */}
          <button className="ht-cart-btn" onClick={() => setCartOpen(true)} style={{
            background: "#013F79", color: "#FFDF26", border: "none",
            borderRadius: 30, padding: "9px 18px",
            fontWeight: 900, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            position: "relative", transition: "transform 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            🛒
            {totalItems > 0 && (
              <span style={{
                background: "#E91E63", color: "#fff", borderRadius: "50%",
                width: 20, height: 20, display: "inline-flex", alignItems: "center",
                justifyContent: "center", fontSize: 11, fontWeight: 900,
              }}>{totalItems}</span>
            )}
            Carrinho
          </button>
        </div>

        {/* Barra verde nav */}
        <nav className="ht-nav-bar" style={{
          background: "#12733A", padding: "6px 32px",
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 52, gap: 0,
        }}>
          <div className="ht-nav-inner" style={{ maxWidth: 1200, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button onClick={() => setMenuOpen(true)} style={{
              background: "none",
              border: "none", color: "#fff", fontSize: 15, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'Nunito', sans-serif", fontWeight: 800, padding: "0 18px 0 0",
              borderRight: "1px solid rgba(255,255,255,0.3)", marginRight: 18, height: 44,
            }}>☰ Categorias</button>

            {NAV_LINKS.map(({ label, slug }) => (
              <a key={label} href="#"
                onClick={e => { e.preventDefault(); navigate(`/vitrine/${slug}`); }}
                style={{
                  color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700,
                  padding: "0 16px", height: 44, display: "flex", alignItems: "center",
                  transition: "background 0.15s", borderRadius: 4,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >{label}</a>
            ))}
          </div>
        </nav>

      </header>

      {/* ── Modal CEP ── */}
      {cepModal && (
        <>
          <div onClick={() => setCepModal(false)} style={{
            position: "fixed", inset: 0, zIndex: 998,
            background: "rgba(0,0,0,0.45)",
          }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 999, background: "#fff",
            borderRadius: 20, padding: "36px 32px",
            width: "min(420px, 92vw)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
            border: "3px solid #F8C131",
            fontFamily: "'Nunito', sans-serif",
          }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 900, color: "#013F79" }}>
              📍 Informe seu CEP
            </h2>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: "#666", fontWeight: 700 }}>
              Vamos salvar para usar automaticamente na finalização da compra.
            </p>
            <input
              type="text"
              placeholder="00000-000"
              value={cepInput}
              maxLength={9}
              onChange={e => {
                let v = e.target.value.replace(/\D/g, "").slice(0, 8);
                if (v.length > 5) v = v.slice(0,5) + "-" + v.slice(5);
                setCepInput(v);
              }}
              onKeyDown={e => e.key === "Enter" && salvarCep()}
              style={{
                width: "100%", padding: "14px 18px",
                border: `2px solid ${cepErro ? "#c62828" : "#e8e8e8"}`, borderRadius: 12,
                fontSize: 18, fontFamily: "'Nunito', sans-serif",
                fontWeight: 800, textAlign: "center", letterSpacing: 2,
                marginBottom: cepErro ? 8 : 22, outline: "none",
                transition: "border-color 0.2s",
              }}
              autoFocus
              onFocus={e => e.target.style.borderColor = "#013F79"}
              onBlur={e => { if (!cepErro) e.target.style.borderColor = "#e8e8e8"; }}
            />
            {cepErro && (
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "#c62828",
                fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
                ⚠️ {cepErro}
              </p>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setCepModal(false)} style={{
                flex: 1, padding: "13px 0",
                background: "#fff", color: "#444",
                border: "2px solid #e8e8e8", borderRadius: 12,
                fontFamily: "'Nunito', sans-serif", fontWeight: 800,
                fontSize: 15, cursor: "pointer",
              }}>Cancelar</button>
              <button onClick={salvarCep} disabled={cepLoading} style={{
                flex: 2, padding: "13px 0",
                background: cepLoading ? "#aaa" : "#12733A", color: "#fff",
                border: "none", borderRadius: 12,
                fontFamily: "'Nunito', sans-serif", fontWeight: 900,
                fontSize: 15, cursor: cepLoading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(18,115,58,0.3)",
              }}>{cepLoading ? "Verificando..." : "Salvar CEP"}</button>
            </div>
          </div>
        </>
      )}

      {/* ── Overlay escuro ── */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 998,
          background: "rgba(0,0,0,0.55)",
          animation: "fadeInOverlay 0.22s ease",
        }} />
      )}

      {/* ── Sidebar de Categorias ── */}
      <div className="ht-side-menu" style={{
        position: "fixed", top: 0, left: 0, zIndex: 999,
        width: 300, height: "100vh",
        background: "#fff",
        boxShadow: "4px 0 32px rgba(0,0,0,0.22)",
        transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Cabeçalho */}
        <div style={{
          background: "#12733A", padding: "18px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <span style={{
            color: "#fff", fontWeight: 900, fontSize: 17,
            fontFamily: "'Nunito', sans-serif", letterSpacing: 1
          }}>
            ☰ DEPARTAMENTOS
          </span>
          <button onClick={() => setMenuOpen(false)} style={{
            background: "none", border: "none", color: "#fff",
            fontSize: 22, cursor: "pointer", lineHeight: 1,
            fontFamily: "'Nunito', sans-serif",
          }}>✕</button>
        </div>

        {/* Lista */}
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {[
            { label: "Brinquedos Educativos", slug: "educativos" },
            { label: "Pelúcias", slug: "pelucias" },
            { label: "Bonecas e Bonecos", slug: "bonecas" },
            { label: "Carrinhos", slug: "carrinhos" },
            { label: "Jogos de Tabuleiro", slug: "jogos" },
            { label: "Jogos", slug: "jogos1" },
            { label: "Quebra-Cabeças", slug: "Quebra-Cabeças" },
            { label: "Esportes", slug: "esportes" },
            { label: "Ao Ar Livre", slug: "ao-ar-livre" },
            { label: "Baby", slug: "baby" },
            { label: "Geek e Colecionáveis", slug: "geek" },
          ].map(({ icon, label, slug }) => (
            <a key={label} href="#"
              onClick={() => { setMenuOpen(false); navigate(`/vitrine/${slug}`); }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "13px 24px", color: "#222", textDecoration: "none",
                fontWeight: 700, fontSize: 14,
                fontFamily: "'Nunito', sans-serif",
                borderBottom: "1px solid #f2f2f2",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f0faf4"; e.currentTarget.style.color = "#12733A"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#222"; }}
            >
              <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              <span style={{ color: "#aaa", fontSize: 14 }}>›</span>
            </a>
          ))}
        </nav>

        {/* Rodapé */}
        <div style={{ padding: "16px 24px", borderTop: "2px solid #f0f0f0", background: "#fafafa", flexShrink: 0 }}>
          <p style={{
            margin: 0, fontSize: 12, color: "#888",
            fontFamily: "'Nunito', sans-serif", textAlign: "center"
          }}>
            HarpyToys — Sua diversão começa aqui!
          </p>
        </div>
      </div>

      {/* ════════════ BODY ════════════ */}
      <main className="ht-main-fixed" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", paddingTop: 160 }}>
        <Carousel />
        <BrandsSection />
        <PromotionsRow />

        <div style={{ textAlign: "center", marginBottom: 36, padding: "0 32px" }}>
          <h2 style={{ fontWeight: 900, color: "#013F79", fontSize: 20, margin: "0 0 12px" }}>
            HarpyToys, Sua Imaginação abrirá asas para voar
          </h2>
          <p style={{ color: "#444", lineHeight: 1.7, fontSize: 14, margin: "0 0 16px" }}>
            Venha se aventurar nesse mundo com os brinquedos da Harpy Toys! Aqui você encontra diversão para todos os momentos — seja sozinho ou em companhia. Sinta-se à vontade, explore e aproveite cada instante com alegria! ❤️
          </p>
          <h3 style={{ fontWeight: 900, color: "#12733A", fontSize: 17, margin: "0 0 8px" }}>Todo Nesse Lugar 😊</h3>
          <p style={{ color: "#444", lineHeight: 1.7, fontSize: 14, margin: 0 }}>
            Na Harpy Toys, comprar é simples, rápido e tudo é pensado para você encontrar o que precisa sem complicação.
          </p>
        </div>

        <CategorySection />
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Toast notification */}
      {toast && <Toast msg={toast} />}
    </div>
  );
}