import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Logo from "../assets/Logo.png";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const STATUS_COLORS = {
  pendente:     { bg: "#fff8e1", color: "#f57f17", border: "#ffe082",   label: "Pendente" },
  pago:         { bg: "#e8f5e9", color: "#2e7d32", border: "#c5e1a5",   label: "Pago" },
  processando:  { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9",   label: "Processando" },
  enviado:      { bg: "#ede7f6", color: "#4527a0", border: "#b39ddb",   label: "Enviado" },
  entregue:     { bg: "#e8f5e9", color: "#2e7d32", border: "#c5e1a5",   label: "Entregue" },
  cancelado:    { bg: "#ffebee", color: "#c62828", border: "#ffcdd2",   label: "Cancelado" },
};

const fmtData = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const fmtPreco = (n) => "R$ " + Number(n || 0).toFixed(2).replace(".", ",");

export default function PerfilPedidos() {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const [usuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem("usuario")); } catch { return null; }
  });

  const [pedidos, setPedidos]           = useState([]);
  const [pedidoAberto, setPedidoAberto] = useState(null);   // objeto completo com itens
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [cepSalvo]                      = useState(() => localStorage.getItem("cep_usuario") || "");
  const [menuOpen, setMenuOpen]         = useState(false);

  useEffect(() => { if (!usuario) navigate("/login"); }, [usuario, navigate]);

  useEffect(() => {
    if (!usuario?.id) return;
    fetch(`${API_URL}/api/pedidos/cliente/${usuario.id}`)
      .then(r => r.json())
      .then(data => setPedidos(Array.isArray(data) ? data : []))
      .catch(err => console.error("Erro ao carregar pedidos:", err));
  }, [usuario]);

  async function abrirPedido(pedido) {
    // Fecha se já estava aberto
    if (pedidoAberto?.id === pedido.id) { setPedidoAberto(null); return; }

    setLoadingDetalhe(true);
    try {
      const res = await fetch(`${API_URL}/api/pedidos/${pedido.id}`);
      const data = await res.json();
      setPedidoAberto(data);
    } catch (err) {
      console.error("Erro ao buscar detalhe:", err);
      alert("Erro ao carregar detalhes do pedido.");
    } finally {
      setLoadingDetalhe(false);
    }
  }

  if (!usuario) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .pedido-card { transition: transform 0.2s, box-shadow 0.2s; }
        .pedido-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        @keyframes fadeInOverlay { from { opacity:0 } to { opacity:1 } }
        @keyframes slideDown { from { opacity:0; max-height:0 } to { opacity:1; max-height:600px } }
      `}</style>

      {/* Menu overlay */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:998, background:"rgba(0,0,0,0.55)", animation:"fadeInOverlay 0.22s ease" }} />}
      <div className="ht-side-menu" style={{ position:"fixed", top:0, left:0, zIndex:999, width:300, height:"100vh", background:"#fff", boxShadow:"4px 0 32px rgba(0,0,0,0.22)", transform: menuOpen?"translateX(0)":"translateX(-100%)", transition:"transform 0.3s cubic-bezier(0.22,1,0.36,1)", display:"flex", flexDirection:"column", overflowY:"auto" }}>
        <div style={{ background:"#12733A", padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:"#fff", fontWeight:900, fontSize:17 }}>☰ DEPARTAMENTOS</span>
          <button onClick={() => setMenuOpen(false)} style={{ background:"none", border:"none", color:"#fff", fontSize:22, cursor:"pointer" }}>✕</button>
        </div>
        <nav style={{ flex:1, padding:"8px 0" }}>
          {[
            {  label:"Brinquedos Educativos", slug:"educativos" },
            { label:"Pelúcias",              slug:"pelucias" },
            { label:"Bonecas e Bonecos",     slug:"bonecas" },
            {  label:"Carrinhos",             slug:"carrinhos" },
            {  label:"Jogos de Tabuleiro",   slug:"jogos" },
            { label:"Quebra-Cabeças",        slug:"quebra-cabecas" },
            {  label:"Esportes",              slug:"esportes" },
            { label:"Ao Ar Livre",           slug:"ao-ar-livre" },
            { label:"Baby",                  slug:"baby" },
            { label:"Geek e Colecionáveis",  slug:"geek" },
          ].map(({ icon, label, slug }) => (
            <a key={slug} href="#" onClick={() => { setMenuOpen(false); navigate(`/vitrine/${slug}`); }}
              style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 24px", color:"#222", textDecoration:"none", fontWeight:700, fontSize:14, borderBottom:"1px solid #f2f2f2" }}
              onMouseEnter={e => { e.currentTarget.style.background="#f0faf4"; e.currentTarget.style.color="#12733A"; }}
              onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="#222"; }}>
              <span style={{ fontSize:20, width:28, textAlign:"center" }}>{icon}</span>
              <span style={{ flex:1 }}>{label}</span>
              <span style={{ color:"#aaa" }}>›</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Header */}
      <header style={{ position:"relative", top:0, zIndex:500 }}>
        <div className="ht-header-bar" style={{ background:"#FFDF26", display:"flex", alignItems:"center", justifyContent:"center", minHeight:88, gap:20, width:"100%", padding:"0 24px" }}>
          <div style={{ cursor:"pointer" }} onClick={() => navigate("/")}><img src={Logo} alt="HarpyToys" style={{ width:130, height:90, objectFit:"contain" }} /></div>
          <div className="ht-cep-wrap" style={{ fontSize:12, color:"#013F79", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}><span>📍</span><span>Entrega em: <strong>{cepSalvo || "Seu CEP"}</strong></span></div>
          <div className="ht-search-wrap" style={{ flex:1, maxWidth:480, display:"flex" }}>
            <input type="text" placeholder="🔍  Encontre o seu Brinquedo" style={{ width:"100%", padding:"11px 18px", borderRadius:"30px 0 0 30px", border:"2px solid #fff", borderRight:"none", fontSize:14, outline:"none", fontFamily:"'Nunito', sans-serif", background:"#fff" }} />
            <button style={{ background:"#013F79", color:"#fff", border:"none", borderRadius:"0 30px 30px 0", padding:"0 18px", fontWeight:800, fontSize:14, cursor:"pointer" }}>🔍</button>
          </div>
          <div className="ht-social-wrap" style={{ display:"flex", gap:12, alignItems:"center" }}>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer"><img src={Instagram} alt="Instagram" style={{ width:28, height:28 }} /></a>
            <a href="https://www.whatsapp.com"  target="_blank" rel="noreferrer"><img src={Whatsapp}  alt="WhatsApp"  style={{ width:28, height:28 }} /></a>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"pointer" }} onClick={() => navigate("/perfil")}>
            <div style={{ width:40, height:40, background:"#12733A", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"#FFDF26", border:"2px solid #013F79" }}>👤</div>
            <span style={{ fontSize:11, fontWeight:700, color:"#013F79" }}>Olá, {usuario?.nome?.split(" ")[0]}</span>
          </div>
          <button onClick={() => navigate("/carrinho")} style={{ background:"#013F79", color:"#FFDF26", border:"none", borderRadius:30, padding:"9px 18px", fontWeight:900, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
            🛒 {totalItems > 0 && <span style={{ background:"#E91E63", color:"#fff", borderRadius:"50%", width:20, height:20, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900 }}>{totalItems}</span>} Carrinho
          </button>
        </div>
        <nav className="ht-nav-bar" style={{ background:"#12733A", padding:"6px 32px", display:"flex", alignItems:"center", justifyContent:"center", minHeight:52 }}>
          <div className="ht-nav-inner" style={{ maxWidth:1200, width:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <button onClick={() => setMenuOpen(true)} style={{ background:"none", border:"none", color:"#fff", fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontFamily:"'Nunito', sans-serif", fontWeight:800, padding:"0 18px 0 0", borderRight:"1px solid rgba(255,255,255,0.3)", marginRight:18, height:44 }}>☰ Categorias</button>
            {["Lançamentos","Ofertas","Brinquedos Nacionais","Área para Garotos","Área para Garotas"].map(link => (
              <a key={link} href="#" style={{ color:"#fff", textDecoration:"none", fontSize:14, fontWeight:700, padding:"0 16px", height:44, display:"flex", alignItems:"center" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background="none"}>{link}</a>
            ))}
          </div>
        </nav>
      </header>

      {/* Conteúdo */}
      <div style={{ maxWidth:760, margin:"0 auto", padding:"40px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28, fontSize:14, fontWeight:700, color:"#888" }}>
          <span style={{ cursor:"pointer", color:"#013F79" }} onClick={() => navigate("/perfil")}>← Minha Conta</span>
          <span>›</span><span style={{ color:"#222" }}>Meus Pedidos</span>
        </div>

        <div style={{ background:"#fff", borderRadius:20, padding:"32px 36px", border:"1px solid #e8e8e8", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
          <h2 style={{ margin:"0 0 24px", fontSize:22, fontWeight:900, color:"#013F79", display:"flex", alignItems:"center", gap:10 }}>
            <span>🛍️</span> Meus Pedidos
          </h2>

          {pedidos.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"#aaa" }}>
              <div style={{ fontSize:56, marginBottom:12 }}>📦</div>
              <p style={{ fontWeight:700, fontSize:16 }}>Você ainda não fez nenhum pedido.</p>
              <button onClick={() => navigate("/")} style={{ marginTop:16, padding:"12px 28px", background:"#013F79", color:"#FFDF26", border:"none", borderRadius:12, fontFamily:"'Nunito', sans-serif", fontWeight:900, fontSize:15, cursor:"pointer" }}>Explorar Produtos</button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {pedidos.map(pedido => {
                const stKey = (pedido.status || "pendente").toLowerCase();
                const st = STATUS_COLORS[stKey] || STATUS_COLORS.pendente;
                const aberto = pedidoAberto?.id === pedido.id;

                return (
                  <div key={pedido.id} className="pedido-card" style={{ border:"1.5px solid #e8e8e8", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
                    {/* Cabeçalho clicável */}
                    <div onClick={() => abrirPedido(pedido)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px", cursor:"pointer", background:"#fafafa" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                        <div style={{ fontSize:28 }}>📦</div>
                        <div>
                          <p style={{ margin:0, fontWeight:900, fontSize:15, color:"#222" }}>
                            {pedido.numero_pedido || `Pedido #${pedido.id}`}
                          </p>
                          <p style={{ margin:"2px 0 0", fontWeight:700, fontSize:12, color:"#888" }}>
                            {fmtData(pedido.data_pedido)}
                          </p>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                        <span style={{ background:st.bg, color:st.color, border:`1.5px solid ${st.border}`, borderRadius:20, padding:"4px 14px", fontWeight:800, fontSize:12 }}>
                          {st.label}
                        </span>
                        <span style={{ fontWeight:900, fontSize:15, color:"#12733A" }}>
                          {fmtPreco(pedido.valor_total)}
                        </span>
                        <span style={{ color:"#aaa", fontSize:18, transition:"transform 0.2s", transform: aberto ? "rotate(90deg)" : "none" }}>›</span>
                      </div>
                    </div>

                    {/* Detalhe do pedido */}
                    {aberto && (
                      <div style={{ padding:"16px 22px", borderTop:"1px solid #f0f0f0", background:"#fff", animation:"slideDown 0.2s ease" }}>
                        {loadingDetalhe ? (
                          <p style={{ color:"#888", fontWeight:700 }}>Carregando itens...</p>
                        ) : (
                          <>
                            <p style={{ margin:"0 0 10px", fontWeight:800, fontSize:13, color:"#555" }}>Itens do pedido:</p>
                            {(pedidoAberto.itens || []).map((item, i) => (
                              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom: i < pedidoAberto.itens.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                                {item.imagem_url
                                  ? <img src={item.imagem_url.startsWith("/uploads") ? `${API_URL}${item.imagem_url}` : item.imagem_url} alt={item.nome} style={{ width:44, height:44, objectFit:"cover", borderRadius:8, border:"1px solid #eee" }} />
                                  : <span style={{ fontSize:28 }}>🧸</span>
                                }
                                <div>
                                  <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#333" }}>{item.nome}</p>
                                  <p style={{ margin:"2px 0 0", fontSize:12, color:"#888" }}>
                                    {item.quantidade}x · {fmtPreco(item.preco_unitario)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #f0f0f0", display:"flex", justifyContent:"space-between" }}>
                              <span style={{ fontWeight:700, fontSize:13, color:"#555" }}>Frete</span>
                              <span style={{ fontWeight:700, fontSize:13, color:"#555" }}>{fmtPreco(pedido.valor_frete)}</span>
                            </div>
                            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                              <span style={{ fontWeight:900, fontSize:15, color:"#013F79" }}>Total</span>
                              <span style={{ fontWeight:900, fontSize:15, color:"#12733A" }}>{fmtPreco(pedido.valor_total)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
