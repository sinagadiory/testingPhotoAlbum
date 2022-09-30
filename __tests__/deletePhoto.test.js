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



beforeAll(async () => {
    await queryInterface.bulkDelete('Users', null, {
        truncate: true,
        restartIdentity: true,
        cascade: true
    });
    const hashedUser = { ...user }
    const hashedUser1 = { ...user1 }
    hashedUser.password = hash(hashedUser.password);
    hashedUser1.password = hash(hashedUser1.password);
    await queryInterface.bulkInsert('Users', [hashedUser, hashedUser1]);
    await queryInterface.bulkInsert('Photos', [Photo]);
});

afterAll(async () => {
    sequelize.close();
});

describe('DELETE /photos/:id', () => {
    test('should return HTTP code 403 when delete photo forbiden', async () => {
        const { body } = await request(app)
            .delete('/photos/1')
            .set('Authorization', `Bearer ${userToken1}`)
            .expect(403);
        expect(body.message).toMatch(/Dilarang Keras Menyentuh Foto Orang Lain!!/i)
    });
    test('should return HTTP code 200 when delete photo success', async () => {
        const { body } = await request(app)
            .delete('/photos/1')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        expect(body.message).toMatch(/Berhasil Dihapus/i)
    });
    test('should return HTTP status code 404 when photo not found', async () => {
        const { body } = await request(app)
            .delete('/photos/400')
            .set('Authorization', `Bearer ${userToken1}`)
            .expect(404);
        expect(body.message).toMatch(/data not found/i);
    });
    test('should return HTTP status code 401 when no authorization', async () => {
        const { body } = await request(app)
            .delete('/photos')
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .delete('/photos')
            .set('Authorization', 'Bearer ')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when no token provided', async () => {
        const { body } = await request(app)
            .delete('/photos')
            .set('Authorization', 'Bearer wrong.token.input')
            .expect(401);
        expect(body.message).toMatch(/invalid token/i);
    });
    test('should return HTTP status code 401 when user does not exist', async () => {
        const { body } = await request(app)
            .delete('/photos')
            .set('Authorization', `Bearer ${userNotExistsToken}`)
            .expect(401);
        expect(body.message).toMatch(/unauthorized/i);
    });
    test('should return HTTP status code 404 when PageNotFound', async () => {
        const { body } = await request(app)
            .delete('/photossa')
            .set('Authorization', `Bearer ${userNotExistsToken}`)
            .expect(404);
        expect(body.message).toMatch(/Oops... nothing here/i);
    });
});
