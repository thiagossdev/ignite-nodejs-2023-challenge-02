import { randomUUID } from 'crypto';
import { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';

const resource = 'accounts';

export async function accountsRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', async (request, reply) => {
    const createAccountBodySchema = z.object({
      document: z.string().nonempty(),
      name: z.string().nonempty(),
      email: z.string().nonempty(),
    });

    const { document, name, email } = createAccountBodySchema.parse(
      request.body,
    );

    let accountId;
    const account = await knex(resource)
      .select()
      .where({
        document,
      })
      .first();

    if (account == null) {
      accountId = randomUUID();
      await knex(resource).insert({
        id: accountId,
        document,
        name,
        email,
      });
    } else {
      accountId = account.id;
    }

    void reply.cookie('sessionId', accountId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return await reply.status(200).send();
  });
}
