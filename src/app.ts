import cookie from '@fastify/cookie';
import fastify from 'fastify';
import { accountsRoutes } from './routes/accounts';
import { mealsRoutes } from './routes/meals';

export const app = fastify();

app.get('/health', () => {
  return 'All very well! 🧑‍⚕️';
});

void app
  .register(cookie)
  .register(accountsRoutes, {
    prefix: 'users',
  })
  .register(mealsRoutes, {
    prefix: 'meals',
  });
