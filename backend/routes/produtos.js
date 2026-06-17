// backend/routes/produtos.js
const express = require("express");
const path    = require("path");
const fs      = require("fs");
const pool    = require("../db/connection");
const { apenasEstoque } = require("../middleware/auth");
const upload  = require("../middleware/upload");

const router = express.Router();

// ── E-COMMERCE (público) ──────────────────────────────────────────────────────

// GET /api/produtos?categoria=slug
// Busca tanto na categoria principal quanto na categoria secundária (etiqueta)
router.get("/", async (req, res) => {
  const { categoria } = req.query;
  try {
    let query = `
      SELECT p.id, p.nome, p.preco, p.imagem_url, p.descricao,
             p.estoque, p.destaque, p.em_oferta, p.desconto_percentual,
             p.categoria_id, p.categoria_secundaria_id,
             c.nome AS categoria, c.slug AS categoria_slug,
             c2.nome AS categoria_secundaria, c2.slug AS categoria_secundaria_slug
      FROM produtos p
      LEFT JOIN categorias c  ON c.id  = p.categoria_id
      LEFT JOIN categorias c2 ON c2.id = p.categoria_secundaria_id
      WHERE p.ativo = 1
    `;
    const params = [];
    if (categoria) {
      query += " AND (c.slug = ? OR c2.slug = ?)";
      params.push(categoria, categoria);
    }
    query += " ORDER BY p.criado_em DESC LIMIT 40";

    const [rows] = await pool.query(query, params);
    return res.json(rows.map(formatarProduto));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao buscar produtos." });
  }
});

// GET /api/produtos/categorias — lista categorias ativas
router.get("/categorias", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, slug FROM categorias WHERE ativo = 1 ORDER BY nome"
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro ao buscar categorias." });
  }
});

// GET /api/produtos/destaque
router.get("/destaque", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.nome, p.preco, p.imagem_url, p.em_oferta, p.desconto_percentual
       FROM produtos p WHERE p.ativo = 1 AND p.destaque = 1
       ORDER BY p.criado_em DESC LIMIT 8`
    );
    return res.json(rows.map(formatarProduto));
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro ao buscar destaques." });
  }
});

// GET /api/produtos/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.nome AS categoria, c.slug AS categoria_slug,
              c2.nome AS categoria_secundaria, c2.slug AS categoria_secundaria_slug
       FROM produtos p
       LEFT JOIN categorias c  ON c.id  = p.categoria_id
       LEFT JOIN categorias c2 ON c2.id = p.categoria_secundaria_id
       WHERE p.id = ? AND p.ativo = 1 LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ mensagem: "Produto não encontrado." });
    return res.json(formatarProduto(rows[0]));
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro ao buscar produto." });
  }
});

// ── GESTÃO ────────────────────────────────────────────────────────────────────

// Valida e normaliza o desconto (0–20%)
function normalizarDesconto(emOferta, desconto) {
  const ligado = emOferta === "true" || emOferta === true;
  if (!ligado) return { em_oferta: 0, desconto_percentual: 0 };

  let pct = parseFloat(desconto);
  if (isNaN(pct) || pct < 0) pct = 0;
  if (pct > 20) pct = 20; // limite máximo de 20%

  return { em_oferta: 1, desconto_percentual: pct };
}

// POST /api/produtos/cadastro — multipart/form-data com imagem
router.post("/cadastro", apenasEstoque, upload.single("imagem"), async (req, res) => {
  const {
    nome, preco, descricao, categoria_id, categoria_secundaria_id,
    estoque, destaque, em_oferta, desconto_percentual,
  } = req.body;

  if (!nome || !preco) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ mensagem: "Nome e preço são obrigatórios." });
  }

  const imagem_url = req.file ? `/uploads/${req.file.filename}` : null;
  const oferta = normalizarDesconto(em_oferta, desconto_percentual);

  try {
    const [result] = await pool.query(
      `INSERT INTO produtos
        (nome, preco, imagem_url, descricao, categoria_id, categoria_secundaria_id,
         estoque, destaque, em_oferta, desconto_percentual)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome,
        parseFloat(preco),
        imagem_url,
        descricao || null,
        categoria_id || null,
        categoria_secundaria_id || null,
        parseInt(estoque) || 0,
        destaque === "true" || destaque === true ? 1 : 0,
        oferta.em_oferta,
        oferta.desconto_percentual,
      ]
    );
    return res.status(201).json({
      mensagem: "Produto cadastrado com sucesso.",
      id: result.insertId,
      imagem_url,
    });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao cadastrar produto." });
  }
});

