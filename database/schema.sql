CREATE DATABASE IF NOT EXISTS HarpyToys 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE HarpyToys;

CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    foto_url VARCHAR(255) DEFAULT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso DATETIME NULL
);

select * from produtos;

CREATE TABLE IF NOT EXISTS usuarios_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('admin', 'estoque', 'vendedor', 'suporte') NOT NULL DEFAULT 'vendedor',
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso DATETIME NULL
);

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    slug VARCHAR(80) UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    imagem_url VARCHAR(255),
    descricao TEXT,
    categoria_id INT,
    categoria_secundaria_id INT NULL,
    estoque INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    destaque BOOLEAN DEFAULT FALSE,
    em_oferta BOOLEAN DEFAULT FALSE,
    desconto_percentual DECIMAL(5,2) DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    FOREIGN KEY (categoria_secundaria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS enderecos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    nome_endereco VARCHAR(50) DEFAULT 'Principal',
    cep VARCHAR(10),
    rua VARCHAR(150),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(80),
    cidade VARCHAR(80),
    estado CHAR(2),
    principal BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'pago', 'processando', 'enviado', 'entregue', 'cancelado') DEFAULT 'pendente',
    forma_pagamento ENUM('pix', 'cartao_credito', 'cartao_debito', 'boleto'),
    valor_total DECIMAL(10,2) NOT NULL,
    valor_frete DECIMAL(8,2) DEFAULT 0.00,
    endereco_entrega JSON,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS pedido_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE TABLE IF NOT EXISTS tokens_recuperacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    expira_em DATETIME NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

INSERT IGNORE INTO categorias (nome, slug) VALUES 
('Brinquedos Educativos','educativos'),
('Pelúcias','pelucias'),
('Bonecas e Bonecos','bonecas'),
('Carrinhos','carrinhos'),
('Jogos de Tabuleiro','jogos'),
('Quebra-Cabeças','quebra-cabecas'),
('Esportes','esportes'),
('Ao Ar Livre','ao-ar-livre'),
('Baby','baby'),
('Geek e Colecionáveis','geek'),
('Ofertas','ofertas'),
('Área para Garotos','garotos'),
('Área para Garotas','garotas'),
('Até 80% OFF','ate-80-off'),
('Nacionais','nacionais'),
('Lançamentos', 'lancamentos');

INSERT IGNORE INTO categorias (nome, slug) VALUES

-- Hash bcrypt de 'admin123': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT IGNORE INTO usuarios_sistema (nome, email, senha_hash, perfil)
VALUES ('Administrador', 'admin@harpytoys.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

UPDATE pedidos
SET status = 'pago'
WHERE forma_pagamento != 'boleto' AND status = 'pendente';

SET SQL_SAFE_UPDATES = 0;

UPDATE pedidos
SET status = 'pago'
WHERE forma_pagamento != 'boleto' AND status = 'pendente';

SET SQL_SAFE_UPDATES = 1;


-- =============================================
-- MIGRAÇÃO: caso as tabelas antigas ainda existam
-- Execute manualmente se precisar migrar dados:
-- INSERT INTO usuarios_sistema (nome, email, senha_hash, perfil, ativo, data_cadastro, ultimo_acesso)
-- SELECT nome, email, senha_hash, perfil, ativo, data_cadastro, ultimo_acesso FROM funcionarios;
-- INSERT IGNORE INTO usuarios_sistema (nome, email, senha_hash, perfil, ativo, data_cadastro, ultimo_acesso)
-- SELECT nome, email, senha_hash, 'admin', ativo, data_cadastro, ultimo_acesso FROM administradores;
