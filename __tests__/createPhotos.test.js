const request = require('supertest');
const app = require('./../app');
const { sequelize } = require('./../models/index');
const { queryInterface } = sequelize;
const { hash } = require('./../helpers/hash');
const { sign, verify } = require('../helpers/jwt');

const user = {
    username: 'acong',
    email: 'acong@mail.com',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date()
};
const userToken = sign({ id: 1, email: user.email });
const userNotExistsToken = sign({ id: 99, email: 'notexists@mail.com' })

const Photo = {
    title: 'Photo',
    caption: 'caption',
    image_url: 'http://image.com/defaultphoto.png',
    createdAt: new Date(),
    updatedAt: new Date(),
    UserId: 1
};

const PhotosTest = {
    title: 'new Photo',
    caption: 'new caption',
    image_url: 'http://image.com/newphoto.png',
};

beforeAll(async () => {
    await queryInterface.bulkDelete('Users', null, {
        truncate: true,
        restartIdentity: true,
        cascade: true
    });
    const hashedUser = { ...user };
    hashedUser.password = hash(hashedUser.password);
    await queryInterface.bulkInsert('Users', [hashedUser]);
    await queryInterface.bulkInsert('Photos', [Photo]);
});

afterAll(async () => {
    sequelize.close();
});

describe('POST /photos', () => {
    test('should return HTTP code 201 when created photo success', async () => {
        const { body } = await request(app)
            .post('/photos')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userToken}`)
            .expect(201);
        expect(body).toEqual({
            id: 2,
            title: PhotosTest.title,
            caption: PhotosTest.caption,
            image_url: PhotosTest.image_url,
            UserId: 1,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
    });
    test('should return HTTP code 400 when post without title', async () => {
        const { body } = await request(app)
            .post('/photos')
            .send({ image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userToken}`)
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Title cannot be omitted']))
    });
    test('should return HTTP code 400 when post with empty string title', async () => {
        const { body } = await request(app)
            .post('/photos')
            .send({ title: "", image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userToken}`)
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Title cannot be an empty string']))
    });
    test('should return HTTP code 400 when post without image URL', async () => {
        const { body } = await request(app)
            .post('/photos')
            .send({ title: PhotosTest.title, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userToken}`)
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Image URL cannot be omitted']))
    });
    test('should return HTTP code 400 when post with empty image URL', async () => {
        const { body } = await request(app)
            .post('/photos')
            .send({ title: PhotosTest.title, image_url: "", caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userToken}`)
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(['Image URL cannot be an empty string']))
    });
    test('should return HTTP code 400 when post with wrong  image URL format', async () => {
        const { body } = await request(app)
            .post('/photos')
            .send({ title: PhotosTest.title, image_url: "image_salah.png", caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userToken}`)
            .expect(400);
        expect(body.message).toEqual(expect.arrayContaining(["Wrong URL format"]))
    });
    test('should return HTTP status code 401 when no authorization', async () => {
        const { body } = await request(app)
            .post('/photos')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .post('/photos')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', 'Bearer ')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .post('/photos')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', 'Bearer wrong.token.input')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when user does not exist', async () => {
        const { body } = await request(app)
            .post('/photos')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userNotExistsToken}`)
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
    test('should return HTTP status code 404 when PageNotFound', async () => {
        const { body } = await request(app)
            .post('/photossa')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userNotExistsToken}`)
            .expect(404);
        expect(body.message).toMatch(/Oops... nothing here/i);
    });
});
