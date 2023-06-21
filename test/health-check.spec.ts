import { execSync } from 'node:child_process';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { app } from '../src/app';

describe('Health check routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('pnpm knex migrate:rollback --all');
    execSync('pnpm knex migrate:latest');
  });

  it('should be able to check app health', async () => {
    await request(app.server)
      .get('/health')
      .expect(200)
      .expect('All very well! 🧑‍⚕️');
  });
});
