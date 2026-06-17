import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Logo from "../assets/Logo.png";

const FALLBACK = "https://placehold.co/60x60/eee/999?text=Prod";

function formatCEP(v) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}
function formatPhone(v) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}
function formatCard(v) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatCPF(v) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function getUsuarioLogado() {
  try { return JSON.parse(localStorage.getItem("usuario")); } catch { return null; }
}

function getPedidosStorageKey(usuario) {
  const identificador = usuario?.id || usuario?.email || "visitante";
  return `harpy_pedidos_usuario_${identificador}`;
}

function salvarPedidoDoUsuario(usuario, pedido) {
  if (!usuario) return;
  const key = getPedidosStorageKey(usuario);
  let pedidosAtuais = [];

  try {
    pedidosAtuais = JSON.parse(localStorage.getItem(key)) || [];
    if (!Array.isArray(pedidosAtuais)) pedidosAtuais = [];
  } catch {
    pedidosAtuais = [];
  }

  localStorage.setItem(key, JSON.stringify([pedido, ...pedidosAtuais]));
}

// ── SUCCESS POPUP ──────────────────────────────────────────────────────────────
function SuccessPopup({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(1, 63, 121, 0.72)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.3s ease", padding: "16px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24,
        padding: "clamp(28px,5vw,52px) clamp(20px,5vw,48px) clamp(24px,4vw,44px)",
        maxWidth: 460, width: "100%",
        textAlign: "center",
        boxShadow: "0 24px 80px rgba(1,63,121,0.35)",
        animation: "popIn 0.4s cubic-bezier(.34,1.56,.64,1)",
        border: "4px solid #FFDF26",
      }}>
        <div style={{ fontSize: "clamp(40px,8vw,56px)", marginBottom: 16, lineHeight: 1 }}>🎉</div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#FFDF26", borderRadius: 50, padding: "6px 20px",
          marginBottom: 20,
        }}>
          <img src={Logo} alt="HarpyToys" style={{ width: 28, height: 28, objectFit: "contain" }} />
          <span style={{ fontWeight: 900, fontSize: "clamp(14px,3.5vw,18px)", color: "#12733A", fontFamily: "'Nunito', sans-serif" }}>
            Harpy<span style={{ color: "#013F79" }}>Toys</span>
          </span>
        </div>
        <h2 style={{
          margin: "0 0 12px",
          fontFamily: "'Nunito', sans-serif",
          fontSize: "clamp(18px,4.5vw,26px)", fontWeight: 900,
          color: "#013F79", lineHeight: 1.25,
        }}>
          Obrigado por Comprar<br />na HarpyToys! 🧸
        </h2>
        <p style={{
          color: "#555", fontSize: "clamp(13px,3vw,15px)", lineHeight: 1.6,
          margin: "0 0 28px", fontFamily: "'Nunito', sans-serif",
        }}>
          Seu pedido foi confirmado com sucesso.<br />
          Em breve você receberá uma confirmação por e-mail. 📧
        </p>
        <div style={{
          background: "#f0faf4", borderRadius: 12, padding: "14px 20px",
          marginBottom: 28, border: "1px solid #b6e8c8",
        }}>
          <p style={{ margin: 0, fontSize: 13, color: "#12733A", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
            🚚 Previsão de entrega: <strong>em até 2 dias úteis</strong>
          </p>
        </div>
        <button onClick={onClose} style={{
          background: "#12733A", color: "#fff",
          border: "none", borderRadius: 12,
          padding: "14px 40px", fontWeight: 900,
          fontSize: "clamp(14px,3.5vw,16px)", cursor: "pointer",
          fontFamily: "'Nunito', sans-serif", letterSpacing: 0.5,
          boxShadow: "0 4px 16px rgba(18,115,58,0.3)", width: "100%",
          transition: "transform 0.15s",
        }}>
          Continuar Comprando 🛍️
        </button>
      </div>
    </div>
  );
}

