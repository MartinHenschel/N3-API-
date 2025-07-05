import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  duration: '10s',
};

export default function () {
  // Altere conforme o endpoint da sua API
  let res = http.get('http://localhost:3000/api');
  check(res, { 'GET status 200': (r) => r.status === 200 });

  res = http.post('http://localhost:3000/api', JSON.stringify({ nome: "teste" }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'POST status 201': (r) => r.status === 201 });

  res = http.put('http://localhost:3000/api/1', JSON.stringify({ nome: "editado" }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'PUT status 200': (r) => r.status === 200 });

  res = http.del('http://localhost:3000/api/1');
  check(res, { 'DELETE status 200': (r) => r.status === 200 });
}
