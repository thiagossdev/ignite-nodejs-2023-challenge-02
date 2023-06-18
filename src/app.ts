import cookie from '@fastify/cookie';
import fastify from 'fastify';

export const app = fastify();

app.get('/health', () => {
  return 'All very well! 🧑‍⚕️';
});

void app.register(cookie);
