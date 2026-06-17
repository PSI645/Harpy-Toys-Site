// frontend/src/pages/Perfil.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Logo from "../assets/Logo.png";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";

const NAV_LINKS = ["Lançamentos", "Ofertas", "Brinquedos Nacionais", "Área para Garotos", "Área para Garotas"];

export default function Perfil() {
  const navigate = useNavigate();
  const { totalItems, setCartOpen } = useCart();

  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem("usuario")); } catch { return null; }
  });
  const [menuOpen, setMenuOpen]     = useState(false);
  const [cepModal, setCepModal]     = useState(false);
  const [cepInput, setCepInput]     = useState("");
  const [cepSalvo, setCepSalvo]     = useState(() => localStorage.getItem("cep_usuario") || "");
  const [cepErro, setCepErro]       = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (!usuario) navigate("/login");
  }, [usuario, navigate]);

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
      setCepSalvo(fmt);
      setCepModal(false);
      setCepInput("");
    } catch {
      setCepErro("Erro ao verificar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("usuarioDeslogado"));
    navigate("/");
  };

  if (!usuario) return null;

  const iniciais = usuario.nome
    ?.split(" ").slice(0, 2).map(p => p[0]?.toUpperCase()).join("") || "U";

  const opcoes = [
    {
      id: "conta", rota: "/perfil/conta",
      titulo: "Informações da Conta",
      descricao: "Altere nome, email, senha, telefone e CEP",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="#013F79" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      id: "pedidos", rota: "/perfil/pedidos",
      titulo: "Meus Pedidos",
      descricao: "Acompanhe e veja o histórico dos seus pedidos",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="#013F79" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      ),
    },
    {
      id: "cartoes", rota: "/perfil/cartoes",
      titulo: "Cartões",
      descricao: "Gerencie seus cartões e formas de pagamento",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="#013F79" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .opcao-card { transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; }
        .opcao-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.12) !important; border-color: #013F79 !important; }
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* ── Modal CEP ── */}
      {cepModal && (
        <>
          <div onClick={() => setCepModal(false)} style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.45)" }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            zIndex: 999, background: "#fff", borderRadius: 20, padding: "36px 32px",
            width: "min(420px, 92vw)", boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
            border: "3px solid #F8C131", fontFamily: "'Nunito', sans-serif",
          }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 900, color: "#013F79" }}>📍 Informe seu CEP</h2>
            <p style={{ margin: "0 0 22px", fontSize: 14, color: "#666", fontWeight: 700 }}>Vamos salvar para usar automaticamente na finalização da compra.</p>
            <input type="text" placeholder="00000-000" value={cepInput} maxLength={9}
              onChange={e => { let v = e.target.value.replace(/\D/g, "").slice(0, 8); if (v.length > 5) v = v.slice(0,5) + "-" + v.slice(5); setCepInput(v); }}
              onKeyDown={e => e.key === "Enter" && salvarCep()}
              style={{ width: "100%", padding: "14px 18px", border: `2px solid ${cepErro ? "#c62828" : "#e8e8e8"}`, borderRadius: 12, fontSize: 18, fontFamily: "'Nunito', sans-serif", fontWeight: 800, textAlign: "center", letterSpacing: 2, marginBottom: cepErro ? 8 : 22, outline: "none" }}
              autoFocus onFocus={e => e.target.style.borderColor = "#013F79"} onBlur={e => { if (!cepErro) e.target.style.borderColor = "#e8e8e8"; }} />
            {cepErro && <p style={{ margin: "0 0 14px", fontSize: 13, color: "#c62828", fontWeight: 700 }}>⚠️ {cepErro}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setCepModal(false)} style={{ flex: 1, padding: "13px 0", background: "#fff", color: "#444", border: "2px solid #e8e8e8", borderRadius: 12, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Cancelar</button>
              <button onClick={salvarCep} disabled={cepLoading} style={{ flex: 2, padding: "13px 0", background: cepLoading ? "#aaa" : "#12733A", color: "#fff", border: "none", borderRadius: 12, fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 15, cursor: cepLoading ? "not-allowed" : "pointer" }}>{cepLoading ? "Verificando..." : "Salvar CEP"}</button>
            </div>
          </div>
        </>
      )}

      {/* ── Overlay sidebar ── */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.55)", animation: "fadeInOverlay 0.22s ease" }} />
      )}

      {/* ── Sidebar ── */}
      <div className="ht-side-menu" style={{ position: "fixed", top: 0, left: 0, zIndex: 999, width: 300, height: "100vh", background: "#fff", boxShadow: "4px 0 32px rgba(0,0,0,0.22)", transform: menuOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ background: "#12733A", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 17, fontFamily: "'Nunito', sans-serif", letterSpacing: 1 }}>☰ DEPARTAMENTOS</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {[
            {  label: "Brinquedos Educativos", slug: "Educativos" },
            {  label: "Pelúcias",              slug: "Pelucias"   },
            { label: "Bonecas e Bonecos",     slug: "Bonecas"    },
            {  label: "Carrinhos",             slug: "Carrinhos"  },
            {  label: "Jogos de Tabuleiro",    slug: "Jogos"      },
            {  label: "Quebra-Cabeças",        slug: "Educativos" },
            { label: "Esportes",              slug: "Educativos" },
            {  label: "Ao Ar Livre",           slug: "Educativos" },
            { label: "Baby",                  slug: "Pelucias"   },
            { label: "Geek e Colecionáveis",  slug: "Jogos"      },
          ].map(({ icon, label, slug }) => (
            <a key={label} href="#"
              onClick={() => { setMenuOpen(false); navigate(`/vitrine/${slug}`); }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 24px", color: "#222", textDecoration: "none", fontWeight: 700, fontSize: 14, fontFamily: "'Nunito', sans-serif", borderBottom: "1px solid #f2f2f2", transition: "background 0.15s, color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f0faf4"; e.currentTarget.style.color = "#12733A"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#222"; }}>
              <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              <span style={{ color: "#aaa", fontSize: 14 }}>›</span>
            </a>
          ))}
        </nav>
        <div style={{ padding: "16px 24px", borderTop: "2px solid #f0f0f0", background: "#fafafa", flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#888", fontFamily: "'Nunito', sans-serif", textAlign: "center" }}>🦅 HarpyToys — Sua diversão começa aqui!</p>
        </div>
      </div>

      {/* ── Header ── */}
      <header style={{ position: "relative", top: 0, zIndex: 500 }}>
        {/* Barra amarela */}
        <div className="ht-header-bar" style={{ background: "#FFDF26", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 88, gap: 20, width: "100%", padding: "0 24px" }}>
          <div style={{ fontWeight: 900, fontSize: 22, color: "#12733A", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
            onClick={() => navigate("/")}>
            <img src={Logo} alt="HarpyToys" style={{ width: 130, height: 90, objectFit: "contain" }} />
          </div>

          <div className="ht-cep-wrap" onClick={() => setCepModal(true)} style={{ fontSize: 12, color: "#013F79", fontWeight: 700, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <span>📍</span>
            <span>Entrega em: <strong>{cepSalvo || "Seu CEP"}</strong></span>
          </div>

          <div className="ht-search-wrap" style={{ flex: 1, maxWidth: 480, display: "flex" }}>
            <input type="text" placeholder="🔍  Encontre o seu Brinquedo"
              style={{ width: "100%", padding: "11px 18px", borderRadius: "30px 0 0 30px", border: "2px solid #fff", borderRight: "none", fontSize: 14, outline: "none", fontFamily: "'Nunito', sans-serif", background: "#fff", color: "#333" }} />
            <button style={{ background: "#013F79", color: "#fff", border: "none", borderRadius: "0 30px 30px 0", padding: "0 18px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>🔍</button>
          </div>

          <div className="ht-social-wrap" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" style={{ transition: "transform 0.15s", display: "flex" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <img src={Instagram} alt="Instagram" style={{ width: 28, height: 28, objectFit: "contain" }} />
            </a>
            <a href="https://www.whatsapp.com" target="_blank" rel="noreferrer" style={{ transition: "transform 0.15s", display: "flex" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <img src={Whatsapp} alt="WhatsApp" style={{ width: 28, height: 28, objectFit: "contain" }} />
            </a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}
            onClick={() => navigate("/perfil")} title="Minha Conta">
            <div style={{ width: 40, height: 40, background: "#12733A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#FFDF26", border: "2px solid #013F79" }}>👤</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#013F79", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Olá, {usuario?.nome?.split(" ")[0] || "Você"}
            </span>
          </div>

          <button onClick={() => navigate("/carrinho")} style={{ background: "#013F79", color: "#FFDF26", border: "none", borderRadius: 30, padding: "9px 18px", fontWeight: 900, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, position: "relative", transition: "transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            🛒
            {totalItems > 0 && (
              <span style={{ background: "#E91E63", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>{totalItems}</span>
            )}
            Carrinho
          </button>
        </div>

        {/* Barra verde nav */}
        <nav className="ht-nav-bar" style={{ background: "#12733A", padding: "6px 32px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 52, gap: 0 }}>
          <div className="ht-nav-inner" style={{ maxWidth: 1200, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Nunito', sans-serif", fontWeight: 800, padding: "0 18px 0 0", borderRight: "1px solid rgba(255,255,255,0.3)", marginRight: 18, height: 44 }}>☰ Categorias</button>
            {NAV_LINKS.map(link => (
              <a key={link} href="#" style={{ color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "0 16px", height: 44, display: "flex", alignItems: "center", transition: "background 0.15s", borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>{link}</a>
            ))}
          </div>
        </nav>
      </header>

      {/* ── Conteúdo ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>

        {/* Card do usuário */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", border: "1px solid #e8e8e8", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #013F79, #12733A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: "#fff", flexShrink: 0, boxShadow: "0 4px 16px rgba(1,63,121,0.3)" }}>
            {iniciais}
          </div>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "#222" }}>{usuario.nome}</h2>
            <p style={{ margin: 0, fontSize: 14, color: "#888", fontWeight: 700 }}>{usuario.email}</p>
          </div>
        </div>

        {/* Grid de opções */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
          {opcoes.map(op => (
            <div key={op.id} className="opcao-card" onClick={() => navigate(op.rota)}
              style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", border: "2px solid #e8e8e8", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
              <div style={{ marginBottom: 14 }}>{op.icon}</div>
              <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 900, color: "#013F79" }}>{op.titulo}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#888", fontWeight: 700, lineHeight: 1.5 }}>{op.descricao}</p>
            </div>
          ))}
        </div>

        {/* Botão Sair */}
        <button onClick={handleLogout} style={{ width: "100%", padding: "16px 0", background: "#c62828", color: "#fff", border: "none", borderRadius: 14, fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 16, cursor: "pointer", letterSpacing: 1, boxShadow: "0 4px 16px rgba(198,40,40,0.3)", transition: "filter 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
          onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}>
          SAIR DA CONTA
        </button>
      </div>
    </div>
  );
}