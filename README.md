### Testing Photo Album
##### How To Run
1. npm instal kemudian,
2. Buat file .env dan isi sesuai yang ada di file .env.example
    ``` javascript
      JWT_SECRET=isi secret key
    ```
3. Ganti `username`, `password`, dan lain-lain pada `config/config.json`

    ``` json
      "test": {
      "username": "username anda",
      "password": "password anda",
      "database": "database anda",
      "host": "localhost",
      "port": 5432,
      "dialect": "postgres",
      "logging": false
    },
    ```    
4. Kemudian ketik pada command `npm run db:create:test`, setelah itu `npm run db:migrate:test`
5. Terakhir ketik pada command `npm test`
6. Hasil Testing bisa dilihat pada bagian **Hasil Testing**
##### Directory Testing
```javascript
__tests__/
    ├───createPhotos.test.js
    ├───deletePhoto.test.js  //Tambahan 
    ├───endpoint-not-found.test.js
    ├───getPhotos.test.js
    ├───photosGetId.test.js
    ├───sign-in.test.js
    ├───sign-up.test.js
    └───updatePhoto.test.js  //Tambahan
```
##### Hasil Testing
``` javascript
 PASS  __tests__/getPhotos.test.js
 PASS  __tests__/sign-up.test.js
 PASS  __tests__/sign-in.test.js
 PASS  __tests__/deletePhoto.test.js
 PASS  __tests__/updatePhoto.test.js
 PASS  __tests__/photosGetId.test.js
 PASS  __tests__/createPhotos.test.js
 PASS  __tests__/endpoint-not-found.test.js
-------------------------------|---------|----------|---------|---------|-------------------
File                           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------------------|---------|----------|---------|---------|-------------------
All files                      |   99.48 |    95.38 |     100 |   99.44 | 
 SuperTest                     |     100 |      100 |     100 |     100 | 
  app.js                       |     100 |      100 |     100 |     100 | 
 SuperTest/controllers         |     100 |      100 |     100 |     100 | 
  photos-controller.js         |     100 |      100 |     100 |     100 | 
  users-controller.js          |     100 |      100 |     100 |     100 | 
 SuperTest/helpers             |     100 |      100 |     100 |     100 | 
  hash.js                      |     100 |      100 |     100 |     100 | 
  jwt.js                       |     100 |      100 |     100 |     100 | 
 SuperTest/middlewares         |     100 |      100 |     100 |     100 | 
  authentication-middleware.js |     100 |      100 |     100 |     100 | 
  error-middleware.js          |     100 |      100 |     100 |     100 | 
 SuperTest/models              |   96.87 |    66.66 |     100 |   96.87 | 
  index.js                     |      95 |    66.66 |     100 |      95 | 13
  photo.js                     |     100 |      100 |     100 |     100 | 
  user.js                      |     100 |      100 |     100 |     100 | 
 SuperTest/routes              |     100 |      100 |     100 |     100 | 
  index.js                     |     100 |      100 |     100 |     100 |
  photos-router.js             |     100 |      100 |     100 |     100 |
  users-router.js              |     100 |      100 |     100 |     100 |
-------------------------------|---------|----------|---------|---------|-------------------

Test Suites: 8 passed, 8 total
Tests:       58 passed, 58 total
Snapshots:   0 total
Time:        8.931 s, estimated 9 s
Ran all test suites.
```

#### **Kata-kata tidak Bijak**
***"Tidurlah Sebelum Ngantuk"***
