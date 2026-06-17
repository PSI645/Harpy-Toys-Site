import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Logo from "../assets/Logo_2.png";
import Instagram from "../assets/instagram.png";
import Whatsapp  from "../assets/whatsapp.png";
import { CATEGORIAS } from "../data/mockProdutos";

const API_URL = "http://localhost:3001";

function Estrelas({ n, size = 18 }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? "#F8C131" : "#ddd", fontSize: size }}>★</span>
      ))}
    </span>
  );
}

export default function Produto() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { addToCart, totalItems } = useCart();

  const [produto, setProduto]       = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [imgAtiva, setImgAtiva]     = useState(0);
  const [qtd, setQtd]               = useState(1);
  const [adicionado, setAdicionado] = useState(false);

  // CEP / frete
  const [cep, setCep]               = useState("");
  const [frete, setFrete]           = useState(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepErro, setCepErro]       = useState("");

  // Header
  const [cepHeader]   = useState(() => localStorage.getItem("cep_usuario") || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario]   = useState(() => {
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

  // Busca produto da API
  useEffect(() => {
    setCarregando(true);
    fetch(`${API_URL}/api/produtos/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.id) setProduto(data);
        else setProduto(null);
      })
      .catch(() => setProduto(null))
      .finally(() => setCarregando(false));
  }, [id]);

  const calcularFrete = useCallback(async (digits) => {
    setCepLoading(true);
    setCepErro("");
    setFrete(null);
    try {
      const viaCep = await fetch(`https://viacep.com.br/ws/${digits}/json/`).then(r => r.json());
      if (viaCep.erro) { setCepErro("CEP não encontrado."); return; }

      const endDest   = encodeURIComponent(`${viaCep.logradouro}, ${viaCep.localidade}, ${viaCep.uf}, Brasil`);
      const endOrigem = encodeURIComponent("Rua Guaipá, 678, Vila Leopoldina, São Paulo, SP, Brasil");

      const [rO, rD] = await Promise.all([
        fetch(`https://nominatim.openstreetmap.org/search?q=${endOrigem}&format=json&limit=1`, { headers: { "User-Agent": "HarpyToys/1.0" } }).then(r => r.json()),
        fetch(`https://nominatim.openstreetmap.org/search?q=${endDest}&format=json&limit=1`,   { headers: { "User-Agent": "HarpyToys/1.0" } }).then(r => r.json()),
      ]);

      if (!rO.length || !rD.length) { setCepErro("Não foi possível calcular o frete."); return; }

      const R = 6371;
      const lat1 = parseFloat(rO[0].lat), lon1 = parseFloat(rO[0].lon);
      const lat2 = parseFloat(rD[0].lat), lon2 = parseFloat(rD[0].lon);
      const dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
      const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      setFrete(Math.max(1, Math.round(km)));
    } catch {
      setCepErro("Erro ao calcular frete.");
    } finally {
      setCepLoading(false);
    }
  }, []);

  useEffect(() => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) { setFrete(null); setCepErro(""); return; }
    const t = setTimeout(() => calcularFrete(digits), 600);
    return () => clearTimeout(t);
  }, [cep, calcularFrete]);

  const handleAddToCart = () => {
    if (!produto) return;
    const preco = parseFloat(produto.preco) || 0;
    for (let i = 0; i < qtd; i++) {
      addToCart({ id: produto.id, nome: produto.nome, preco, imagem_url: produto.imagem_url });
    }
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  };

  // Loading
  if (carregando) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif" }}>
      <p style={{ fontSize:18, color:"#888", fontWeight:700 }}>Carregando produto...</p>
    </div>
  );

  // Não encontrado
  if (!produto) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif" }}>
      <p style={{ fontSize:48 }}>😕</p>
      <h2 style={{ color:"#013F79" }}>Produto não encontrado</h2>
      <button onClick={() => navigate("/")} style={{ marginTop:16, padding:"12px 28px", background:"#12733A", color:"#fff", border:"none", borderRadius:10, fontWeight:800, fontSize:15, cursor:"pointer" }}>
        ← Voltar ao início
      </button>
    </div>
  );

  const preco      = parseFloat(produto.preco) || 0;
  const preco_fmt  = produto.preco_fmt || "R$ " + preco.toFixed(2).replace(".", ",");
  const imagens    = produto.imagem_url
    ? [produto.imagem_url.startsWith("/uploads") ? `${API_URL}${produto.imagem_url}` : produto.imagem_url]
    : ["https://placehold.co/400x380/eee/999?text=Produto"];

  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f5", fontFamily:"'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeInOverlay { from{opacity:0}to{opacity:1} }
      `}</style>

      {/* Menu lateral */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position:"fixed",inset:0,zIndex:998,background:"rgba(0,0,0,0.55)",animation:"fadeInOverlay 0.22s ease" }} />}
      <div className="ht-side-menu" style={{ position:"fixed",top:0,left:0,zIndex:999,width:300,height:"100vh",background:"#fff",boxShadow:"4px 0 32px rgba(0,0,0,0.22)",transform:menuOpen?"translateX(0)":"translateX(-100%)",transition:"transform 0.3s cubic-bezier(0.22,1,0.36,1)",display:"flex",flexDirection:"column",overflowY:"auto" }}>
        <div style={{ background:"#12733A",padding:"18px 20px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <span style={{ color:"#fff",fontWeight:900,fontSize:17 }}>☰ DEPARTAMENTOS</span>
          <button onClick={() => setMenuOpen(false)} style={{ background:"none",border:"none",color:"#fff",fontSize:22,cursor:"pointer" }}>✕</button>
        </div>
        <nav style={{ flex:1,padding:"8px 0" }}>
          {CATEGORIAS.map(({ slug, label }) => (
            <a key={slug} href="#" onClick={() => { setMenuOpen(false); navigate(`/vitrine/${slug}`); }}
              style={{ display:"flex",alignItems:"center",gap:14,padding:"13px 24px",color:"#222",textDecoration:"none",fontWeight:700,fontSize:14,borderBottom:"1px solid #f2f2f2" }}
              onMouseEnter={e => { e.currentTarget.style.background="#f0faf4"; e.currentTarget.style.color="#12733A"; }}
              onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="#222"; }}>
              <span style={{ flex:1 }}>{label}</span><span style={{ color:"#aaa" }}>›</span>
            </a>
          ))}
        </nav>
        <div style={{ padding:"16px 24px",borderTop:"1px solid #f0f0f0",fontSize:12,color:"#aaa",textAlign:"center" }}>HarpyToys — Sua diversão começa aqui!</div>
      </div>

      {/* Header */}
      <header>
        <div className="ht-header-bar" style={{ background:"#FFDF26",display:"flex",alignItems:"center",justifyContent:"center",minHeight:88,gap:20,width:"100%",padding:"0 24px" }}>
          <div style={{ cursor:"pointer" }} onClick={() => navigate("/")}><img src={Logo} alt="HarpyToys" style={{ width:130,height:90,objectFit:"contain" }} /></div>
          <div className="ht-cep-wrap" style={{ fontSize:12,color:"#013F79",fontWeight:700,display:"flex",alignItems:"center",gap:4 }}>📍 Entrega em: <strong>{cepHeader||"Seu CEP"}</strong></div>
          <div className="ht-search-wrap" style={{ flex:1,maxWidth:480,display:"flex" }}>
            <input type="text" placeholder="🔍  Encontre o seu Brinquedo" style={{ width:"100%",padding:"11px 18px",borderRadius:"30px 0 0 30px",border:"2px solid #fff",borderRight:"none",fontSize:14,outline:"none",background:"#fff" }} />
            <button style={{ background:"#013F79",color:"#fff",border:"none",borderRadius:"0 30px 30px 0",padding:"0 18px",fontWeight:800,fontSize:14,cursor:"pointer" }}>🔍</button>
          </div>
          <div className="ht-social-wrap" style={{ display:"flex",gap:12,alignItems:"center" }}>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer"><img src={Instagram} alt="Instagram" style={{ width:28,height:28 }} /></a>
            <a href="https://www.whatsapp.com"  target="_blank" rel="noreferrer"><img src={Whatsapp}  alt="WhatsApp"  style={{ width:28,height:28 }} /></a>
          </div>
          {usuario ? (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer" }} onClick={() => navigate("/perfil")}>
              <div style={{ width:40,height:40,background:"#12733A",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"#FFDF26",border:"2px solid #013F79" }}>👤</div>
              <span style={{ fontSize:11,fontWeight:700,color:"#013F79" }}>Olá, {usuario.nome?.split(" ")[0]}</span>
            </div>
          ) : (
            <button onClick={() => navigate("/login")} style={{ background:"none",border:"2px solid #013F79",borderRadius:20,padding:"6px 16px",fontWeight:800,fontSize:13,cursor:"pointer",color:"#013F79" }}>Entrar</button>
          )}
          <button onClick={() => navigate("/carrinho")} style={{ background:"#013F79",color:"#FFDF26",border:"none",borderRadius:30,padding:"9px 18px",fontWeight:900,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
            🛒 {totalItems > 0 && <span style={{ background:"#E91E63",color:"#fff",borderRadius:"50%",width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900 }}>{totalItems}</span>} Carrinho
          </button>
        </div>
        <nav className="ht-nav-bar" style={{ background:"#12733A",padding:"6px 32px",display:"flex",alignItems:"center",justifyContent:"center",minHeight:52 }}>
          <div className="ht-nav-inner" style={{ maxWidth:1200,width:"100%",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <button onClick={() => setMenuOpen(true)} style={{ background:"none",border:"none",color:"#fff",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"'Nunito',sans-serif",fontWeight:800,padding:"0 18px 0 0",borderRight:"1px solid rgba(255,255,255,0.3)",marginRight:18,height:44 }}>☰ Categorias</button>
            {CATEGORIAS.slice(0,5).map(({ slug, label }) => (
              <a key={slug} href="#" onClick={() => navigate(`/vitrine/${slug}`)}
                style={{ color:"#fff",textDecoration:"none",fontSize:14,fontWeight:700,padding:"0 16px",height:44,display:"flex",alignItems:"center" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background="none"}>{label}</a>
            ))}
          </div>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div style={{ maxWidth:1200,margin:"0 auto",padding:"16px 24px 0",fontSize:13,color:"#888",fontWeight:700 }}>
        <span style={{ cursor:"pointer",color:"#013F79" }} onClick={() => navigate("/")}>🏠 Início</span>
        {produto.categoria_slug && <>
          <span> › </span>
          <span style={{ cursor:"pointer",color:"#013F79" }} onClick={() => navigate(`/vitrine/${produto.categoria_slug}`)}>{produto.categoria}</span>
        </>}
        <span> › </span><span style={{ color:"#222" }}>{produto.nome}</span>
      </div>

      {/* Conteúdo principal */}
      <div className="prod-grid ht-page-content" style={{ maxWidth:1200,margin:"0 auto",padding:"24px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,alignItems:"start" }}>

        {/* Galeria */}
        <div>
          <div style={{ background:"#fff",borderRadius:16,overflow:"hidden",border:"1px solid #eee",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",minHeight:380 }}>
            <img src={imagens[imgAtiva]} alt={produto.nome} style={{ maxWidth:"100%",maxHeight:380,objectFit:"contain" }} />
          </div>
          {imagens.length > 1 && (
            <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
              {imagens.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setImgAtiva(i)}
                  style={{ width:64,height:64,objectFit:"cover",borderRadius:8,cursor:"pointer",border:i===imgAtiva?"2px solid #013F79":"2px solid #eee" }} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {produto.destaque && <span style={{ background:"#FFDF26",color:"#013F79",fontWeight:900,fontSize:12,padding:"4px 12px",borderRadius:20,marginBottom:12,display:"inline-block" }}>⭐ DESTAQUE</span>}
          <h1 style={{ margin:"0 0 8px",fontSize:26,fontWeight:900,color:"#013F79" }}>{produto.nome}</h1>
          <div style={{ marginBottom:8 }}><Estrelas n={produto.estrelas || 4} /></div>
          <div style={{ fontSize:28,fontWeight:900,color:"#12733A",marginBottom:4 }}>{preco_fmt}</div>
          <p style={{ fontSize:13,color:"#888",marginBottom:16 }}>à vista no PIX</p>

          {produto.descricao && (
            <p style={{ fontSize:14,color:"#444",lineHeight:1.6,marginBottom:20,background:"#f9f9f9",borderRadius:10,padding:16 }}>{produto.descricao}</p>
          )}

          {/* Quantidade */}
          <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:20 }}>
            <span style={{ fontWeight:800,fontSize:14,color:"#444" }}>Quantidade:</span>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <button onClick={() => setQtd(q => Math.max(1,q-1))} style={{ width:32,height:32,borderRadius:"50%",border:"2px solid #013F79",background:"#fff",color:"#013F79",fontSize:18,cursor:"pointer",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center" }}>−</button>
              <span style={{ fontSize:16,fontWeight:900,minWidth:24,textAlign:"center" }}>{qtd}</span>
              <button onClick={() => setQtd(q => Math.min(produto.estoque||99,q+1))} style={{ width:32,height:32,borderRadius:"50%",border:"2px solid #013F79",background:"#013F79",color:"#fff",fontSize:18,cursor:"pointer",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center" }}>+</button>
            </div>
            {produto.estoque !== undefined && <span style={{ fontSize:12,color:produto.estoque>0?"#12733A":"#c62828",fontWeight:700 }}>{produto.estoque>0?`${produto.estoque} em estoque`:"Esgotado"}</span>}
          </div>

          {/* Botão comprar */}
          <button onClick={handleAddToCart} disabled={produto.estoque===0}
            style={{ width:"100%",padding:"14px",background:adicionado?"#12733A":"#013F79",color:"#FFDF26",border:"none",borderRadius:12,fontWeight:900,fontSize:16,cursor:"pointer",transition:"background 0.2s",marginBottom:12 }}>
            {adicionado ? "✅ Adicionado ao carrinho!" : "🛒 Adicionar ao Carrinho"}
          </button>
          <button onClick={() => { handleAddToCart(); navigate("/finalizar"); }}
            style={{ width:"100%",padding:"14px",background:"#FFDF26",color:"#013F79",border:"none",borderRadius:12,fontWeight:900,fontSize:16,cursor:"pointer" }}>
            ⚡ Comprar Agora
          </button>

          {/* Cálculo de frete */}
          <div style={{ marginTop:20,background:"#f9f9f9",borderRadius:12,padding:16,border:"1px solid #eee" }}>
            <p style={{ margin:"0 0 10px",fontWeight:800,fontSize:14,color:"#444" }}>📦 Calcular frete</p>
            <div style={{ display:"flex",gap:8 }}>
              <input type="text" value={cep} onChange={e => setCep(e.target.value.replace(/\D/g,"").slice(0,8).replace(/(\d{5})(\d{1,3})/,"$1-$2"))}
                placeholder="00000-000" maxLength={9}
                style={{ flex:1,padding:"10px 14px",borderRadius:8,border:"1.5px solid #ddd",fontSize:14,outline:"none" }} />
            </div>
            {cepLoading && <p style={{ margin:"8px 0 0",fontSize:13,color:"#888" }}>Calculando...</p>}
            {cepErro   && <p style={{ margin:"8px 0 0",fontSize:13,color:"#c62828",fontWeight:700 }}>{cepErro}</p>}
            {frete!==null && !cepLoading && (
              <p style={{ margin:"8px 0 0",fontSize:14,fontWeight:800,color:"#12733A" }}>
                Frete: R$ {frete.toFixed(2).replace(".",",")} ({frete} km)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
