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

const defaultPhoto = {
    title: 'Default Photo',
    caption: 'Default Photo caption',
    image_url: 'http://image.com/defaultphoto.png',
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
    await queryInterface.bulkInsert('Photos', [defaultPhoto]);
});

afterAll(async () => {
    sequelize.close();
});

describe('GET /photos/:id', () => {
    test('should return HTTP status code 200', async () => {
        let { body } = await request(app)
            .get('/photos/1')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        body = [body]
        expect(body.length).toBe(1);
        expect(body).toEqual([{
            id: 1,
            title: defaultPhoto.title,
            caption: defaultPhoto.caption,
            image_url: defaultPhoto.image_url,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            User: {
                id: 1,
                username: 'acong',
                email: 'acong@mail.com',
            }
        }]);
    });
    test('should return HTTP status code 404', async () => {
        const { body } = await request(app)
            .get('/photos/400')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(404);
        expect(body.message).toMatch(/data not found/i);
    });
    test('should return HTTP status code 401 when no authorization', async () => {
        const { body } = await request(app)
            .get('/photos/1')
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
});

