const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simulando banco de dados em memória
let usuarios = [];
let nextId = 1;

// Middleware para log das requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// GET /usuarios - Listar todos os usuários
app.get('/usuarios', (req, res) => {
  res.status(200).json(usuarios);
});

// GET /usuarios/:id - Buscar usuário por ID
app.get('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = usuarios.find(u => u.id === id);
  
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }
  
  res.status(200).json(usuario);
});

// POST /usuarios - Criar novo usuário
app.post('/usuarios', (req, res) => {
  const { nome, email } = req.body;
  
  // Validações básicas
  if (!nome || !email) {
    return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({ erro: 'Email inválido' });
  }
  
  // Verificar se email já existe
  const emailExiste = usuarios.some(u => u.email === email);
  if (emailExiste) {
    return res.status(400).json({ erro: 'Email já cadastrado' });
  }
  
  const novoUsuario = {
    id: nextId++,
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    criadoEm: new Date().toISOString()
  };
  
  usuarios.push(novoUsuario);
  
  res.status(201).json(novoUsuario);
});

// PUT /usuarios/:id - Atualizar usuário
app.put('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, email } = req.body;
  
  const usuarioIndex = usuarios.findIndex(u => u.id === id);
  
  if (usuarioIndex === -1) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }
  
  // Validações
  if (!nome || !email) {
    return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
  }
  
  if (!email.includes('@')) {
    return res.status(400).json({ erro: 'Email inválido' });
  }
  
  // Verificar se email já existe (exceto para o próprio usuário)
  const emailExiste = usuarios.some(u => u.email === email.toLowerCase() && u.id !== id);
  if (emailExiste) {
    return res.status(400).json({ erro: 'Email já cadastrado' });
  }
  
  // Atualizar usuário
  usuarios[usuarioIndex] = {
    ...usuarios[usuarioIndex],
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    atualizadoEm: new Date().toISOString()
  };
  
  res.status(200).json(usuarios[usuarioIndex]);
});

// DELETE /usuarios/:id - Excluir usuário
app.delete('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const usuarioIndex = usuarios.findIndex(u => u.id === id);
  
  if (usuarioIndex === -1) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }
  
  usuarios.splice(usuarioIndex, 1);
  
  res.status(204).send();
});

// Middleware para tratar rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Middleware para tratar erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET    /usuarios`);
  console.log(`   GET    /usuarios/:id`);
  console.log(`   POST   /usuarios`);
  console.log(`   PUT    /usuarios/:id`);
  console.log(`   DELETE /usuarios/:id`);
});

module.exports = app;
