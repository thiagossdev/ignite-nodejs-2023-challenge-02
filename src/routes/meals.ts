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

  app.get('/:id', async (request, reply) => {
    const mealParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { sessionId } = request.cookies;

    const { id } = mealParamsSchema.parse(request.params);
    const meal = await knex(resource)
      .select()
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
  });

  app.put('/:id', async (request, reply) => {
    const mealParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { sessionId } = request.cookies;

    const { id } = mealParamsSchema.parse(request.params);
    const meal = await knex(resource)
      .select()
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

    const updateMealBodySchema = z.object({
      name: z.string().nonempty(),
      description: z.string().nonempty(),
      date: z.string().nonempty(),
      diet: z.boolean(),
    });

    const { name, description, date, diet } = updateMealBodySchema.parse(
      request.body,
    );

    await knex(resource)
      .where({
        account_id: sessionId,
        id,
      })
      .update({
        ...meal,
        name,
        description,
        date,
        diet,
        updated_at: new Date().toDateString(),
      });

    return await reply.status(200).send();
  });

  app.delete('/:id', async (request, reply) => {
    const mealParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { sessionId } = request.cookies;

    const { id } = mealParamsSchema.parse(request.params);
    const meal = await knex(resource)
      .select()
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

    await knex(resource)
      .where({
        account_id: sessionId,
        id,
      })
      .del();

    return await reply.status(204).send();
  });

  app.get('/summary', async (request) => {
    const { sessionId } = request.cookies;
    const summary = await knex(resource)
      .count('id', { as: 'count' })
      .sum('diet', { as: 'in' })
      .select(knex.raw('count(`id`) - sum(`diet`) as `out`'))
      .where('account_id', sessionId)
      .first();

    if (summary == null) {
      return {
        count: 0,
        in: 0,
        out: 0,
        best: 0,
      };
    }

    const meals = await knex(resource)
      .where('account_id', sessionId)
      .select()
      .orderBy('date');

    let best = 0;
    let current = 0;
    meals.forEach((meal) => {
      current = meal.diet ? current + 1 : 0;
      if (best < current) {
        best = current;
      }
    });
    return {
      summary: {
        ...summary,
        best,
      },
    };
  });
}
