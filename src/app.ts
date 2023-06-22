import cookie from '@fastify/cookie';
import fastify from 'fastify';
import { accountsRoutes } from './routes/accounts';

export const app = fastify();

app.get('/health', () => {
  return 'All very well! 🧑‍⚕️';
});

void app.register(cookie).register(accountsRoutes, {
  prefix: 'users',
});
