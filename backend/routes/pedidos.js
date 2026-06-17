const express = require("express");
const pool = require("../db/connection");
const { apenasFunc } = require("../middleware/auth");
const router = express.Router();

// ── GESTÃO (frontend-admin) ───────────────────────────────────────────────────

// GET /api/pedidos/resumo — KPIs do dashboard
router.get("/resumo", apenasFunc, async (req, res) => {
  try {
    const [[totais]] = await pool.query(
      `SELECT
         COUNT(*)                                   AS total_pedidos,
         COALESCE(SUM(valor_total), 0)              AS faturamento_total,
         COALESCE(SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END), 0) AS pedidos_pendentes,
         COALESCE(AVG(valor_total), 0)              AS ticket_medio
       FROM pedidos`
    );
    return res.json(totais);
  } catch (erro) {
    console.error("ERRO AO BUSCAR RESUMO:", erro);
    return res.status(500).json({ mensagem: "Erro ao buscar resumo", detalhe: erro.message });
  }
});

// GET /api/pedidos — lista todos os pedidos (admin/funcionários)
// Mostra quem comprou, quantidade de itens e valor
router.get("/", apenasFunc, async (req, res) => {
  try {
    const [pedidos] = await pool.query(
      `SELECT p.id, p.numero_pedido, p.data_pedido, p.status, p.forma_pagamento,
              p.valor_total, p.valor_frete,
              c.nome AS cliente_nome, c.email AS cliente_email,
              COALESCE(SUM(pi.quantidade), 0) AS total_itens
       FROM pedidos p
       LEFT JOIN clientes c ON c.id = p.cliente_id
       LEFT JOIN pedido_itens pi ON pi.pedido_id = p.id
       GROUP BY p.id, p.numero_pedido, p.data_pedido, p.status, p.forma_pagamento,
                p.valor_total, p.valor_frete, c.nome, c.email
       ORDER BY p.data_pedido DESC`
    );
    return res.json(pedidos);
  } catch (erro) {
    console.error("ERRO AO LISTAR PEDIDOS:", erro);
    return res.status(500).json({ mensagem: "Erro ao listar pedidos", detalhe: erro.message });
  }
});

// PUT /api/pedidos/:id/status — atualizar status do pedido
router.put("/:id/status", apenasFunc, async (req, res) => {
  const { status } = req.body;
  const statusValidos = ["pendente", "pago", "processando", "enviado", "entregue", "cancelado"];

  if (!statusValidos.includes(status))
    return res.status(400).json({ mensagem: "Status inválido." });

  try {
    await pool.query("UPDATE pedidos SET status = ? WHERE id = ?", [status, req.params.id]);
    return res.json({ mensagem: "Status atualizado." });
  } catch (erro) {
    console.error("ERRO AO ATUALIZAR STATUS:", erro);
    return res.status(500).json({ mensagem: "Erro ao atualizar status", detalhe: erro.message });
  }
});

// ── E-COMMERCE (frontend-cliente) ─────────────────────────────────────────────

// POST /api/pedidos — criar pedido
router.post("/", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { cliente_id, forma_pagamento, valor_total, valor_frete, endereco_entrega, itens } = req.body;

    if (!cliente_id) return res.status(400).json({ mensagem: "cliente_id não enviado." });
    if (!itens || !Array.isArray(itens) || itens.length === 0)
      return res.status(400).json({ mensagem: "Nenhum item enviado no pedido." });

    await conn.beginTransaction();
    const numeroPedido = "HT-" + Date.now();
    const formaPagamentoFinal = forma_pagamento || "pix";

    // Pix e Cartão são confirmados instantaneamente (sem gateway real, simulamos aprovação imediata).
    // Boleto fica "pendente" até a compensação (simulação).
    const statusInicial = formaPagamentoFinal === "boleto" ? "pendente" : "pago";

    const [pedidoResult] = await conn.query(
      `INSERT INTO pedidos (cliente_id, numero_pedido, status, forma_pagamento, valor_total, valor_frete, endereco_entrega)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cliente_id, numeroPedido, statusInicial, formaPagamentoFinal,
       Number(valor_total || 0), Number(valor_frete || 0),
       JSON.stringify(endereco_entrega || {})]
    );

    const pedidoId = pedidoResult.insertId;

    for (const item of itens) {
      const produtoId = item.produto_id || item.id;
      const quantidade = item.quantidade || item.qty || 1;
      const precoUnitario = item.preco || item.price || 0;
      if (!produtoId) throw new Error("Produto sem ID no carrinho.");

      // Verifica estoque disponível (com lock para evitar concorrência)
      const [produtoRows] = await conn.query(
        "SELECT estoque, nome FROM produtos WHERE id = ? FOR UPDATE",
        [produtoId]
      );
      if (!produtoRows.length) throw new Error(`Produto ${produtoId} não encontrado.`);
      if (produtoRows[0].estoque < quantidade) {
        throw new Error(`Estoque insuficiente para "${produtoRows[0].nome}". Disponível: ${produtoRows[0].estoque}, solicitado: ${quantidade}.`);
      }

      await conn.query(
        `INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)`,
        [pedidoId, produtoId, quantidade, Number(precoUnitario)]
      );

      // Subtrai do estoque
      await conn.query(
        "UPDATE produtos SET estoque = estoque - ? WHERE id = ?",
        [quantidade, produtoId]
      );
    }

    await conn.commit();
    return res.status(201).json({ sucesso: true, mensagem: "Pedido salvo com sucesso.", pedido_id: pedidoId, numero_pedido: numeroPedido });
  } catch (erro) {
    await conn.rollback();
    console.error("ERRO AO SALVAR PEDIDO:", erro);
    return res.status(500).json({ mensagem: "Erro ao salvar pedido", detalhe: erro.message });
  } finally {
    conn.release();
  }
});

// GET /api/pedidos/cliente/:id — lista pedidos do cliente
router.get("/cliente/:id", async (req, res) => {
  try {
    const [pedidos] = await pool.query(
      `SELECT id, numero_pedido, data_pedido, status, forma_pagamento, valor_total, valor_frete, endereco_entrega
       FROM pedidos WHERE cliente_id = ? ORDER BY data_pedido DESC`,
      [req.params.id]
    );
    return res.json(pedidos);
  } catch (erro) {
    console.error("ERRO AO BUSCAR PEDIDOS:", erro);
    return res.status(500).json({ mensagem: "Erro ao buscar pedidos", detalhe: erro.message });
  }
});

// GET /api/pedidos/:id — detalhe de um pedido com seus itens
router.get("/:id", async (req, res) => {
  try {
    const [pedidos] = await pool.query(
      `SELECT id, numero_pedido, data_pedido, status, forma_pagamento, valor_total, valor_frete, endereco_entrega
       FROM pedidos WHERE id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!pedidos.length) return res.status(404).json({ mensagem: "Pedido não encontrado." });

    const pedido = pedidos[0];

    const [itens] = await pool.query(
      `SELECT pi.quantidade, pi.preco_unitario, p.nome, p.imagem_url
       FROM pedido_itens pi
       LEFT JOIN produtos p ON p.id = pi.produto_id
       WHERE pi.pedido_id = ?`,
      [pedido.id]
    );

    return res.json({ ...pedido, itens });
  } catch (erro) {
    console.error("ERRO AO BUSCAR PEDIDO:", erro);
    return res.status(500).json({ mensagem: "Erro ao buscar pedido", detalhe: erro.message });
  }
});

module.exports = router;
