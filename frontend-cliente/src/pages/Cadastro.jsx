import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";
import FundoCadastro from "../assets/backcadastro1.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "", email: "", ddd: "", telefone: "", senha: "", confirma: "",
  });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handle = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const handleCadastrar = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.nome || !form.email || !form.senha || !form.confirma) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    if (form.senha !== form.confirma) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (form.senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setCarregando(true);
    try {
      const telefoneCompleto = form.ddd
        ? `(${form.ddd}) ${form.telefone}`
        : form.telefone;

      const res = await fetch(`${API_URL}/api/clientes/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          telefone: telefoneCompleto,
          senha: form.senha,
        }),
      });

      const dados = await res.json();

      if (!res.ok) {
        setErro(dados.mensagem || "Erro ao cadastrar.");
        return;
      }

      // Loga automaticamente após cadastro
      localStorage.setItem("usuario", JSON.stringify(dados.usuario));
      localStorage.setItem("token", dados.token);
      window.dispatchEvent(new Event("usuarioLogado"));
      navigate("/");
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }

        .cad-input { transition: border-color 0.2s, box-shadow 0.2s; }
        .cad-input:focus {
          outline: none;
          border-color: #FCD900;
          box-shadow: 0 0 0 3px rgba(252,217,0,0.3);
        }
        .cad-input::placeholder { color: #8899aa; }

        .btn-voltar { transition: filter 0.15s, transform 0.12s; }
        .btn-voltar:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .btn-voltar:active { transform: translateY(1px); }

        .btn-cadastrar { transition: filter 0.15s, transform 0.12s; }
        .btn-cadastrar:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
        .btn-cadastrar:active:not(:disabled) { transform: translateY(1px); }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── LADO ESQUERDO — imagem + logo ── */}
      <div className="cad-left" style={s.left}>
        <img src={FundoCadastro} alt="" style={s.bgImg} />
        <div style={s.leftOverlay} />

        {/* Logo no canto superior esquerdo */}
        <div style={s.logoWrap}>
          <img src={Logo} alt="HarpyToys" style={s.logo} />
        </div>
      </div>

      {/* ── LADO DIREITO — formulário ── */}
      <div className="cad-right" style={s.right}>
        <div style={s.card}>
          {/* Título */}
          <div style={s.tituloWrap}>
            <h1 style={s.titulo}>Cadastre-se e seja Bem Vindo</h1>
          </div>

          <form onSubmit={handleCadastrar} style={s.form} noValidate>

            {/* Nome */}
            <div className="cad-row" style={s.row}>
              <label style={s.label}>Nome:</label>
              <input
                className="cad-input"
                type="text"
                placeholder="Seu nome completo"
                value={form.nome}
                onChange={handle("nome")}
                style={s.input}
              />
            </div>

            {/* Email */}
            <div className="cad-row" style={s.row}>
              <label style={s.label}>Email:</label>
              <input
                className="cad-input"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handle("email")}
                style={s.input}
              />
            </div>

            {/* Telefone */}
            <div className="cad-row" style={s.row}>
              <label style={s.label}>Telefone:</label>
              <div style={s.telWrap}>
                <input
                  className="cad-input"
                  type="text"
                  placeholder="DDD"
                  value={form.ddd}
                  onChange={handle("ddd")}
                  maxLength={2}
                  style={{ ...s.input, width: 64, textAlign: "center", flexShrink: 0 }}
                />
                <input
                  className="cad-input"
                  type="text"
                  placeholder="00000-0000"
                  value={form.telefone}
                  onChange={handle("telefone")}
                  maxLength={9}
                  style={{ ...s.input, flex: 1 }}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="cad-row" style={s.row}>
              <label style={s.label}>Senha:</label>
              <input
                className="cad-input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={handle("senha")}
                style={s.input}
              />
            </div>

            {/* Confirma */}
            <div className="cad-row" style={s.row}>
              <label style={s.label}>Confirma:</label>
              <input
                className="cad-input"
                type="password"
                placeholder="Repita a senha"
                value={form.confirma}
                onChange={handle("confirma")}
                style={{
                  ...s.input,
                  borderColor: form.confirma && form.confirma !== form.senha
                    ? "#ff4d4d" : "#1a5fa8",
                }}
              />
            </div>

            {/* Erro */}
            {erro && <p style={s.erro}>{erro}</p>}

            {/* Botões */}
            <div style={s.botoes}>
              <button
                type="button"
                className="btn-voltar"
                onClick={() => navigate("/login")}
                style={s.btnVoltar}
              >
                VOLTAR
              </button>
              <button
                type="submit"
                className="btn-cadastrar"
                disabled={carregando}
                style={{ ...s.btnCadastrar, opacity: carregando ? 0.65 : 1 }}
              >
                {carregando ? "..." : "CADASTRAR"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Nunito', sans-serif",
  },

  // Lado esquerdo
  left: {
    position: "relative",
    width: "48%",
    flexShrink: 0,
    overflow: "hidden",
  },
  bgImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
  },
  leftOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, rgba(252,217,0,0.18) 0%, rgba(1,62,121,0.22) 100%)",
  },
  logoWrap: {
    position: "absolute",
    top: 16,
    left: 28,
    zIndex: 2,
    animation: "fadeUp 0.6s ease both",
  },
  logo: {
    width: "clamp(180px, 45vw, 350px)",
    height: "auto",
    objectFit: "contain",
    filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.35))",
  },

  // Lado direito
  right: {
    flex: 1,
    background: "#013E79",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 48px",
    borderLeft: "4px solid #14743C",
    animation: "slideIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
  },
  card: {
    width: "100%",
    maxWidth: 680,
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },

  // Título
  tituloWrap: {
    border: "2.5px solid #FCD900",
    borderRadius: 40,
    padding: "14px 28px",
    marginBottom: 36,
    textAlign: "center",
  },
  titulo: {
    color: "#fff",
    fontSize: "1.35rem",
    fontWeight: 800,
    letterSpacing: 0.5,
  },

  // Form rows
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 26,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  label: {
    color: "#fff",
    fontWeight: 800,
    fontSize: "1.15rem",
    width: "clamp(70px, 22vw, 110px)",
    textAlign: "right",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: "13px 16px",
    borderRadius: 8,
    border: "2px solid #1a5fa8",
    background: "#fff",
    fontSize: "1.05rem",
    fontFamily: "'Nunito', sans-serif",
    color: "#1a1a1a",
  },
  telWrap: {
    flex: 1,
    display: "flex",
    gap: 10,
  },

  // Erro
  erro: {
    color: "#ff6b6b",
    fontWeight: 700,
    fontSize: "0.88rem",
    background: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "8px 16px",
    textAlign: "center",
  },

  // Botões
  botoes: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 10,
  },
  btnVoltar: {
    flex: 1,
    padding: "13px 0",
    borderRadius: 30,
    border: "2.5px solid rgb(252, 217, 0)",
    background: "rgb(252, 217, 0)",
    color: "#000000",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 900,
    fontSize: "0.95rem",
    letterSpacing: 1.5,
    cursor: "pointer",
  },
  btnCadastrar: {
    flex: 1,
    padding: "13px 0",
    borderRadius: 30,
    border: "2.5px solid #14743C",
    background: "#14743C",
    color: "#fff",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 900,
    fontSize: "0.95rem",
    letterSpacing: 1.5,
    cursor: "pointer",
  },
};