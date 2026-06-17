// backend/routes/auth.funcionarios.js
// Rotas do sistema de gestão — tabela: usuarios_sistema
const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const pool    = require("../db/connection");
const { apenasAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/funcionarios/login
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ mensagem: "Email e senha são obrigatórios." });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios_sistema WHERE email = ? AND ativo = 1 LIMIT 1",
      [email.trim().toLowerCase()]
    );

    if (!rows.length)
      return res.status(401).json({ mensagem: "Email ou senha incorretos." });

    const usuario = rows[0];

    if (!await bcrypt.compare(senha, usuario.senha_hash))
      return res.status(401).json({ mensagem: "Email ou senha incorretos." });

    await pool.query(
      "UPDATE usuarios_sistema SET ultimo_acesso = NOW() WHERE id = ?",
      [usuario.id]
    );

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  } catch (err) {
    console.error("Erro login:", err);
    return res.status(500).json({ mensagem: "Erro interno." });
  }
});

// POST /api/funcionarios/cadastro — apenas admin pode cadastrar
router.post("/cadastro", apenasAdmin, async (req, res) => {
  const { nome, email, senha, perfil } = req.body;
  const perfisValidos = ["admin", "estoque", "vendedor", "suporte"];

  if (!nome || !email || !senha || !perfil)
    return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });

  if (!perfisValidos.includes(perfil))
    return res.status(400).json({ mensagem: "Perfil inválido." });

  try {
    const [existe] = await pool.query(
      "SELECT id FROM usuarios_sistema WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );
    if (existe.length)
      return res.status(409).json({ mensagem: "Email já cadastrado." });

    const hash = await bcrypt.hash(senha, 10);
    await pool.query(
      "INSERT INTO usuarios_sistema (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)",
      [nome.trim(), email.trim().toLowerCase(), hash, perfil]
    );

    return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso." });
  } catch (err) {
    console.error("Erro cadastro:", err);
    return res.status(500).json({ mensagem: "Erro interno." });
  }
});

// GET /api/funcionarios — lista todos (apenas admin)
// Admin NÃO aparece listado para si mesmo; admin não pode excluir outros admins
router.get("/", apenasAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nome, email, perfil, ativo, data_cadastro
       FROM usuarios_sistema
       WHERE perfil != 'admin'
       ORDER BY id DESC`
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro ao buscar usuários." });
  }
});

// PUT /api/funcionarios/:id — editar dados (apenas admin)
router.put("/:id", apenasAdmin, async (req, res) => {
  const { nome, email, perfil } = req.body;
  const perfisValidos = ["estoque", "vendedor", "suporte"]; // admin não pode promover para admin aqui

  if (perfil && !perfisValidos.includes(perfil))
    return res.status(400).json({ mensagem: "Não é possível atribuir perfil admin por esta rota." });

  try {
    // Garante que não está tentando editar outro admin
    const [alvo] = await pool.query(
      "SELECT perfil FROM usuarios_sistema WHERE id = ?",
      [req.params.id]
    );
    if (!alvo.length) return res.status(404).json({ mensagem: "Usuário não encontrado." });
    if (alvo[0].perfil === "admin")
      return res.status(403).json({ mensagem: "Não é possível editar outro administrador." });

    await pool.query(
      "UPDATE usuarios_sistema SET nome = ?, email = ?, perfil = ? WHERE id = ?",
      [nome, email, perfil, req.params.id]
    );
    return res.json({ mensagem: "Usuário atualizado." });
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro ao atualizar." });
  }
});

// PUT /api/funcionarios/status/:id — ativar/desativar (apenas admin, não-admins)
router.put("/status/:id", apenasAdmin, async (req, res) => {
  const { ativo } = req.body;

  try {
    const [alvo] = await pool.query(
      "SELECT perfil FROM usuarios_sistema WHERE id = ?",
      [req.params.id]
    );
    if (!alvo.length) return res.status(404).json({ mensagem: "Usuário não encontrado." });
    if (alvo[0].perfil === "admin")
      return res.status(403).json({ mensagem: "Não é possível bloquear outro administrador." });

    await pool.query(
      "UPDATE usuarios_sistema SET ativo = ? WHERE id = ?",
      [ativo ? 1 : 0, req.params.id]
    );
    return res.json({ mensagem: "Status atualizado." });
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro ao atualizar status." });
  }
});

// DELETE /api/funcionarios/:id — excluir usuário não-admin (apenas admin)
router.delete("/:id", apenasAdmin, async (req, res) => {
  try {
    const [alvo] = await pool.query(
      "SELECT perfil FROM usuarios_sistema WHERE id = ?",
      [req.params.id]
    );
    if (!alvo.length) return res.status(404).json({ mensagem: "Usuário não encontrado." });
    if (alvo[0].perfil === "admin")
      return res.status(403).json({ mensagem: "Não é possível excluir um administrador." });

    await pool.query("DELETE FROM usuarios_sistema WHERE id = ?", [req.params.id]);
    return res.json({ mensagem: "Usuário excluído." });
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro ao excluir." });
  }
});

module.exports = router;
