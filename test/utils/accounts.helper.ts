export async function accountAuthenticate(request: any): Promise<string> {
  const authenticateResponse = await request.post('/users').send({
    document: '00692525301',
    name: 'Thiago Fake',
    email: 'thiago@fake.email.com',
  });
  return authenticateResponse.get('Set-Cookie');
}
