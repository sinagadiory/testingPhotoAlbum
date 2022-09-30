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
const user1 = {
    username: 'diory',
    email: 'diory@mail.com',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date()
}
const userToken = sign({ id: 1, email: user.email });
const userToken1 = sign({ id: 2, email: user1.email });
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
    const hashedUser1 = { ...user1 }
    hashedUser.password = hash(hashedUser.password);
    hashedUser1.password = hash(hashedUser.password);
    await queryInterface.bulkInsert('Users', [hashedUser, hashedUser1]);
    await queryInterface.bulkInsert('Photos', [Photo]);
});

afterAll(async () => {
    sequelize.close();
});

describe('PUT /photos/:id', () => {
    test('should return HTTP code 200 when updated photo success', async () => {
        const { body } = await request(app)
            .put('/photos/1')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        expect(body[0]).toEqual({
            id: 1,
            title: PhotosTest.title,
            caption: PhotosTest.caption,
            image_url: PhotosTest.image_url,
            UserId: 1,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
    });
    test('should return HTTP code 200 when updated photo success', async () => {
        const { body } = await request(app)
            .put('/photos/1')
            .send({ title: null, image_url: null, caption: null })
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        expect(body[0]).toEqual({
            id: 1,
            title: PhotosTest.title,
            caption: PhotosTest.caption,
            image_url: PhotosTest.image_url,
            UserId: 1,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
    });
    test('should return HTTP code 200 when updated photo success', async () => {
        const { body } = await request(app)
            .put('/photos/1')
            .send({ title: PhotosTest.title, image_url: null, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        expect(body[0]).toEqual({
            id: 1,
            title: PhotosTest.title,
            caption: PhotosTest.caption,
            image_url: PhotosTest.image_url,
            UserId: 1,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
    });
    test('should return HTTP code 403 when updated photo forbiden', async () => {
        const { body } = await request(app)
            .put('/photos/1')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userToken1}`)
            .expect(403);
        expect(body.message).toMatch(/Dilarang Keras Menyentuh Foto Orang Lain!!/i)
    });
    test('should return HTTP status code 404 when photo not found', async () => {
        const { body } = await request(app)
            .put('/photos/400')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userToken}`)
            .expect(404);
        expect(body.message).toMatch(/data not found/i);
    });
    test('should return HTTP status code 401 when no authorization', async () => {
        const { body } = await request(app)
            .put('/photos')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .put('/photos')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', 'Bearer ')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .put('/photos')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', 'Bearer wrong.token.input')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when user does not exist', async () => {
        const { body } = await request(app)
            .put('/photos')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userNotExistsToken}`)
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
    test('should return HTTP status code 404 when PageNotFound', async () => {
        const { body } = await request(app)
            .put('/photossa')
            .send({ title: PhotosTest.title, image_url: PhotosTest.image_url, caption: PhotosTest.caption })
            .set('Authorization', `Bearer ${userNotExistsToken}`)
            .expect(404);
        expect(body.message).toMatch(/Oops... nothing here/i);
    });
});
