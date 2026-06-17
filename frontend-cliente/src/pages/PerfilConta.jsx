import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Logo from "../assets/Logo.png";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";

const NAV_LINKS = ["Lançamentos", "Ofertas", "Brinquedos Nacionais", "Área para Garotos", "Área para Garotas"];
const API_URL = "http://localhost:3001";

export default function PerfilConta() {
  const navigate = useNavigate();
  const { totalItems, setCartOpen } = useCart();
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem("usuario")); } catch { return null; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [cepSalvo, setCepSalvo] = useState(() => localStorage.getItem("cep_usuario") || "");
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", senha: "", confirma: "" });
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!usuario) { navigate("/login"); return; }
    setForm(f => ({ ...f, nome: usuario.nome || "", email: usuario.email || "", telefone: usuario.telefone || "" }));
  }, [usuario, navigate]);

  const handle = (campo) => (e) => setForm(prev => ({ ...prev, [campo]: e.target.value }));

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro(""); setMsg("");
    if (!form.nome || !form.email) { setErro("Nome e email são obrigatórios."); return; }
    if (form.senha && form.senha.length < 6) { setErro("A senha deve ter no mínimo 6 caracteres."); return; }
    if (form.senha && form.senha !== form.confirma) { setErro("As senhas não coincidem."); return; }
    setCarregando(true);
    try {
      const token = localStorage.getItem("token");
      const body = { nome: form.nome, email: form.email, telefone: form.telefone };
      if (form.senha) body.senha = form.senha;
      const res = await fetch(`${API_URL}/api/clientes/perfil`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const dados = await res.json();
      if (!res.ok) { setErro(dados.mensagem || "Erro ao salvar."); return; }
      const novo = { ...usuario, nome: form.nome, email: form.email };
      localStorage.setItem("usuario", JSON.stringify(novo));
      setUsuario(novo);
      window.dispatchEvent(new Event("usuarioLogado"));
      setMsg("Informações salvas com sucesso!");
      setForm(f => ({ ...f, senha: "", confirma: "" }));
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluirConta = async () => {
    setExcluindo(true);
    setErro("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/clientes/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const dados = await res.json();
      if (!res.ok) {
        setErro(dados.mensagem || "Erro ao excluir conta.");
        setExcluindo(false);
        return;
      }
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      localStorage.removeItem("cep_usuario");
      window.dispatchEvent(new Event("usuarioDeslogado"));
      navigate("/");
    } catch {
      setErro("Erro ao conectar com o servidor.");
      setExcluindo(false);
    }
  };

  if (!usuario) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .cad-input { transition: border-color 0.2s, box-shadow 0.2s; }
        .cad-input:focus { outline: none; border-color: #013F79; box-shadow: 0 0 0 3px rgba(1,63,121,0.15); }
        .cad-input::placeholder { color: #aaa; }
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.55)", animation: "fadeInOverlay 0.22s ease" }} />}
      <div className="ht-side-menu" style={{ position: "fixed", top: 0, left: 0, zIndex: 999, width: 300, height: "100vh", background: "#fff", boxShadow: "4px 0 32px rgba(0,0,0,0.22)", transform: menuOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ background: "#12733A", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 17, fontFamily: "'Nunito', sans-serif" }}>☰ DEPARTAMENTOS</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {[{ label: "Brinquedos Educativos", slug: "Educativos" }, { label: "Pelúcias", slug: "Pelucias" }, { label: "Bonecas e Bonecos", slug: "Bonecas" }, { label: "Carrinhos", slug: "Carrinhos" }, {label: "Jogos de Tabuleiro", slug: "Jogos" },{  label: "Quebra-Cabeças",        slug: "Educativos" },
            { label: "Esportes",              slug: "Educativos" },
            {  label: "Ao Ar Livre",           slug: "Educativos" },
            { label: "Baby",                  slug: "Pelucias"   },
            { label: "Geek e Colecionáveis",  slug: "Jogos" }, ].map(({ icon, label, slug }) => (
            <a key={label} href="#" onClick={() => { setMenuOpen(false); navigate(`/vitrine/${slug}`); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 24px", color: "#222", textDecoration: "none", fontWeight: 700, fontSize: 14, borderBottom: "1px solid #f2f2f2" }} onMouseEnter={e => { e.currentTarget.style.background = "#f0faf4"; e.currentTarget.style.color = "#12733A"; }} onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#222"; }}>
              <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              <span style={{ color: "#aaa" }}>›</span>
            </a>
          ))}
        </nav>
      </div>

      <header style={{ position: "relative", top: 0, zIndex: 500 }}>
        <div className="ht-header-bar" style={{ background: "#FFDF26", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 88, gap: 20, width: "100%", padding: "0 24px" }}>
          <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}><img src={Logo} alt="HarpyToys" style={{ width: 130, height: 90, objectFit: "contain" }} /></div>
          <div className="ht-cep-wrap" style={{ fontSize: 12, color: "#013F79", fontWeight: 700, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
            <span>📍</span><span>Entrega em: <strong>{cepSalvo || "Seu CEP"}</strong></span>
          </div>
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
            {NAV_LINKS.map(link => (
              <a key={link} href="#" style={{ color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "0 16px", height: 44, display: "flex", alignItems: "center" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>{link}</a>
            ))}
          </div>
        </nav>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: 14, fontWeight: 700, color: "#888" }}>
          <span style={{ cursor: "pointer", color: "#013F79" }} onClick={() => navigate("/perfil")}>← Minha Conta</span>
          <span>›</span>
          <span style={{ color: "#222" }}>Informações da Conta</span>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: "36px 40px", border: "1px solid #e8e8e8", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <h2 style={{ margin: "0 0 28px", fontSize: 22, fontWeight: 900, color: "#013F79", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#013F79" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Informações da Conta
          </h2>

          <form onSubmit={handleSalvar} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { label: "Nome", campo: "nome", type: "text", placeholder: "Seu nome completo" },
              { label: "Email", campo: "email", type: "email", placeholder: "seu@email.com" },
              { label: "Telefone", campo: "telefone", type: "tel", placeholder: "(11) 99999-9999" },
              { label: "Nova Senha", campo: "senha", type: "password", placeholder: "Deixe em branco para não alterar" },
              { label: "Confirmar", campo: "confirma", type: "password", placeholder: "Repita a nova senha" },
            ].map(({ label, campo, type, placeholder }) => (
              <div key={campo} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <label style={{ color: "#555", fontWeight: 800, fontSize: 14, width: 100, textAlign: "right", flexShrink: 0 }}>{label}:</label>
                <input className="cad-input" type={type} placeholder={placeholder} value={form[campo]} onChange={handle(campo)}
                  style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "2px solid #e0e0e0", fontSize: 14, fontFamily: "'Nunito', sans-serif", color: "#222" }} />
              </div>
            ))}

            {erro && <p style={{ color: "#c62828", fontWeight: 700, fontSize: 13, background: "#fff5f5", border: "1px solid #ffcdd2", borderRadius: 8, padding: "10px 16px", margin: 0 }}>⚠️ {erro}</p>}
            {msg  && <p style={{ color: "#2e7d32", fontWeight: 700, fontSize: 13, background: "#f1f8e9", border: "1px solid #c5e1a5", borderRadius: 8, padding: "10px 16px", margin: 0 }}>✅ {msg}</p>}

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="button" onClick={() => navigate("/perfil")} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "2px solid #e0e0e0", background: "#fff", color: "#555", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Voltar</button>
              <button type="submit" disabled={carregando} style={{ flex: 2, padding: "13px 0", borderRadius: 12, border: "none", background: carregando ? "#aaa" : "#013F79", color: "#FFDF26", fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 15, cursor: carregando ? "not-allowed" : "pointer" }}>
                {carregando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>

        {/* Zona de risco — excluir conta */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 40px", border: "1px solid #ffcdd2", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", marginTop: 20 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 900, color: "#c62828", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            Excluir Conta
          </h2>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#777", lineHeight: 1.5 }}>
            Sua conta será desativada e você não poderá mais fazer login. Seu histórico de pedidos
            será mantido para fins de registro, mas seus dados de acesso deixarão de funcionar.
          </p>
          <button
            type="button"
            onClick={() => setModalExcluir(true)}
            style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #c62828", background: "#fff", color: "#c62828", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
          >
            Excluir minha conta
          </button>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {modalExcluir && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeInOverlay 0.2s ease" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", maxWidth: 420, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 900, color: "#c62828" }}>
              ⚠️ Tem certeza?
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#555", lineHeight: 1.5 }}>
              Esta ação irá desativar sua conta imediatamente. Você precisará entrar em contato
              com o suporte para reativá-la. Deseja continuar?
            </p>

            {erro && <p style={{ color: "#c62828", fontWeight: 700, fontSize: 13, background: "#fff5f5", border: "1px solid #ffcdd2", borderRadius: 8, padding: "10px 16px", margin: "0 0 16px" }}>⚠️ {erro}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setModalExcluir(false)}
                disabled={excluindo}
                style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "2px solid #e0e0e0", background: "#fff", color: "#555", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExcluirConta}
                disabled={excluindo}
                style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: excluindo ? "#e57373" : "#c62828", color: "#fff", fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 14, cursor: excluindo ? "not-allowed" : "pointer" }}
              >
                {excluindo ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
