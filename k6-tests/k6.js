// load-tests/user-journey.js (Versão Ajustada para sua API)
import http from 'k6/http';
import { check, sleep, group } from 'k6';

// A URL base da sua API (ajuste conforme necessário)
const BASE_URL = 'http://localhost:3000';

// Configuração do teste de carga
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up para 10 usuários em 30s
    { duration: '1m', target: 10 },    // Mantém 10 usuários por 1 minuto
    { duration: '20s', target: 30 },   // Ramp up para 30 usuários em 20s
    { duration: '1m', target: 30 },    // Mantém 30 usuários por 1 minuto
    { duration: '10s', target: 0 },    // Ramp down para 0 usuários em 10s
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // 95% das requisições devem ser < 500ms
    'http_req_failed': ['rate<0.01'],    // Taxa de falha < 1%
    'checks': ['rate>0.99'],             // Taxa de sucesso > 99%
  },
};

// --- O Cenário de Teste Ajustado ---
export default function () {
  // Geramos dados únicos usando as variáveis internas do k6: __VU e __ITER
  const uniqueEmail = `user.vu${__VU}.iter${__ITER}@test.com`;
  const userName = `Test User VU=${__VU} IT=${__ITER}`;
  
  const userData = {
    nome: userName,     // Seu campo é 'nome', não 'name'
    email: uniqueEmail,
    // Removido o campo 'password' pois não existe na sua API
  };
  
  const headers = { 'Content-Type': 'application/json' };
  let userId;

  // --- 1. CRIAR USUÁRIO (POST) ---
  group('1. Criar Usuário (POST)', function () {
    const res = http.post(`${BASE_URL}/usuarios`, JSON.stringify(userData), { headers });
    
    check(res, {
      'POST /usuarios - status é 201': (r) => r.status === 201,
      'POST /usuarios - corpo da resposta contém ID': (r) => r.json('id') !== null,
      'POST /usuarios - nome correto': (r) => r.json('nome') === userData.nome,
      'POST /usuarios - email correto': (r) => r.json('email') === userData.email,
    });
    
    if (res.status === 201) {
      userId = res.json('id');
    }
    
    sleep(1);
  });

  // --- 2. BUSCAR USUÁRIO ESPECÍFICO (GET) ---
  if (userId) {
    group('2. Buscar Usuário Específico (GET)', function () {
      const res = http.get(`${BASE_URL}/usuarios/${userId}`);
      
      check(res, {
        'GET /usuarios/{id} - status é 200': (r) => r.status === 200,
        'GET /usuarios/{id} - ID correto': (r) => r.json('id') === userId,
        'GET /usuarios/{id} - nome correto': (r) => r.json('nome') === userData.nome,
      });
      
      sleep(0.5);
    });
  }

  // --- 3. ATUALIZAR USUÁRIO (PUT) ---
  if (userId) {
    group('3. Atualizar Usuário (PUT)', function () {
      const updateData = {
        nome: `Updated User VU=${__VU} IT=${__ITER}`, // Novo nome único
        email: uniqueEmail, // Mantém o email
      };
      
      const res = http.put(`${BASE_URL}/usuarios/${userId}`, JSON.stringify(updateData), { headers });
      
      check(res, {
        'PUT /usuarios/{id} - status é 200': (r) => r.status === 200,
        'PUT /usuarios/{id} - nome foi atualizado': (r) => r.json('nome') === updateData.nome,
        'PUT /usuarios/{id} - email mantido': (r) => r.json('email') === updateData.email,
      });
      
      sleep(1);
    });
  }

  // --- 4. LISTAR TODOS OS USUÁRIOS (GET) ---
  group('4. Listar Todos os Usuários (GET)', function () {
    const res = http.get(`${BASE_URL}/usuarios`);
    
    check(res, {
      'GET /usuarios - status é 200': (r) => r.status === 200,
      'GET /usuarios - resposta é um array': (r) => Array.isArray(r.json()),
      'GET /usuarios - contém usuários': (r) => r.json().length >= 0,
    });
    
    sleep(0.5);
  });

  // --- 5. DELETAR USUÁRIO (DELETE) ---
  if (userId) {
    group('5. Deletar Usuário (DELETE)', function () {
      const res = http.del(`${BASE_URL}/usuarios/${userId}`);
      
      check(res, {
        'DELETE /usuarios/{id} - status é 204': (r) => r.status === 204,
      });
      
      sleep(1);
    });
  }

  // --- 6. VERIFICAR SE USUÁRIO FOI DELETADO ---
  if (userId) {
    group('6. Verificar Usuário Deletado (GET)', function () {
      const res = http.get(`${BASE_URL}/usuarios/${userId}`);
      
      check(res, {
        'GET /usuarios/{id} deletado - status é 404': (r) => r.status === 404,
      });
      
      sleep(0.5);
    });
  }
}

// --- FUNÇÃO PARA TESTE DE SMOKE (OPCIONAL) ---
// Descomente se quiser um teste rápido para verificar se a API está funcionando
/*
export function setup() {
  // Teste básico para verificar se a API está respondendo
  const res = http.get(`${BASE_URL}/usuarios`);
  if (res.status !== 200) {
    throw new Error(`API não está respondendo. Status: ${res.status}`);
  }
  console.log('✅ API está funcionando - iniciando teste de carga...');
}
*/
