// backend/server.js
require("dotenv").config();

const pedidosRoutes = require("./routes/pedidos");
const express = require("express");
const cors    = require("cors");

const clientesAuthRoutes     = require("./routes/auth.clientes");
const funcionariosAuthRoutes = require("./routes/auth.funcionarios");
const produtosRoutes         = require("./routes/produtos");

const app  = express();
const PORT = process.env.PORT || 3001;

const origensProducao = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map(s => s.trim())
  : [];

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4173",
    "http://localhost:4174",
    ...origensProducao,
  ],
  credentials: true,
}));

app.use(express.json());

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/clientes", clientesAuthRoutes);
app.use("/api/funcionarios", funcionariosAuthRoutes);
app.use("/api/produtos", produtosRoutes);
app.use("/api/pedidos", pedidosRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada." });
});

// ✅ Listen no final
app.listen(PORT, () => {
  console.log(`\n🦅 HarpyToys API → http://localhost:${PORT}`);
  console.log(`   E-commerce:  POST /api/clientes/login`);
  console.log(`   Gestão:      POST /api/funcionarios/login`);
  console.log(`   Health:      GET  /api/health\n`);
});