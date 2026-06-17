import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FundoLogin from "../assets/backsite.png";
import Logo from "../assets/Logo.png";

const API_URL = "http://localhost:3001";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleEntrar = async (e) => {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch(`${API_URL}/api/clientes/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErro(dados.mensagem || "Email ou senha incorretos.");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(dados.usuario));
      localStorage.setItem("token", dados.token);
      window.dispatchEvent(new Event("usuarioLogado"));
      navigate("/");
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
        .login-input::placeholder { color: #aaa; }
        .login-input:focus { border-color: #F8C131; box-shadow: 0 0 0 3px rgba(248,193,49,0.35); outline: none; }
        .login-btn-voltar:hover { filter: brightness(1.08); }
        .login-btn-entrar:hover { filter: brightness(1.08); }
        .login-link:hover { color: #F8C131; }
        @keyframes cardUp { from { opacity:0; transform:translateY(28px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
      `}</style>

      {/* Fundo escurecido */}
      <div style={styles.bg} />

      {/* Card */}
      <div style={styles.card}>
        {/* Logo */}
        <img src={Logo} alt="HarpyToys" style={styles.logo} />

        {/* Título */}
        <h1 style={styles.titulo}>Login</h1>

        <form onSubmit={handleEntrar} style={styles.form} noValidate>
          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={styles.input}
          />

          <input
            className="login-input"
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            style={styles.input}
          />

          {erro && <p style={styles.erro}>{erro}</p>}

          {/* Esqueceu a senha */}
          <button
            type="button"
            className="login-link"
            onClick={() => navigate("/esqueceu-senha")}
            style={styles.link}
          >
            Esqueceu a senha?
          </button>

          {/* Botões */}
          <div style={styles.botoes}>
            <button
              type="button"
              className="login-btn-voltar"
              onClick={() => navigate("/")}
              style={styles.btnVoltar}
            >
              VOLTAR
            </button>
            <button
              type="submit"
              className="login-btn-entrar"
              disabled={carregando}
              style={{ ...styles.btnEntrar, opacity: carregando ? 0.65 : 1 }}
            >
              {carregando ? "..." : "ENTRAR"}
            </button>
          </div>

          {/* Não tenho conta */}
          <button
            type="button"
            className="login-link"
            onClick={() => navigate("/Cadastro")}
            style={{ ...styles.link, marginTop: 18 }}
          >
            Não tenho Conta?
          </button>

        </form>
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
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
    width: "clamp(140px, 40vw, 250px)",
    height: "clamp(140px, 40vw, 250px)",
    objectFit: "contain",
    marginTop: -80,
    marginBottom: 8,
    filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.45))",
    borderRadius: "50%",
    
  },
  titulo: {
    color: "#F8C131",
    fontSize: "2rem",
    fontWeight: 900,
    letterSpacing: 4,
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
  link: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Nunito', sans-serif",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#4dd6a0",
    textDecoration: "underline",
    textUnderlineOffset: 3,
    padding: 0,
    marginBottom: 22,
    transition: "color 0.2s",
  },
  botoes: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    gap: 14,
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
    letterSpacing: 1,
    cursor: "pointer",
    boxShadow: "0 5px 0 #333",
    transition: "filter 0.15s, transform 0.15s",
  },
  btnEntrar: {
    flex: 1,
    padding: "13px 0",
    borderRadius: 10,
    border: "3px solid #333",
    background: "#F8C131",
    color: "#1a1a1a",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 900,
    fontSize: "1rem",
    letterSpacing: 1,
    cursor: "pointer",
    boxShadow: "0 5px 0 #333",
    transition: "filter 0.15s, transform 0.15s",
  },
};