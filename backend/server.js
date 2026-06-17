// backend/server.js — Backend unificado HarpyToys
require("dotenv").config();

const pedidosRoutes = require("./routes/pedidos");
const express = require("express");
const cors    = require("cors");

const clientesAuthRoutes     = require("./routes/auth.clientes");
const funcionariosAuthRoutes = require("./routes/auth.funcionarios");
const produtosRoutes         = require("./routes/produtos");

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "http://localhost:5173", // frontend-cliente
    "http://localhost:5174", // frontend-admin
    "http://localhost:4173",
    "http://localhost:4174",
  ],
  credentials: true,
}));

app.use(express.json());

// ── Imagens de produtos (pasta uploads) ──────────────────────────────────────
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── E-commerce (clientes) ─────────────────────────────────────────────────────
app.use("/api/clientes", clientesAuthRoutes);

// ── Sistema de Gestão (usuarios_sistema) ─────────────────────────────────────
// Mantém /api/funcionarios para compatibilidade com o frontend-admin
app.use("/api/funcionarios", funcionariosAuthRoutes);

// ── Produtos (compartilhado) ──────────────────────────────────────────────────
app.use("/api/produtos", produtosRoutes);

app.use("/api/pedidos", pedidosRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`\n🦅 HarpyToys API → http://localhost:${PORT}`);
  console.log(`   E-commerce:  POST /api/clientes/login`);
  console.log(`   Gestão:      POST /api/funcionarios/login`);
  console.log(`   Health:      GET  /api/health\n`);
});