// PUT /api/produtos/:id — pode ou não enviar nova imagem
router.put("/:id", apenasEstoque, upload.single("imagem"), async (req, res) => {
  const {
    nome, preco, descricao, categoria_id, categoria_secundaria_id,
    estoque, destaque, ativo, em_oferta, desconto_percentual,
  } = req.body;

  const oferta = normalizarDesconto(em_oferta, desconto_percentual);

  try {
    // Se veio nova imagem, apaga a antiga
    if (req.file) {
      const [atual] = await pool.query(
        "SELECT imagem_url FROM produtos WHERE id = ?",
        [req.params.id]
      );
      if (atual.length && atual[0].imagem_url) {
        const caminhoAntigo = path.join(__dirname, "../", atual[0].imagem_url);
        if (fs.existsSync(caminhoAntigo)) fs.unlinkSync(caminhoAntigo);
      }
    }

    const imagem_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const campos = [
      nome,
      parseFloat(preco),
      descricao,
      categoria_id || null,
      categoria_secundaria_id || null,
      parseInt(estoque) || 0,
      destaque === "true" || destaque === true ? 1 : 0,
      oferta.em_oferta,
      oferta.desconto_percentual,
      ativo ?? 1,
    ];

    let query = `UPDATE produtos SET nome=?, preco=?, descricao=?, categoria_id=?,
                 categoria_secundaria_id=?, estoque=?, destaque=?, em_oferta=?,
                 desconto_percentual=?, ativo=?`;

    if (imagem_url !== undefined) {
      query += ", imagem_url=?";
      campos.push(imagem_url);
    }

    query += " WHERE id=?";
    campos.push(req.params.id);

    await pool.query(query, campos);
    return res.json({ mensagem: "Produto atualizado.", imagem_url });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao atualizar produto." });
  }
});

// DELETE /api/produtos/:id — soft delete
router.delete("/:id", apenasEstoque, async (req, res) => {
  try {
    await pool.query("UPDATE produtos SET ativo = 0 WHERE id = ?", [req.params.id]);
    return res.json({ mensagem: "Produto removido." });
  } catch (err) {
    return res.status(500).json({ mensagem: "Erro ao remover produto." });
  }
});

// ── Helper ────────────────────────────────────────────────────────────────────
// IMPORTANTE: p.preco SEMPRE permanece o preço base/original do produto.
// Quando em oferta, adiciona campos extras (preco_oferta) sem sobrescrever o preço base —
// isso evita que o desconto seja aplicado repetidamente a cada edição no admin.
function formatarProduto(p) {
  const preco = parseFloat(p.preco);
  const resultado = {
    ...p,
    preco_fmt: `R$ ${preco.toFixed(2).replace(".", ",")}`,
  };

  // Calcula preço com desconto se o produto estiver em oferta
  if (p.em_oferta && parseFloat(p.desconto_percentual) > 0) {
    const pct = parseFloat(p.desconto_percentual);
    const precoOferta = preco * (1 - pct / 100);
    resultado.preco_oferta     = precoOferta;
    resultado.preco_oferta_fmt = `R$ ${precoOferta.toFixed(2).replace(".", ",")}`;
  }

  return resultado;
}

module.exports = router;
