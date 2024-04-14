const request = require('supertest');
const app = require("../routes/index"); // Asegúrate de que este es el camino correcto a tu archivo app.js

describe('Test TDD para el home', () => 
{
    test('It should return a 200 status code en home', async () => 
    {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });
});
