import { execSync } from 'node:child_process';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { accountAuthenticate } from './utils/accounts.helper';
import { getFirstMealId, makeSingleMeal } from './utils/meals.helper';

describe('Meals routes', () => {
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

  it('should be able to create a new meal', async () => {
    const cookies = await accountAuthenticate(request(app.server));
    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Coffee',
        description: 'Delicious cup of coffee',
        date: '2023-06-20T23:45:00-03:00',
        diet: true,
      })
      .expect(201);
  });

  it('should be able to list all meals', async () => {
    const cookies = await accountAuthenticate(request(app.server));
    await makeSingleMeal(request(app.server), cookies);
    await makeSingleMeal(request(app.server), cookies, false);
    await makeSingleMeal(request(app.server), cookies);

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200);

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        title: 'New credit',
        amount: 5000,
      }),
      expect.objectContaining({
        title: 'New debit',
        amount: -500,
      }),
    ]);

    expect(listMealsResponse.body.meals).toHaveLength(2);
  });

  it('should be able to get specific meal', async () => {
    const cookies = await accountAuthenticate(request(app.server));
    await makeSingleMeal(request(app.server), cookies);
    const mealId = await getFirstMealId(request(app.server), cookies);

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Coffee',
        description: 'Delicious cup of coffee',
        date: '2023-06-20T23:45:00-03:00',
        diet: true,
      }),
    );
  });

  it('should be able to edit specific meal', async () => {
    const cookies = await accountAuthenticate(request(app.server));
    await makeSingleMeal(request(app.server), cookies);
    const mealId = await getFirstMealId(request(app.server), cookies);

    await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        name: 'Coffee & Chocolate',
        description: 'Chooooooocolate!!! 💓 And coffee. ☕',
        date: '2023-06-20T23:45:00-03:00',
        diet: false,
      })
      .expect(200);

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Coffee & Chocolate',
        description: 'Chooooooocolate!!! 💓 And coffee. ☕',
        date: '2023-06-20T23:45:00-03:00',
        diet: false,
      }),
    );
  });

  it('should be able to delete specific meal', async () => {
    const cookies = await accountAuthenticate(request(app.server));
    await makeSingleMeal(request(app.server), cookies);
    const mealId = await getFirstMealId(request(app.server), cookies);

    await request(app.server).delete(`/meals/${mealId}`).send().expect(204);
  });

  it('should be able to get the summary', async () => {
    const cookies = await accountAuthenticate(request(app.server));
    await makeSingleMeal(request(app.server), cookies);
    await makeSingleMeal(request(app.server), cookies, false);
    await makeSingleMeal(request(app.server), cookies);
    await makeSingleMeal(request(app.server), cookies);
    await makeSingleMeal(request(app.server), cookies);
    await makeSingleMeal(request(app.server), cookies, false);

    const summaryMealsResponse = await request(app.server)
      .get('/meals/summary')
      .set('Cookie', cookies)
      .expect(200);

    expect(summaryMealsResponse.body).toEqual({
      summary: {
        count: 6,
        in: 4,
        out: 2,
        best: 3,
      },
    });
  });
});
