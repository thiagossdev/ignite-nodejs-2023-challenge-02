export async function makeSingleMeal(
  request: any,
  cookies: string,
  diet: boolean = true,
): Promise<void> {
  await request.post('/meals').set('Cookie', cookies).send({
    name: 'Coffee',
    description: 'Delicious cup of coffee',
    date: '2023-06-20T23:45:00-03:00',
    diet,
  });
}

export async function getFirstMealId(
  request: any,
  cookies: string,
): Promise<number> {
  const listMealsResponse = await request.get('/meals').set('Cookie', cookies);
  return listMealsResponse.body.meals[0].id;
}
