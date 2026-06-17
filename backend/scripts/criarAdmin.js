require('dotenv').config()
const bcrypt = require('bcryptjs')
const pool   = require('../db/connection')

async function criarAdmin() {
  const senha = '123456' // troque aqui
  const hash  = await bcrypt.hash(senha, 10)

  await pool.query(
    `INSERT INTO usuarios_sistema (nome, email, senha_hash, perfil)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE senha_hash = ?`,
    ['Administrador', 'admin@harpytoys.com', hash, hash]
  )

  console.log('Admin criado/atualizado com sucesso')
  process.exit(0)
}

criarAdmin().catch(err => {
  console.error(err)
  process.exit(1)
})