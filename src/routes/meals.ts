import { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { randomUUID } from 'crypto';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

const resource = 'meals';

export async function mealsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', checkSessionIdExists);

  app.get('/', async (request, reply) => {
    const { sessionId } = request.cookies;

    const meals = await knex(resource).where('account_id', sessionId).select();
    return { meals };
  });

  app.post('/', async (request, reply) => {
    const { sessionId } = request.cookies;

    const createMealBodySchema = z.object({
      name: z.string().nonempty(),
      description: z.string().nonempty(),
      date: z.string().nonempty(),
      diet: z.boolean(),
    });

    const { name, description, date, diet } = createMealBodySchema.parse(
      request.body,
    );

    await knex(resource).insert({
      id: randomUUID(),
      account_id: sessionId,
      name,
      description,
      date,
      diet,
    });

    return await reply.status(201).send();
  });

  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { sessionId } = request.cookies;

      const { id } = createMealParamsSchema.parse(request.params);
      const meal = await knex(resource)
        .select('*')
        .where({
          account_id: sessionId,
          id,
        })
        .first();

      if (meal == null) {
        return await reply.status(404).send({
          error: 'Meal not found',
        });
      }
      return { meal };
    },
  );

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies;
      const summary = await knex(resource)
        .sum('amount', { as: 'amount' })
        .where('session_id', sessionId)
        .first();
      return { summary };
    },
  );
}
