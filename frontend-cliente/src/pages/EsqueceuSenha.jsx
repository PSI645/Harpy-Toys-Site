import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FundoLogin from "../assets/backsite.png";
import Logo from "../assets/Logo.png";

const API_URL = "http://localhost:3001";

export default function EsqueceuSenha() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("email");
  const [valor, setValor] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleEnviar = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!valor.trim()) {
      setErro(`Preencha o ${tipo === "email" ? "email" : "telefone"}.`);
      return;
    }

    setCarregando(true);
    try {
      const body = tipo === "email" ? { email: valor } : { telefone: valor };

      const res = await fetch(`${API_URL}/api/clientes/recuperar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErro(dados.mensagem || "Erro ao processar solicitacao.");
        return;
      }

      setMensagem(dados.mensagem);
    } catch {
      setErro("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        .rec-input::placeholder { color: #aaa; }
        .rec-input:focus { border-color: #F8C131; box-shadow: 0 0 0 3px rgba(248,193,49,0.35); outline: none; }
        .rec-tab { cursor: pointer; transition: background 0.2s, color 0.2s; }
        .rec-tab:hover { filter: brightness(1.08); }
        .rec-btn:hover { filter: brightness(1.08); }
        @keyframes cardUp { from { opacity:0; transform:translateY(28px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
      `}</style>

      <div style={styles.bg} />

      <div style={styles.card}>
        <img src={Logo} alt="HarpyToys" style={styles.logo} />
        <h1 style={styles.titulo}>Recuperar Senha</h1>

        <div style={styles.abas}>
          {["email", "telefone"].map((t) => (
            <button
              key={t}
              className="rec-tab"
              type="button"
              onClick={() => { setTipo(t); setValor(""); setErro(""); setMensagem(""); }}
              style={{
                ...styles.aba,
                background: tipo === t ? "#F8C131" : "rgba(255,255,255,0.1)",
                color:      tipo === t ? "#1a1a1a" : "#fff",
                fontWeight: tipo === t ? 900 : 700,
              }}
            >
              {t === "email" ? "Email" : "Telefone"}
            </button>
          ))}
        </div>

        <form onSubmit={handleEnviar} style={styles.form} noValidate>
          <input
            className="rec-input"
            type={tipo === "email" ? "email" : "tel"}
            placeholder={tipo === "email" ? "Seu email cadastrado" : "Seu telefone (ex: 11999999999)"}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            style={styles.input}
          />

          {erro     && <p style={styles.erro}>{erro}</p>}
          {mensagem && <p style={styles.sucesso}>{mensagem}</p>}

          <div style={styles.botoes}>
            <button
              type="button"
              className="rec-btn"
              onClick={() => navigate("/login")}
              style={styles.btnVoltar}
            >
              VOLTAR
            </button>
            <button
              type="submit"
              className="rec-btn"
              disabled={carregando}
              style={{ ...styles.btnEnviar, opacity: carregando ? 0.65 : 1 }}
            >
              {carregando ? "..." : "ENVIAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Nunito', sans-serif",
    overflow: "hidden",
  },
  bg: {
    position: "absolute",
    inset: 0,
    background: `url(${FundoLogin}) center/cover no-repeat`,
    filter: "brightness(0.7)",
    zIndex: 0,
  },
  card: {
    position: "relative",
    zIndex: 1,
    background: "#12723A",
    border: "4px solid #0065D0",
    borderRadius: 28,
    padding: "36px 48px 40px",
    width: "min(600px, 92vw)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 12px 48px rgba(0,0,0,0.55)",
    animation: "cardUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
  },
  logo: {
    width: "clamp(120px, 35vw, 200px)",
    height: "clamp(120px, 35vw, 200px)",
    objectFit: "contain",
    marginTop: -70,
    marginBottom: 8,
    filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.45))",
    borderRadius: "50%",
  },
  titulo: {
    color: "#F8C131",
    fontSize: "1.8rem",
    fontWeight: 900,
    letterSpacing: 3,
    marginBottom: 18,
    textShadow: "2px 2px 0 #0065D0",
  },
  abas: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
    width: "80%",
  },
  aba: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 10,
    border: "2.5px solid #0065D0",
    fontFamily: "'Nunito', sans-serif",
    fontSize: "0.95rem",
    transition: "background 0.2s",
  },
  form: {
    width: "80%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "13px 18px",
    border: "2.5px solid #0065D0",
    borderRadius: 10,
    fontSize: "1rem",
    fontFamily: "'Nunito', sans-serif",
    background: "#fff",
    color: "#333",
    textAlign: "center",
    marginBottom: 14,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  erro: {
    color: "#ff4d4d",
    fontSize: "0.87rem",
    fontWeight: 700,
    background: "rgba(255,255,255,0.13)",
    borderRadius: 8,
    padding: "6px 14px",
    marginBottom: 8,
    textAlign: "center",
    width: "100%",
  },
  sucesso: {
    color: "#4dd6a0",
    fontSize: "0.87rem",
    fontWeight: 700,
    background: "rgba(255,255,255,0.13)",
    borderRadius: 8,
    padding: "6px 14px",
    marginBottom: 8,
    textAlign: "center",
    width: "100%",
  },
  botoes: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    gap: 14,
    marginTop: 6,
  },
  btnVoltar: {
    flex: 1,
    padding: "13px 0",
    borderRadius: 10,
    border: "3px solid #333",
    background: "#F8C131",
    color: "#1a1a1a",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 900,
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 5px 0 #333",
    textDecoration: "underline",
  },
  btnEnviar: {
    flex: 1,
    padding: "13px 0",
    borderRadius: 10,
    border: "3px solid #333",
    background: "#F8C131",
    color: "#1a1a1a",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 900,
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 5px 0 #333",
  },
};
