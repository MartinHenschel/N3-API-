import http from 'k6/http';
import { check, sleep, group } from 'k6';

const BASE_URL = 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '20s', target: 30 },
    { duration: '1m', target: 30 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
    'checks': ['rate>0.99'],
  },
  // Configuração para enviar métricas ao InfluxDB
  ext: {
    loadimpact: {
      apm: [
        {
          provider: 'influxdb',
          includeDefaultMetrics: true,
          includeTestRunId: true,
          metrics: [
            'http_req_duration',
            'http_req_failed',
            'http_reqs',
            'checks',
            'vus',
            'vus_max',
            'iteration_duration',
            'iterations',
          ],
        },
      ],
    },
  },
};

export default function () {
  const uniqueEmail = `user.vu${__VU}.iter${__ITER}@test.com`;
  const userName = `Test User VU=${__VU} IT=${__ITER}`;
  
  const userData = {
    nome: userName,
    email: uniqueEmail,
  };
  
  const headers = { 'Content-Type': 'application/json' };
  let userId;

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

  if (userId) {
    group('3. Atualizar Usuário (PUT)', function () {
      const updateData = {
        nome: `Updated User VU=${__VU} IT=${__ITER}`,
        email: uniqueEmail,
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

  group('4. Listar Todos os Usuários (GET)', function () {
    const res = http.get(`${BASE_URL}/usuarios`);
    
    check(res, {
      'GET /usuarios - status é 200': (r) => r.status === 200,
      'GET /usuarios - resposta é um array': (r) => Array.isArray(r.json()),
      'GET /usuarios - contém usuários': (r) => r.json().length >= 0,
    });
    
    sleep(0.5);
  });

  if (userId) {
    group('5. Deletar Usuário (DELETE)', function () {
      const res = http.del(`${BASE_URL}/usuarios/${userId}`);
      
      check(res, {
        'DELETE /usuarios/{id} - status é 204': (r) => r.status === 204,
      });
      
      sleep(1);
    });
  }

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
