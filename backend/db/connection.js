// backend/db/connection.js
require("dotenv").config();

const mysql = require("mysql2/promise");

console.log("🔍 Variáveis de conexão:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(conn => {
    console.log("✅ MySQL conectado com sucesso no Railway!");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Erro ao conectar no MySQL:", err.message);
    console.error("Verifique se as variáveis DB_ estão corretas no Railway.");
  });

module.exports = pool;