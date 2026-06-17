import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FundoLogin from "../assets/backsite.png";
import Logo from "../assets/Logo.png";

const API_URL = "http://localhost:3001";

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleRedefinir = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!novaSenha || !confirmar) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmar) {
      setErro("As senhas nao coincidem.");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A senha deve ter no minimo 6 caracteres.");
      return;
    }

    if (!token) {
      setErro("Token invalido. Solicite um novo link de recuperacao.");
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch(`${API_URL}/api/clientes/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErro(dados.mensagem || "Erro ao redefinir senha.");
        return;
      }

      setMensagem(dados.mensagem + " Redirecionando para o login...");
      setTimeout(() => navigate("/login"), 2500);
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
        .rec-btn:hover { filter: brightness(1.08); }
        @keyframes cardUp { from { opacity:0; transform:translateY(28px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
      `}</style>

      <div style={styles.bg} />

      <div style={styles.card}>
        <img src={Logo} alt="HarpyToys" style={styles.logo} />
        <h1 style={styles.titulo}>Nova Senha</h1>

        <form onSubmit={handleRedefinir} style={styles.form} noValidate>
          <input
            className="rec-input"
            type="password"
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            style={styles.input}
          />
          <input
            className="rec-input"
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
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
              {carregando ? "..." : "SALVAR"}
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
    marginBottom: 22,
    textShadow: "2px 2px 0 #0065D0",
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
