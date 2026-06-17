// backend/routes/auth.clientes.js
// Rotas de autenticação do site e-commerce (tabela: clientes)
const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const crypto  = require("crypto");
const pool    = require("../db/connection");
const autenticar = require("../middleware/auth");

const router = express.Router();

// POST /api/clientes/login
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ mensagem: "Email e senha são obrigatórios." });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM clientes WHERE email = ? AND ativo = 1 LIMIT 1",
      [email.trim().toLowerCase()]
    );
    if (!rows.length)
      return res.status(401).json({ mensagem: "Email ou senha incorretos." });

    const cliente = rows[0];
    if (!await bcrypt.compare(senha, cliente.senha_hash))
      return res.status(401).json({ mensagem: "Email ou senha incorretos." });

    await pool.query("UPDATE clientes SET ultimo_acesso = NOW() WHERE id = ?", [cliente.id]);

    const token = jwt.sign(
      { id: cliente.id, nome: cliente.nome, email: cliente.email, tipo: "cliente" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      usuario: { id: cliente.id, nome: cliente.nome, email: cliente.email, foto_url: cliente.foto_url || null },
    });
  } catch (err) {
    console.error("Erro login cliente:", err);
    return res.status(500).json({ mensagem: "Erro interno." });
  }
});

// POST /api/clientes/cadastro
router.post("/cadastro", async (req, res) => {
  const { nome, email, senha, telefone } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ mensagem: "Nome, email e senha são obrigatórios." });
  if (senha.length < 6)
    return res.status(400).json({ mensagem: "A senha deve ter no mínimo 6 caracteres." });

  try {
    const [existe] = await pool.query(
      "SELECT id FROM clientes WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );
    if (existe.length)
      return res.status(409).json({ mensagem: "Este email já está cadastrado." });

    const hash = await bcrypt.hash(senha, 12);
    const [result] = await pool.query(
      "INSERT INTO clientes (nome, email, senha_hash, telefone) VALUES (?, ?, ?, ?)",
      [nome.trim(), email.trim().toLowerCase(), hash, telefone || null]
    );

    const token = jwt.sign(
      { id: result.insertId, nome: nome.trim(), email: email.trim().toLowerCase(), tipo: "cliente" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      usuario: { id: result.insertId, nome: nome.trim(), email: email.trim().toLowerCase(), foto_url: null },
    });
  } catch (err) {
    console.error("Erro cadastro cliente:", err);
    return res.status(500).json({ mensagem: "Erro interno." });
  }
});

// POST /api/clientes/recuperar-senha
router.post("/recuperar-senha", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ mensagem: "Email é obrigatório." });

  try {
    const [rows] = await pool.query(
      "SELECT id FROM clientes WHERE email = ? AND ativo = 1 LIMIT 1",
      [email.trim().toLowerCase()]
    );
    // Sempre retorna sucesso para não revelar se o email existe
    if (!rows.length) return res.json({ mensagem: "Se o email existir, enviaremos as instruções." });

    const token = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await pool.query(
      `INSERT INTO tokens_recuperacao (cliente_id, token, expira_em)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = VALUES(token), expira_em = VALUES(expira_em), usado = 0`,
      [rows[0].id, token, expira]
    );

    // Em produção: enviar email com o link
    console.log(`[DEV] Link recuperação: http://localhost:5173/redefinir-senha?token=${token}`);
    return res.json({ mensagem: "Se o email existir, enviaremos as instruções." });
  } catch (err) {
    console.error("Erro recuperar senha:", err);
    return res.status(500).json({ mensagem: "Erro interno." });
  }
});

// POST /api/clientes/redefinir-senha
router.post("/redefinir-senha", async (req, res) => {
  const { token, novaSenha } = req.body;
  if (!token || !novaSenha)
    return res.status(400).json({ mensagem: "Token e nova senha são obrigatórios." });
  if (novaSenha.length < 6)
    return res.status(400).json({ mensagem: "Mínimo 6 caracteres." });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM tokens_recuperacao WHERE token = ? AND usado = 0 AND expira_em > NOW() LIMIT 1",
      [token]
    );
    if (!rows.length)
      return res.status(400).json({ mensagem: "Token inválido ou expirado." });

    const hash = await bcrypt.hash(novaSenha, 12);
    await pool.query("UPDATE clientes SET senha_hash = ? WHERE id = ?", [hash, rows[0].cliente_id]);
    await pool.query("UPDATE tokens_recuperacao SET usado = 1 WHERE id = ?", [rows[0].id]);

    return res.json({ mensagem: "Senha redefinida com sucesso!" });
  } catch (err) {
    console.error("Erro redefinir senha:", err);
    return res.status(500).json({ mensagem: "Erro interno." });
  }
});

module.exports = router;

// PUT /api/clientes/perfil — atualiza dados do próprio cliente (requer login)
router.put("/perfil", autenticar, async (req, res) => {
  const { nome, email, telefone, senha } = req.body;
  if (!nome || !email)
    return res.status(400).json({ mensagem: "Nome e email são obrigatórios." });

  try {
    // Garante que o email não pertence a outro cliente
    const [existe] = await pool.query(
      "SELECT id FROM clientes WHERE email = ? AND id != ? LIMIT 1",
      [email.trim().toLowerCase(), req.usuario.id]
    );
    if (existe.length)
      return res.status(409).json({ mensagem: "Este email já está em uso por outra conta." });

    if (senha) {
      if (senha.length < 6)
        return res.status(400).json({ mensagem: "A senha deve ter no mínimo 6 caracteres." });
      const hash = await bcrypt.hash(senha, 12);
      await pool.query(
        "UPDATE clientes SET nome = ?, email = ?, telefone = ?, senha_hash = ? WHERE id = ?",
        [nome.trim(), email.trim().toLowerCase(), telefone || null, hash, req.usuario.id]
      );
    } else {
      await pool.query(
        "UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?",
        [nome.trim(), email.trim().toLowerCase(), telefone || null, req.usuario.id]
      );
    }

    return res.json({ mensagem: "Dados atualizados com sucesso." });
  } catch (err) {
    console.error("Erro atualizar perfil:", err);
    return res.status(500).json({ mensagem: "Erro interno." });
  }
});

// DELETE /api/clientes/me — desativa a própria conta (soft delete)
// Mantém o registro e o histórico de pedidos, apenas marca ativo = 0.
// O login passa a falhar (WHERE ativo = 1), mas os pedidos antigos
// continuam vinculados normalmente via cliente_id.
router.delete("/me", autenticar, async (req, res) => {
  try {
    await pool.query("UPDATE clientes SET ativo = 0 WHERE id = ?", [req.usuario.id]);
    return res.json({ mensagem: "Conta desativada com sucesso." });
  } catch (err) {
    console.error("Erro desativar conta:", err);
    return res.status(500).json({ mensagem: "Erro ao desativar conta." });
  }
});

// GET /api/clientes/:id — dados do cliente + endereço principal
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, email, telefone, foto_url FROM clientes WHERE id = ? AND ativo = 1 LIMIT 1",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ mensagem: "Cliente não encontrado." });

    const [enderecos] = await pool.query(
      "SELECT * FROM enderecos WHERE cliente_id = ? ORDER BY principal DESC LIMIT 1",
      [req.params.id]
    );

    return res.json({ ...rows[0], endereco: enderecos[0] || null });
  } catch (err) {
    console.error("Erro buscar cliente:", err);
    return res.status(500).json({ mensagem: "Erro interno." });
  }
});