// ── CREDENTIAL CONFIRM MODAL ───────────────────────────────────────────────────
function CredentialModal({ nome, email, telefone, onConfirm, onEdit }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      background: "rgba(1,63,121,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.3s ease", padding: "16px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 20,
        padding: "clamp(24px,5vw,40px)",
        maxWidth: 440, width: "100%",
        boxShadow: "0 20px 60px rgba(1,63,121,0.3)",
        animation: "popIn 0.35s cubic-bezier(.34,1.56,.64,1)",
        border: "3px solid #FFDF26",
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🔐</div>
          <h2 style={{
            margin: 0, fontFamily: "'Nunito', sans-serif",
            fontSize: "clamp(16px,4vw,22px)", fontWeight: 900, color: "#013F79",
          }}>Confirme seus dados</h2>
          <p style={{ margin: "8px 0 0", color: "#666", fontSize: 13, fontFamily: "'Nunito', sans-serif" }}>
            Verifique se as informações estão corretas antes de prosseguir ao pagamento.
          </p>
        </div>

        <div style={{ background: "#f7f9fc", borderRadius: 12, padding: "16px 20px", marginBottom: 20, border: "1.5px solid #dde4ef" }}>
          {[
            { label: "Nome completo", value: nome, icon: "👤" },
            { label: "E-mail", value: email, icon: "📧" },
            { label: "Telefone", value: telefone, icon: "📱" },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #e8edf5" }}>
              <span style={{ fontSize: 18, marginTop: 1 }}>{row.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: "#888", fontWeight: 700, fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>{row.label}</div>
                <div style={{ fontSize: "clamp(13px,3.5vw,15px)", fontWeight: 800, color: "#222", fontFamily: "'Nunito', sans-serif", wordBreak: "break-all" }}>{row.value || <span style={{ color: "#bbb", fontStyle: "italic" }}>Não informado</span>}</div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingTop: 0 }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <div>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 700, fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>Segurança</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#12733A", fontFamily: "'Nunito', sans-serif" }}>Seus dados são protegidos com criptografia SSL</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onEdit} style={{
            flex: 1, padding: "13px 0",
            background: "#fff", color: "#013F79",
            border: "2px solid #013F79", borderRadius: 12,
            fontWeight: 800, fontSize: "clamp(13px,3vw,15px)", cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
          }}>
            ✏️ Editar
          </button>
          <button onClick={onConfirm} style={{
            flex: 2, padding: "13px 0",
            background: "#013F79", color: "#fff",
            border: "none", borderRadius: 12,
            fontWeight: 900, fontSize: "clamp(13px,3vw,15px)", cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
            boxShadow: "0 4px 16px rgba(1,63,121,0.3)",
          }}>
            Confirmar e ir ao pagamento →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FIELD ──────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, onBlur, placeholder, type = "text", required, readOnly }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", marginBottom: 5,
        fontSize: 13, fontWeight: 700, color: "#444",
        fontFamily: "'Nunito', sans-serif",
      }}>
        {label} {required && <span style={{ color: "#c00" }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: "100%", padding: "11px 14px",
          border: "2px solid #e0e0e0", borderRadius: 10,
          fontSize: 14, fontFamily: "'Nunito', sans-serif",
          outline: "none", boxSizing: "border-box",
          transition: "border-color 0.15s",
          background: readOnly ? "#f5f5f5" : "#fff",
          color: readOnly ? "#777" : "#222",
        }}
        onFocus={e => { if (!readOnly) e.target.style.borderColor = "#013F79"; }}
        onBlur={e => { e.target.style.borderColor = "#e0e0e0"; onBlur && onBlur(e); }}
      />
    </div>
  );
}

// ── SELECT ─────────────────────────────────────────────────────────────────────
function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", marginBottom: 5,
        fontSize: 13, fontWeight: 700, color: "#444",
        fontFamily: "'Nunito', sans-serif",
      }}>
        {label} {required && <span style={{ color: "#c00" }}>*</span>}
      </label>
      <select value={value} onChange={onChange} style={{
        width: "100%", padding: "11px 14px",
        border: "2px solid #e0e0e0", borderRadius: 10,
        fontSize: 14, fontFamily: "'Nunito', sans-serif",
        outline: "none", background: "#fff",
        transition: "border-color 0.15s",
      }}
        onFocus={e => e.target.style.borderColor = "#013F79"}
        onBlur={e => e.target.style.borderColor = "#e0e0e0"}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── PAY METHOD ─────────────────────────────────────────────────────────────────
