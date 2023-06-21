import { execSync } from 'node:child_process';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app';

describe('Accounts routes', () => {
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

  it('should be able to receive a cookie on post account', async () => {
    const createAccountResponse = await request(app.server)
      .post('/accounts')
      .send({
        cpf: '00692525301',
        name: 'Thiago Fake',
        email: 'thiago@fake.email.com',
      })
      .expect(200);

    const cookies = createAccountResponse.get('Set-Cookie');
    expect(cookies.length).toBeGreaterThanOrEqual(0);
  });
});
