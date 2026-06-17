// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

// Middleware genérico — valida token JWT (qualquer usuário autenticado)
module.exports = function autenticar(req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ mensagem: "Token não fornecido." });

  try {
    req.usuario = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
};

// Requer perfil 'admin' OU 'estoque' — pode gerenciar produtos
module.exports.apenasFunc = function (req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ mensagem: "Token não fornecido." });

  try {
    const payload = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    const perfisPermitidos = ["admin", "estoque", "vendedor", "suporte"];
    if (!perfisPermitidos.includes(payload.perfil))
      return res.status(403).json({ mensagem: "Acesso restrito a funcionários." });

    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
};

// Requer perfil 'admin' OU 'estoque' — pode criar/excluir produtos
module.exports.apenasEstoque = function (req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ mensagem: "Token não fornecido." });

  try {
    const payload = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    if (payload.perfil !== "admin" && payload.perfil !== "estoque")
      return res.status(403).json({ mensagem: "Acesso restrito a admin ou estoque." });

    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
};

// Requer perfil 'admin' — acesso total, incluindo Controle Administrador
module.exports.apenasAdmin = function (req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ mensagem: "Token não fornecido." });

  try {
    const payload = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    if (payload.perfil !== "admin")
      return res.status(403).json({ mensagem: "Acesso restrito a administradores." });

    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
};