function PayMethod({ label, icon, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "13px 18px", borderRadius: 12, width: "100%", marginBottom: 8,
      border: active ? "2px solid #013F79" : "2px solid #ddd",
      background: active ? "#013F79" : "#fff",
      color: active ? "#fff" : "#444",
      fontWeight: 800, fontSize: "clamp(13px,3.5vw,14px)", cursor: "pointer",
      fontFamily: "'Nunito', sans-serif", transition: "all 0.18s",
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      {label}
    </button>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function FinalizarPedido() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, totalPrice, clearCart } = useCart();
  const usuarioLogado = getUsuarioLogado();

  const directProduct = location.state?.product || null;
  const items = directProduct ? [{ ...directProduct, qty: 1 }] : cart;

  // parsePreco: aceita número puro (50.00) OU string brasileira ("R$ 1.299,90")
  function parsePreco(valor) {
    if (typeof valor === "number") return valor;
    let limpo = String(valor || "0").replace("R$", "").replace(/\s/g, "");
    if (/\d+\.\d{3},\d{2}/.test(limpo)) {
      limpo = limpo.replace(/\./g, "").replace(",", ".");
    } else if (limpo.includes(",")) {
      limpo = limpo.replace(",", ".");
    }
    return parseFloat(limpo) || 0;
  }

  const subtotal = directProduct
    ? parsePreco(directProduct.preco || directProduct.price)
    : totalPrice;

  const [frete, setFrete] = useState(0);
  const [calculandoFrete, setCalculandoFrete] = useState(false);

  // Endereço da HarpyToys — origem do frete
  const HARPY_ADDRESS = "Rua Guaipá, 678, Vila Leopoldina, São Paulo, SP";

  // Calcula frete por km usando Nominatim (OpenStreetMap) — sem API key
  const calcularFrete = useCallback(async (cepDestino) => {
    const digits = cepDestino.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCalculandoFrete(true);
    try {
      // Geocodifica destino via ViaCEP + Nominatim
      const viaCep = await fetch(`https://viacep.com.br/ws/${digits}/json/`).then(r => r.json());
      if (viaCep.erro) { setFrete(0); return; }

      const endDest = encodeURIComponent(`${viaCep.logradouro}, ${viaCep.localidade}, ${viaCep.uf}, Brasil`);
      const endOrigem = encodeURIComponent(HARPY_ADDRESS + ", Brasil");

      const [resOrig, resDest] = await Promise.all([
        fetch(`https://nominatim.openstreetmap.org/search?q=${endOrigem}&format=json&limit=1`, { headers: { "User-Agent": "HarpyToys/1.0" } }).then(r => r.json()),
        fetch(`https://nominatim.openstreetmap.org/search?q=${endDest}&format=json&limit=1`,   { headers: { "User-Agent": "HarpyToys/1.0" } }).then(r => r.json()),
      ]);

      if (!resOrig.length || !resDest.length) { setFrete(0); return; }

      const lat1 = parseFloat(resOrig[0].lat), lon1 = parseFloat(resOrig[0].lon);
      const lat2 = parseFloat(resDest[0].lat), lon2 = parseFloat(resDest[0].lon);

      // Fórmula de Haversine — distância em km
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
      const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      const valorFrete = Math.max(1, Math.round(km)); // R$ 1,00 por km, mínimo R$ 1,00
      setFrete(valorFrete);
    } catch {
      setFrete(0);
    } finally {
      setCalculandoFrete(false);
    }
  }, []);
  const total = subtotal + frete;
  const fmtPrice = n => "R$ " + n.toFixed(2).replace(".", ",");

  // ── FORM STATE ──────────────────────────────────────────────────────────────
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // Carrega dados do perfil e endereço cadastrado ao montar
  useEffect(() => {
    if (!usuarioLogado?.id) return;
    fetch(`http://localhost:3001/api/clientes/${usuarioLogado.id}`)
      .then(r => r.json())
      .then(dados => {
        if (dados.nome)     setNome(dados.nome);
        if (dados.email)    setEmail(dados.email);
        if (dados.telefone) setTelefone(formatPhone(dados.telefone));
        const end = dados.endereco;
        if (end) {
          if (end.cep)         setCep(end.cep.replace(/\D/g,"").replace(/(\d{5})(\d{3})/,"$1-$2"));
          if (end.numero)      setNumero(end.numero);
          if (end.complemento) setComplemento(end.complemento);
          if (end.nome_endereco) setDestinatario(end.nome_endereco);
        }
      })
      .catch(() => {});
  }, []);
  const [modoEntrega, setModoEntrega] = useState("casa");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [destinatarioOk, setDestinatarioOk] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [enderecoPreenchido, setEnderecoPreenchido] = useState(false);
  const [metodoPag, setMetodoPag] = useState("");
  const [numCartao, setNumCartao] = useState("");
  const [parcelas, setParcelas] = useState("");
  const [nomeCartao, setNomeCartao] = useState("");
  const [mesCartao, setMesCartao] = useState("");
  const [anoCartao, setAnoCartao] = useState("");
  const [cvv, setCvv] = useState("");
  const [cpfTitular, setCpfTitular] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [entregaCollapsed, setEntregaCollapsed] = useState(false);
  const [showPagamento, setShowPagamento] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [credenciaisConfirmadas, setCredenciaisConfirmadas] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── REAL CEP LOOKUP (ViaCEP) ────────────────────────────────────────────────
  const buscarCEP = useCallback(async (cepRaw) => {
    const digits = cepRaw.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    setCepError("");
    setLogradouro(""); setBairro(""); setCidade(""); setEstado("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado. Verifique e tente novamente.");
      } else {
        setLogradouro(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
      }
    } catch {
      setCepError("Erro ao buscar CEP. Verifique sua conexão.");
    } finally {
      setCepLoading(false);
    }
  }, []);

  useEffect(() => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    // Debounce: aguarda 400ms após o usuário parar de digitar
    const timer = setTimeout(() => {
      buscarCEP(digits);
      if (modoEntrega === "casa") calcularFrete(digits);
    }, 400);
    return () => clearTimeout(timer);
  }, [cep, buscarCEP]);

  // collapse entrega + show pagamento
  useEffect(() => {
    if (modoEntrega === "loja") {
      setEnderecoPreenchido(true);
    } else {
      const ok = cep.replace(/\D/g, "").length === 8
        && !cepError && logradouro.length > 0
        && numero.trim().length > 0
        && destinatarioOk;           // só avalia após sair do campo
      setEnderecoPreenchido(ok);
    }
  }, [cep, cepError, logradouro, numero, destinatarioOk, modoEntrega]);

  useEffect(() => {
    if (enderecoPreenchido) {
      setTimeout(() => { setEntregaCollapsed(true); }, 800);
    } else {
      setEntregaCollapsed(false);
      setShowPagamento(false);
      setCredenciaisConfirmadas(false);
    }
  }, [enderecoPreenchido]);

  // Confirm credentials handler
  const handleConfirmarCredenciais = () => {
    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      alert("Preencha nome, e-mail e telefone antes de continuar.");
      return;
    }
    setShowCredentialModal(true);
  };

  const handleCredentialConfirm = () => {
    setShowCredentialModal(false);
    setCredenciaisConfirmadas(true);
    setShowPagamento(true);
  };

  const handleFinalizar = async () => {
    if (!usuarioLogado) {
      alert("Faça login para finalizar o pedido.");
      navigate("/login");
      return;
    }
    if (!items.length) { alert("Seu carrinho está vazio."); return; }
    if (!aceitouTermos) { alert("Aceite os Termos de Uso para finalizar."); return; }
    if (!metodoPag) { alert("Selecione um método de pagamento."); return; }

    const totalFinal = modoEntrega === "loja" ? subtotal : total;

    const formaPagamentoBanco = {
      pix: "pix",
      boleto: "boleto",
      credito: "cartao_credito",
      debito: "cartao_debito",
    }[metodoPag] || "pix";

    const enderecoEntrega = {
      modo: modoEntrega,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      destinatario,
    };

    const itensPedido = items.map((item) => ({
      id: item.id,
      produto_id: item.id,
      nome: item.nome || item.name || "Produto",
      quantidade: item.qty || item.quantidade || 1,
      preco: parsePreco(item.preco || item.price || 0),
      imagem_url: item.imagem_url || item.img || null,
    }));

    try {
      const resposta = await fetch("http://localhost:3001/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente_id: usuarioLogado.id,
          forma_pagamento: formaPagamentoBanco,
          valor_total: totalFinal,
          valor_frete: modoEntrega === "loja" ? 0 : frete,
          endereco_entrega: enderecoEntrega,
          itens: itensPedido,
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        console.error("Erro ao salvar pedido:", resultado);
        alert(resultado.mensagem || "Erro ao salvar o pedido no banco de dados.");
        return;
      }

      setShowSuccess(true);
      if (!directProduct) clearCart();
    } catch (erro) {
      console.error("Erro de conexão ao salvar pedido:", erro);
      alert("Não foi possível conectar ao servidor para salvar o pedido.");
    }
  };

  const handleSuccessClose = () => { setShowSuccess(false); navigate("/"); };

  const meses = [{ value: "", label: "Mês" }, ...Array.from({ length: 12 }, (_, i) => { const m = String(i + 1).padStart(2, "0"); return { value: m, label: m }; })];
  const anos = [{ value: "", label: "Ano" }, ...Array.from({ length: 12 }, (_, i) => { const y = 2025 + i; return { value: String(y), label: String(y) }; })];
  const parcelasOpts = [{ value: "", label: "Em quantas parcelas deseja pagar?" }, ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: i === 0 ? `1x de ${fmtPrice(total)} (à vista)` : `${i + 1}x de ${fmtPrice(total / (i + 1))}` }))];

  const enderecoFull = [logradouro, bairro, cidade, estado].filter(Boolean).join(", ");

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: "#f3f4f6", minHeight: "100vh", margin: 0, padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes popIn { from { opacity:0; transform: scale(0.82) } to { opacity:1; transform: scale(1) } }
        @keyframes slideDown { from { opacity:0; transform: translateY(-10px) } to { opacity:1; transform: translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .fp-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 16px;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .fp-layout { grid-template-columns: 1fr; }
          .fp-sticky { position: static !important; }
        }

        .fp-header-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
        }
        .fp-steps { display: flex; align-items: center; gap: 0; }
        @media (max-width: 600px) {
          .fp-steps .step-label { display: none; }
          .fp-header-inner { gap: 8px; }
        }
        @media (max-width: 480px) {
          .fp-secure-badge { display: none; }
        }

        .fp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
        @media (max-width: 500px) {
          .fp-grid-2 { grid-template-columns: 1fr; gap: 0; }
        }

        .fp-grid-num { display: grid; grid-template-columns: 1fr 1.6fr; gap: 0 12px; }
        @media (max-width: 500px) {
          .fp-grid-num { grid-template-columns: 1fr; gap: 0; }
        }

        .fp-grid-mes { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; }

        .fp-entrega-toggle { display: flex; gap: 0; margin-bottom: 20px; border: 2px solid #013F79; border-radius: 12px; overflow: hidden; }
        .fp-entrega-toggle button { flex: 1; padding: 11px 0; border: none; font-weight: 800; font-size: clamp(12px,3vw,14px); cursor: pointer; font-family: 'Nunito', sans-serif; transition: all 0.18s; }

        .fp-card { background: #fff; border-radius: 16px; margin-bottom: 16px; border: 2px solid #e8e8e8; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
        .fp-card-head { padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0f0f0; }
        .fp-card-head h3 { margin: 0; font-weight: 900; font-size: clamp(14px,3.5vw,16px); color: #013F79; font-family: 'Nunito', sans-serif; display: flex; align-items: center; gap: 8px; }
        .fp-card-body { padding: 20px 22px; }
        @media (max-width: 400px) {
          .fp-card-body { padding: 16px 14px; }
          .fp-card-head { padding: 14px 14px; }
        }

        .cred-btn {
          width: 100%; padding: 14px 0;
          background: #013F79; color: #fff;
          border: none; border-radius: 12px;
          font-weight: 900; font-size: clamp(14px,3.5vw,16px); cursor: pointer;
          font-family: 'Nunito', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.18s; margin-top: 8px;
          box-shadow: 0 4px 16px rgba(1,63,121,0.25);
        }
        .cred-btn:hover { transform: scale(1.02); background: #012e5a; }
        .cred-confirmed { background: #12733A !important; box-shadow: 0 4px 16px rgba(18,115,58,0.25) !important; }
        .cred-confirmed:hover { background: #0e5a2d !important; }

        .btn-finalizar {
          width: 100%; padding: 15px 0;
          border: none; border-radius: 12px;
          font-weight: 900; font-size: clamp(14px,3.5vw,16px);
          font-family: 'Nunito', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.18s;
        }
        .btn-finalizar:not(:disabled):hover { transform: scale(1.02); }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: "#FFDF26", boxShadow: "0 3px 12px rgba(0,0,0,0.1)", position: "sticky", top: 0, zIndex: 500 }}>
        <div className="fp-header-inner">
          <button onClick={() => navigate("/")} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            fontWeight: 900, fontSize: "clamp(16px,4vw,21px)", color: "#12733A",
            fontFamily: "'Nunito', sans-serif", padding: 0,
          }}>
            <img src={Logo} alt="HarpyToys" style={{ width: "clamp(36px,7vw,48px)", height: "clamp(36px,7vw,48px)", objectFit: "contain" }} />
            <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
              Harpy<span style={{ color: "#013F79" }}>Toys</span>
            </span>
          </button>

          {/* Progress steps */}
          <div className="fp-steps">
            {[
              { label: "carrinho", done: true },
              { label: "identificação", active: true },
              { label: "pagamento", active: showPagamento },
            ].map((step, i) => (
              <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <div style={{ width: "clamp(20px,5vw,60px)", height: 2, background: step.done || step.active ? "#12733A" : "#ccc" }} />}
                <div style={{
                  width: "clamp(28px,5vw,36px)", height: "clamp(28px,5vw,36px)", borderRadius: "50%",
                  background: step.done ? "#12733A" : step.active ? "#013F79" : "#e0e0e0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "clamp(11px,2.5vw,16px)", color: "#fff", fontWeight: 900, flexShrink: 0,
                }}>
                  {step.done ? "✓" : i + 1}
                </div>
                <div className="step-label" style={{
                  fontSize: "clamp(9px,1.8vw,11px)", fontWeight: 700,
                  color: step.active || step.done ? "#013F79" : "#999",
                  marginLeft: 4, marginRight: 4, fontFamily: "'Nunito', sans-serif",
                }}>{step.label}</div>
              </div>
            ))}
          </div>

          <div className="fp-secure-badge" style={{
            background: "#013F79", color: "#fff", borderRadius: 8,
            padding: "6px 14px", fontSize: "clamp(9px,2vw,11px)", fontWeight: 800, letterSpacing: 0.5,
          }}>🔒 COMPRA SEGURA</div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="fp-layout">

        {/* ─── LEFT COLUMN ─── */}
        <div>

          {/* Dados Pessoais */}
          <div className="fp-card">
            <div className="fp-card-head"><h3>👤 Dados Pessoais</h3></div>
            <div className="fp-card-body">
              <div className="fp-grid-2">
                <Field label="Nome completo" value={nome} onChange={e => setNome(e.target.value)} placeholder="Digite o seu nome" required />
                <Field label="E-mail" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite o seu e-mail" type="email" required />
              </div>
              <Field label="Telefone" value={telefone} onChange={e => setTelefone(formatPhone(e.target.value))} placeholder="Informe o seu número" required />

              {/* ── CONFIRM CREDENTIALS BUTTON ── */}
              {!credenciaisConfirmadas ? (
                <button className="cred-btn" onClick={handleConfirmarCredenciais}>
                  🔐 Confirmar Dados e Continuar
                </button>
              ) : (
                <button className="cred-btn cred-confirmed" onClick={() => setShowCredentialModal(true)}>
                  ✅ Dados Confirmados — Alterar
                </button>
              )}
            </div>
          </div>

          {/* Entrega — só aparece se credenciais confirmadas */}
          {credenciaisConfirmadas && (
            <div className="fp-card" style={{ animation: "slideDown 0.4s" }}>
              <div className="fp-card-head" style={{ background: entregaCollapsed ? "#fafafa" : "#fff", borderBottom: entregaCollapsed ? "none" : "1px solid #f0f0f0" }}>
                <h3>📦 Entrega</h3>
                {entregaCollapsed && (
                  <button onClick={() => { setEntregaCollapsed(false); setShowPagamento(false); }} style={{
                    background: "none", border: "1px solid #013F79", color: "#013F79",
                    borderRadius: 8, padding: "4px 14px", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Nunito', sans-serif",
                  }}>Alterar</button>
                )}
              </div>

              {entregaCollapsed ? (
                <div className="fp-card-body" style={{ animation: "fadeIn 0.3s" }}>
                  {modoEntrega === "loja" ? (
                    <p style={{ margin: 0, fontSize: 14, color: "#444", fontFamily: "'Nunito', sans-serif" }}>
                      🏪 Retirar na loja — Rua Guaipá, 678 - Vila Leopoldina, SP
                    </p>
                  ) : (
                    <div>
                      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#222", fontFamily: "'Nunito', sans-serif" }}>{destinatario}</p>
                      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#555", fontFamily: "'Nunito', sans-serif" }}>
                        {logradouro && `${logradouro}, `}{numero} {complemento && `- ${complemento}`}
                      </p>
                      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#555", fontFamily: "'Nunito', sans-serif" }}>
                        {bairro && `${bairro} — `}{cidade}/{estado}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: "#555", fontFamily: "'Nunito', sans-serif" }}>
                        CEP {cep} · Em até 2 dias úteis
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="fp-card-body" style={{ animation: "slideDown 0.3s" }}>
                  <div className="fp-entrega-toggle">
                    {[{ id: "casa", label: "🏠 Receber em casa" }, { id: "loja", label: "🏪 Retirar na loja" }].map(opt => (
                      <button key={opt.id} onClick={() => setModoEntrega(opt.id)} style={{
                        background: modoEntrega === opt.id ? "#013F79" : "#fff",
                        color: modoEntrega === opt.id ? "#fff" : "#013F79",
                      }}>{opt.label}</button>
                    ))}
                  </div>

                  {modoEntrega === "casa" ? (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0 12px", alignItems: "end" }}>
                        <Field
                          label="CEP"
                          value={cep}
                          onChange={e => { setCep(formatCEP(e.target.value)); setCepError(""); }}
                          placeholder="00000-000"
                          required
                        />
                        <a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noreferrer"
                          style={{ fontSize: 12, color: "#013F79", fontWeight: 700, textDecoration: "underline", marginBottom: 18, whiteSpace: "nowrap" }}>
                          Não sei meu CEP
                        </a>
                      </div>

                      {cepLoading && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 13, color: "#666", fontFamily: "'Nunito', sans-serif" }}>
                          <div style={{ width: 16, height: 16, border: "2px solid #013F79", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                          Buscando endereço...
                        </div>
                      )}

                      {cepError && (
                        <div style={{ marginBottom: 14, padding: "10px 14px", background: "#fff0f0", borderRadius: 10, border: "1px solid #ffb3b3" }}>
                          <p style={{ margin: 0, fontSize: 13, color: "#c00", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>❌ {cepError}</p>
                        </div>
                      )}

                      {logradouro && !cepLoading && (
                        <div style={{ marginBottom: 14, padding: "12px 14px", background: "#f0faf4", borderRadius: 10, border: "1px solid #b6e8c8", animation: "slideDown 0.25s" }}>
                          <p style={{ margin: "0 0 2px", fontSize: 13, color: "#12733A", fontWeight: 800, fontFamily: "'Nunito', sans-serif" }}>📍 {logradouro}</p>
                          <p style={{ margin: 0, fontSize: 12, color: "#444", fontFamily: "'Nunito', sans-serif" }}>{bairro} — {cidade}/{estado}</p>
                        </div>
                      )}

                      {logradouro && !cepLoading && (
                        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#f8f8f8", borderRadius: 10, border: "2px solid #e0e0e0", animation: "slideDown 0.25s" }}>
                          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#444", fontFamily: "'Nunito', sans-serif" }}>Forma de entrega</p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #013F79", background: "#013F79", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#222", fontFamily: "'Nunito', sans-serif" }}>Em até 2 dias úteis</span>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#12733A", fontFamily: "'Nunito', sans-serif" }}>{calculandoFrete ? "Calculando..." : frete > 0 ? `R$ ${frete.toFixed(2).replace(".", ",")}` : "Informe o CEP"}</span>
                          </div>
                        </div>
                      )}

                      <div className="fp-grid-num">
                        <Field label="Número" value={numero} onChange={e => setNumero(e.target.value)} placeholder="Nº" required />
                        <Field label="Complemento e referência" value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Apto, Casa, etc..." />
                      </div>
                      <Field label="Destinatário" value={destinatario} onChange={e => { setDestinatario(e.target.value); setDestinatarioOk(false); }} onBlur={() => setDestinatarioOk(destinatario.trim().length > 0)} placeholder="Nome de quem vai receber" required />

                      {enderecoPreenchido && (
                        <button
                          onClick={() => setTimeout(() => setEntregaCollapsed(true), 100)}
                          style={{
                            width: "100%", padding: "13px 0",
                            background: "#12733A", color: "#fff",
                            border: "none", borderRadius: 12,
                            fontWeight: 900, fontSize: "clamp(13px,3.5vw,15px)", cursor: "pointer",
                            fontFamily: "'Nunito', sans-serif", marginTop: 4,
                            boxShadow: "0 4px 16px rgba(18,115,58,0.25)",
                          }}>
                          Usar este endereço ✓
                        </button>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: "16px", background: "#f0faf4", borderRadius: 12, border: "1px solid #b6e8c8" }}>
                      <p style={{ margin: "0 0 8px", fontWeight: 900, fontSize: 15, color: "#12733A", fontFamily: "'Nunito', sans-serif" }}>🏪 Loja HarpyToys</p>
                      <p style={{ margin: 0, fontSize: 13, color: "#444", fontFamily: "'Nunito', sans-serif" }}>
                        Rua Guaipá, 678 - Vila Leopoldina, São Paulo - SP, 05089-000<br />
                        Seg–Sex: 9h–18h · Sáb: 9h–13h
                      </p>
                      <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 700, color: "#12733A", fontFamily: "'Nunito', sans-serif" }}>
                        ✅ Disponível para retirada em até 1h
                      </p>
                      <button
                        onClick={() => setTimeout(() => setEntregaCollapsed(true), 100)}
                        style={{
                          marginTop: 14, width: "100%", padding: "12px 0",
                          background: "#12733A", color: "#fff",
                          border: "none", borderRadius: 10,
                          fontWeight: 900, fontSize: 14, cursor: "pointer",
                          fontFamily: "'Nunito', sans-serif",
                        }}>
                        Confirmar retirada ✓
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pagamento */}
          {showPagamento && (
            <div className="fp-card" style={{ animation: "slideDown 0.4s" }}>
              <div className="fp-card-head"><h3>💳 Pagamento</h3></div>
              <div className="fp-card-body">
                <PayMethod label="Pix" icon="⚡" active={metodoPag === "pix"} onClick={() => setMetodoPag(m => m === "pix" ? "" : "pix")} />
                <PayMethod label="Boleto Bancário" icon="🧾" active={metodoPag === "boleto"} onClick={() => setMetodoPag(m => m === "boleto" ? "" : "boleto")} />
                <PayMethod label="Cartão de crédito" icon="💳" active={metodoPag === "credito"} onClick={() => setMetodoPag(m => m === "credito" ? "" : "credito")} />

                {metodoPag === "credito" && (
                  <div style={{ marginTop: 16, animation: "slideDown 0.3s" }}>
                    <Field label="Número do cartão" value={numCartao} onChange={e => setNumCartao(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" required />
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                      {["VISA", "AMEX", "HIPER", "MASTER", "ELO"].map(b => (
                        <span key={b} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #ddd", fontSize: 11, fontWeight: 800, color: "#555", fontFamily: "'Nunito', sans-serif" }}>{b}</span>
                      ))}
                    </div>
                    <Select label="Parcelamentos disponíveis" value={parcelas} onChange={e => setParcelas(e.target.value)} options={parcelasOpts} required />
                    <Field label="Nome impresso no cartão" value={nomeCartao} onChange={e => setNomeCartao(e.target.value.toUpperCase())} placeholder="NOME NO CARTÃO" required />
                    <div className="fp-grid-mes">
                      <Select label="Mês" value={mesCartao} onChange={e => setMesCartao(e.target.value)} options={meses} required />
                      <Select label="Ano" value={anoCartao} onChange={e => setAnoCartao(e.target.value)} options={anos} required />
                    </div>
                    <Field label="Código de segurança" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="CVV" required />
                    <Field label="CPF do titular" value={cpfTitular} onChange={e => setCpfTitular(formatCPF(e.target.value))} placeholder="999.999.999-99" required />
                  </div>
                )}

                {metodoPag === "pix" && (
                  <div style={{ marginTop: 14, padding: "14px 16px", background: "#f0faf4", borderRadius: 10, border: "1px solid #b6e8c8", animation: "slideDown 0.3s" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#12733A", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
                      ⚡ Após clicar em "Finalizar Compra", você receberá o QR Code Pix por e-mail.
                    </p>
                  </div>
                )}
                {metodoPag === "boleto" && (
                  <div style={{ marginTop: 14, padding: "14px 16px", background: "#fff8e1", borderRadius: 10, border: "1px solid #ffe082", animation: "slideDown 0.3s" }}>
                    <p style={{ margin: 0, fontSize: 14, color: "#795548", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
                      🧾 O boleto será gerado após a confirmação do pedido e enviado para o seu e-mail. Prazo de vencimento: 3 dias úteis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN — Resumo ─── */}
        <div className="fp-sticky" style={{ position: "sticky", top: 90 }}>
          <div style={{
            background: "#fff", borderRadius: 16,
            border: "2px solid #e8e8e8",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden",
          }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #f0f0f0" }}>
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: "clamp(14px,3.5vw,16px)", color: "#013F79", fontFamily: "'Nunito', sans-serif" }}>
                🧾 Resumo da Compra
              </h3>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {items.map(item => {
                const nome = item.nome || item.name;
                const img = item.imagem_url || item.img || FALLBACK;
                return (
                  <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f5f5f5" }}>
                    <img src={img} alt={nome} onError={e => e.target.src = FALLBACK}
                      style={{ width: "clamp(44px,8vw,56px)", height: "clamp(44px,8vw,56px)", objectFit: "contain", borderRadius: 8, border: "1px solid #eee", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 3px", fontSize: "clamp(11px,2.5vw,12px)", fontWeight: 700, color: "#333", lineHeight: 1.3, fontFamily: "'Nunito', sans-serif", wordBreak: "break-word" }}>{nome}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#888", fontFamily: "'Nunito', sans-serif" }}>Vendido por HarpyToys</p>
                      {item.qty > 1 && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#013F79", fontWeight: 700 }}>Qtd: {item.qty}</p>}
                    </div>
                  </div>
                );
              })}

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: "#555", fontFamily: "'Nunito', sans-serif" }}>Subtotal</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#222", fontFamily: "'Nunito', sans-serif" }}>{fmtPrice(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, paddingBottom: 14, borderBottom: "2px solid #f0f0f0" }}>
                <span style={{ fontSize: 14, color: "#555", fontFamily: "'Nunito', sans-serif" }}>Entrega</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#222", fontFamily: "'Nunito', sans-serif" }}>{modoEntrega === "loja" ? "Grátis" : fmtPrice(frete)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 17, fontWeight: 900, color: "#013F79", fontFamily: "'Nunito', sans-serif" }}>Total</span>
                <span style={{ fontSize: 17, fontWeight: 900, color: "#12733A", fontFamily: "'Nunito', sans-serif" }}>
                  {fmtPrice(modoEntrega === "loja" ? subtotal : total)}
                </span>
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, cursor: "pointer" }}>
                <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)}
                  style={{ marginTop: 3, accentColor: "#013F79", width: 16, height: 16, flexShrink: 0 }} />
                <span style={{ fontSize: "clamp(11px,2.5vw,12px)", color: "#555", lineHeight: 1.5, fontFamily: "'Nunito', sans-serif" }}>
                  Li e aceito os{" "}
                  <a href="#" style={{ color: "#013F79", fontWeight: 700 }}>Termos de Uso</a>,{" "}
                  <a href="#" style={{ color: "#013F79", fontWeight: 700 }}>Políticas de Privacidade</a> e o{" "}
                  <a href="#" style={{ color: "#013F79", fontWeight: 700 }}>Regulamento do Fidelidade</a>.
                </span>
              </label>

              <button
                className="btn-finalizar"
                onClick={handleFinalizar}
                disabled={(() => {
                  if (!showPagamento || !aceitouTermos || !metodoPag) return true;
                  if (metodoPag === "credito") {
                    const cartaoOk = numCartao.replace(/\s/g,"").length === 16
                      && nomeCartao.trim().length > 0
                      && mesCartao && anoCartao
                      && cvv.length >= 3
                      && cpfTitular.replace(/\D/g,"").length === 11;
                    return !cartaoOk;
                  }
                  return false;
                })()}
                style={{
                  background: (() => {
                    if (!showPagamento || !aceitouTermos || !metodoPag) return "#ccc";
                    if (metodoPag === "credito") {
                      const cartaoOk = numCartao.replace(/\s/g,"").length === 16
                        && nomeCartao.trim().length > 0
                        && mesCartao && anoCartao
                        && cvv.length >= 3
                        && cpfTitular.replace(/\D/g,"").length === 11;
                      return cartaoOk ? "#12733A" : "#ccc";
                    }
                    return "#12733A";
                  })(),
                  color: "#fff",
                  cursor: (() => {
                    if (!showPagamento || !aceitouTermos || !metodoPag) return "not-allowed";
                    if (metodoPag === "credito") {
                      const cartaoOk = numCartao.replace(/\s/g,"").length === 16
                        && nomeCartao.trim().length > 0
                        && mesCartao && anoCartao
                        && cvv.length >= 3
                        && cpfTitular.replace(/\D/g,"").length === 11;
                      return cartaoOk ? "pointer" : "not-allowed";
                    }
                    return "pointer";
                  })(),
                  boxShadow: (() => {
                    if (!showPagamento || !aceitouTermos || !metodoPag) return "none";
                    if (metodoPag === "credito") {
                      const cartaoOk = numCartao.replace(/\s/g,"").length === 16
                        && nomeCartao.trim().length > 0
                        && mesCartao && anoCartao
                        && cvv.length >= 3
                        && cpfTitular.replace(/\D/g,"").length === 11;
                      return cartaoOk ? "0 4px 16px rgba(18,115,58,0.3)" : "none";
                    }
                    return "0 4px 16px rgba(18,115,58,0.3)";
                  })(),
                }}
              >
                🔒 finalizar compra
              </button>

              <p style={{ margin: "10px 0 0", fontSize: 11, color: "#888", textAlign: "center", lineHeight: 1.5, fontFamily: "'Nunito', sans-serif" }}>
                O seu pedido será entregue pela nossa loja parceira <strong>PBKids</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showCredentialModal && (
        <CredentialModal
          nome={nome}
          email={email}
          telefone={telefone}
          onConfirm={handleCredentialConfirm}
          onEdit={() => setShowCredentialModal(false)}
        />
      )}
      {showSuccess && <SuccessPopup onClose={handleSuccessClose} />}
    </div>
  );
}