import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Logo from "../assets/Logo.png";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";

const NAV_LINKS = ["Lançamentos", "Ofertas", "Brinquedos Nacionais", "Área para Garotos", "Área para Garotas"];

export default function PerfilCartoes() {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem("usuario")); } catch { return null; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [cepSalvo] = useState(() => localStorage.getItem("cep_usuario") || "");
  const [cartoes, setCartoes] = useState([
  ]);
  const [adicionando, setAdicionando] = useState(false);
  const [novoCartao, setNovoCartao] = useState({ numero: "", nome: "", validade: "", cvv: "" });
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { if (!usuario) navigate("/login"); }, [usuario, navigate]);
  if (!usuario) return null;

  const handleNovoCartao = (campo) => (e) => setNovoCartao(prev => ({ ...prev, [campo]: e.target.value }));

  const handleAdicionarCartao = (e) => {
    e.preventDefault();
    setErro("");
    const numLimpo = novoCartao.numero.replace(/\s/g, "");
    if (numLimpo.length < 16) { setErro("Número de cartão inválido."); return; }
    if (!novoCartao.nome.trim()) { setErro("Informe o nome impresso no cartão."); return; }
    if (!novoCartao.validade.match(/^\d{2}\/\d{2}$/)) { setErro("Validade no formato MM/AA."); return; }
    if (novoCartao.cvv.length < 3) { setErro("CVV inválido."); return; }
    const bandeiras = { "4": "Visa", "5": "Mastercard", "3": "Amex" };
    const bandeira = bandeiras[numLimpo[0]] || "Outro";
    setCartoes(prev => [...prev, { id: Date.now(), bandeira, final: numLimpo.slice(-4), nome: novoCartao.nome.toUpperCase(), validade: novoCartao.validade, principal: false }]);
    setNovoCartao({ numero: "", nome: "", validade: "", cvv: "" });
    setAdicionando(false);
    setMsg("Cartão adicionado com sucesso!");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleRemover = (id) => {
    setCartoes(prev => prev.filter(c => c.id !== id));
    setMsg("Cartão removido.");
    setTimeout(() => setMsg(""), 3000);
  };

  const handlePrincipal = (id) => {
    setCartoes(prev => prev.map(c => ({ ...c, principal: c.id === id })));
  };

  const formatNumero = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const bandeiraCor = { "Visa": "#1A1F71", "Mastercard": "#EB001B", "Amex": "#007BC1", "Outro": "#555" };

  const HEADER = (
    <header style={{ position: "relative", top: 0, zIndex: 500 }}>
      <div className="ht-header-bar" style={{ background: "#FFDF26", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 88, gap: 20, width: "100%", padding: "0 24px" }}>
        <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}><img src={Logo} alt="HarpyToys" style={{ width: 130, height: 90, objectFit: "contain" }} /></div>
        <div className="ht-cep-wrap" style={{ fontSize: 12, color: "#013F79", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><span>📍</span><span>Entrega em: <strong>{cepSalvo || "Seu CEP"}</strong></span></div>
        <div className="ht-search-wrap" style={{ flex: 1, maxWidth: 480, display: "flex" }}>
          <input type="text" placeholder="🔍  Encontre o seu Brinquedo" style={{ width: "100%", padding: "11px 18px", borderRadius: "30px 0 0 30px", border: "2px solid #fff", borderRight: "none", fontSize: 14, outline: "none", fontFamily: "'Nunito', sans-serif", background: "#fff" }} />
          <button style={{ background: "#013F79", color: "#fff", border: "none", borderRadius: "0 30px 30px 0", padding: "0 18px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>🔍</button>
        </div>
        <div className="ht-social-wrap" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer" style={{ display: "flex" }}><img src={Instagram} alt="Instagram" style={{ width: 28, height: 28 }} /></a>
          <a href="https://www.whatsapp.com" target="_blank" rel="noreferrer" style={{ display: "flex" }}><img src={Whatsapp} alt="WhatsApp" style={{ width: 28, height: 28 }} /></a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }} onClick={() => navigate("/perfil")}>
          <div style={{ width: 40, height: 40, background: "#12733A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#FFDF26", border: "2px solid #013F79" }}>👤</div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#013F79" }}>Olá, {usuario?.nome?.split(" ")[0]}</span>
        </div>
        <button onClick={() => navigate("/carrinho")} style={{ background: "#013F79", color: "#FFDF26", border: "none", borderRadius: 30, padding: "9px 18px", fontWeight: 900, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          🛒 {totalItems > 0 && <span style={{ background: "#E91E63", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }}>{totalItems}</span>} Carrinho
        </button>
      </div>
      <nav className="ht-nav-bar" style={{ background: "#12733A", padding: "6px 32px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 52 }}>
        <div className="ht-nav-inner" style={{ maxWidth: 1200, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Nunito', sans-serif", fontWeight: 800, padding: "0 18px 0 0", borderRight: "1px solid rgba(255,255,255,0.3)", marginRight: 18, height: 44 }}>☰ Categorias</button>
          {NAV_LINKS.map(link => (<a key={link} href="#" style={{ color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "0 16px", height: 44, display: "flex", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>{link}</a>))}
        </div>
      </nav>
    </header>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .cad-input:focus { outline: none; border-color: #013F79; box-shadow: 0 0 0 3px rgba(1,63,121,0.15); }
        .cad-input::placeholder { color: #aaa; }
        .cartao-card { transition: transform 0.2s, box-shadow 0.2s; }
        .cartao-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.55)", animation: "fadeInOverlay 0.22s ease" }} />}
      <div className="ht-side-menu" style={{ position: "fixed", top: 0, left: 0, zIndex: 999, width: 300, height: "100vh", background: "#fff", boxShadow: "4px 0 32px rgba(0,0,0,0.22)", transform: menuOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ background: "#12733A", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 17 }}>☰ DEPARTAMENTOS</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {[{ label: "Brinquedos Educativos", slug: "Educativos" }, { label: "Pelúcias", slug: "Pelucias" }, { label: "Bonecas e Bonecos", slug: "Bonecas" }, { label: "Carrinhos", slug: "Carrinhos" }, {label: "Jogos de Tabuleiro", slug: "Jogos" },{  label: "Quebra-Cabeças",        slug: "Educativos" },
            { label: "Esportes",              slug: "Educativos" },
            {  label: "Ao Ar Livre",           slug: "Educativos" },
            { label: "Baby",                  slug: "Pelucias"   },
            { label: "Geek e Colecionáveis",  slug: "Jogos" }, ].map(({ icon, label, slug }) => (
            <a key={label} href="#" onClick={() => { setMenuOpen(false); navigate(`/vitrine/${slug}`); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 24px", color: "#222", textDecoration: "none", fontWeight: 700, fontSize: 14, borderBottom: "1px solid #f2f2f2" }} onMouseEnter={e => { e.currentTarget.style.background = "#f0faf4"; e.currentTarget.style.color = "#12733A"; }} onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#222"; }}>
              <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{icon}</span><span style={{ flex: 1 }}>{label}</span><span style={{ color: "#aaa" }}>›</span>
            </a>
          ))}
        </nav>
      </div>

      {HEADER}

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: 14, fontWeight: 700, color: "#888" }}>
          <span style={{ cursor: "pointer", color: "#013F79" }} onClick={() => navigate("/perfil")}>← Minha Conta</span>
          <span>›</span><span style={{ color: "#222" }}>Cartões</span>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", border: "1px solid #e8e8e8", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#013F79", display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#013F79" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Meus Cartões
            </h2>
            <button onClick={() => { setAdicionando(!adicionando); setErro(""); }} style={{ background: adicionando ? "#e8e8e8" : "#013F79", color: adicionando ? "#555" : "#FFDF26", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 14, cursor: "pointer" }}>
              {adicionando ? "Cancelar" : "+ Adicionar Cartão"}
            </button>
          </div>

          {msg && <p style={{ color: "#2e7d32", fontWeight: 700, fontSize: 13, background: "#f1f8e9", border: "1px solid #c5e1a5", borderRadius: 8, padding: "10px 16px", marginBottom: 18 }}>✅ {msg}</p>}

          {/* Form novo cartão */}
          {adicionando && (
            <form onSubmit={handleAdicionarCartao} style={{ background: "#f7f9ff", border: "2px solid #013F79", borderRadius: 14, padding: "24px 28px", marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 900, color: "#013F79" }}>Novo Cartão</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>NÚMERO DO CARTÃO</label>
                  <input className="cad-input" type="text" placeholder="0000 0000 0000 0000" value={novoCartao.numero} onChange={e => setNovoCartao(p => ({ ...p, numero: formatNumero(e.target.value) }))} maxLength={19}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 16, fontFamily: "'Nunito', sans-serif", letterSpacing: 2 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>NOME NO CARTÃO</label>
                  <input className="cad-input" type="text" placeholder="NOME SOBRENOME" value={novoCartao.nome} onChange={handleNovoCartao("nome")}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "'Nunito', sans-serif" }} />
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>VALIDADE</label>
                    <input className="cad-input" type="text" placeholder="MM/AA" value={novoCartao.validade}
                      onChange={e => { let v = e.target.value.replace(/\D/g, "").slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2); setNovoCartao(p => ({ ...p, validade: v })); }}
                      maxLength={5} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "'Nunito', sans-serif" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>CVV</label>
                    <input className="cad-input" type="text" placeholder="000" value={novoCartao.cvv} onChange={e => setNovoCartao(p => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      maxLength={4} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "'Nunito', sans-serif" }} />
                  </div>
                </div>
              </div>
              {erro && <p style={{ color: "#c62828", fontWeight: 700, fontSize: 13, background: "#fff5f5", border: "1px solid #ffcdd2", borderRadius: 8, padding: "10px 16px", marginTop: 14, marginBottom: 0 }}>⚠️ {erro}</p>}
              <button type="submit" style={{ marginTop: 18, width: "100%", padding: "13px 0", background: "#12733A", color: "#fff", border: "none", borderRadius: 12, fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 15, cursor: "pointer" }}>Salvar Cartão</button>
            </form>
          )}

          {/* Lista de cartões */}
          {cartoes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#aaa" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>💳</div>
              <p style={{ fontWeight: 700, fontSize: 16 }}>Nenhum cartão cadastrado ainda.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {cartoes.map(cartao => (
                <div key={cartao.id} className="cartao-card" style={{ border: `2px solid ${cartao.principal ? "#013F79" : "#e8e8e8"}`, borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20, background: cartao.principal ? "#f0f4ff" : "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ width: 56, height: 36, background: bandeiraCor[cartao.bandeira] || "#555", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{cartao.bandeira}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: 15, color: "#222" }}>•••• •••• •••• {cartao.final}</p>
                    <p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: 12, color: "#888" }}>{cartao.nome} · Validade {cartao.validade}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {cartao.principal ? (
                      <span style={{ background: "#013F79", color: "#FFDF26", borderRadius: 20, padding: "4px 12px", fontWeight: 800, fontSize: 11 }}>Principal</span>
                    ) : (
                      <button onClick={() => handlePrincipal(cartao.id)} style={{ background: "none", border: "1.5px solid #013F79", color: "#013F79", borderRadius: 20, padding: "4px 12px", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 11, cursor: "pointer" }}>Tornar principal</button>
                    )}
                    <button onClick={() => handleRemover(cartao.id)} style={{ background: "none", border: "none", color: "#c62828", fontSize: 20, cursor: "pointer", lineHeight: 1 }} title="Remover">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
