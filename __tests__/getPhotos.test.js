const request = require('supertest');
const app = require('./../app');
const { sequelize } = require('./../models/index');
const { queryInterface } = sequelize;
const { hash } = require('./../helpers/hash');
const { sign } = require('../helpers/jwt');

const user = {
  username: 'acong',
  email: 'acong@mail.com',
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date()
};
const userToken = sign({ id: 1, email: user.email });
const userNotExistsToken = sign({ id: 99, email: 'notexists@mail.com' });

const defaultPhoto1 = {
  title: 'Default Photo 1',
  caption: 'Default Photo caption 1',
  image_url: 'http://image.com/defaultphoto.png 1',
  createdAt: new Date(),
  updatedAt: new Date(),
  UserId: 1
};
const defaultPhoto2 = {
  title: 'Default Photo 2',
  caption: 'Default Photo caption 2',
  image_url: 'http://image.com/defaultphoto2.png',
  createdAt: new Date(),
  updatedAt: new Date(),
  UserId: 1
};

beforeAll(async () => {
  await queryInterface.bulkDelete('Photos', null, {
    truncate: true,
    restartIdentity: true,
    cascade: true
  });
  await queryInterface.bulkDelete('Users', null, {
    truncate: true,
    restartIdentity: true,
    cascade: true
  });
  const hashedUser = { ...user };
  hashedUser.password = hash(hashedUser.password);
  await queryInterface.bulkInsert('Users', [hashedUser]);
  await queryInterface.bulkInsert('Photos', [defaultPhoto1, defaultPhoto2]);
});

afterAll(async () => {
  sequelize.close();
});

describe('GET /photos', () => {
  test('should return HTTP status code 200', async () => {
    const { body } = await request(app)
      .get('/photos')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(body.length).toBe(2);
    expect(body).toEqual([{
      id: 1,
      title: defaultPhoto1.title,
      caption: defaultPhoto1.caption,
      image_url: defaultPhoto1.image_url,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      UserId: 1
    }, {
      id: 2,
      title: defaultPhoto2.title,
      caption: defaultPhoto2.caption,
      image_url: defaultPhoto2.image_url,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      UserId: 1
    }]);
  });
  test('should return HTTP status code 401 when no authorization', async () => {
    const { body } = await request(app)
      .get('/photos')
      .expect(401);
    expect(body.message).toMatch(/unauthorized/i);
  });
  test('should return HTTP status code 401 when no token provided', async () => {
    const { body } = await request(app)
      .get('/photos')
      .set('Authorization', 'Bearer ')
      .expect(401);
    expect(body.message).toMatch(/invalid token/i);
  });
  test('should return HTTP status code 401 when no token provided', async () => {
    const { body } = await request(app)
      .get('/photos')
      .set('Authorization', 'Bearer wrong.token.input')
      .expect(401);
    expect(body.message).toMatch(/invalid token/i);
  });
  test('should return HTTP status code 401 when user does not exist', async () => {
    const { body } = await request(app)
      .get('/photos')
      .set('Authorization', `Bearer ${userNotExistsToken}`)
      .expect(401);
    expect(body.message).toMatch(/unauthorized/i);
  });
  test('should return HTTP status code 500', async () => {
    const { body } = await request(app)
      .get('/photos')
      .send({ err: "Internal Server Error" })
      .set('Authorization', `Bearer ${userToken}`)
      .expect(500);
    expect(body.message).toMatch(/Internal Server Error/i)
  })
});

