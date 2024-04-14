const request = require('supertest');
const app = require("../../index");

//Probando el index
describe('Probando el home de mi página', () => 
{
    test('Probando el index', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });

    test('Probando el apartado ayuda', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });
});



// Probando el login
describe('Probando el login de mi página', () => 
{
    test('Probando el GET del login', async () => 
    {
        const response = await request(app).get('/login');
        expect(response.statusCode).toBe(200);
    });

    test('Probando el POST del login', async () => {
        const response = await request(app).post('/login').send({
            correo: 'admin@admin.com',
            contrasena: 'admin'
        });
        expect(response.statusCode).toBe(302);
    });

    test('Probando el GET del registro', async () => {
        const response = await request(app).get('/login/registro');
        expect(response.statusCode).toBe(200);
    });

    test('Probando el POST del registro', async () => {
        const response = await request(app).post('/login/registro').send({
            nombre: 'Juan',
            papellido: 'Perez',
            sapellido: 'Perez',
            correo: 'juanp@gmail.com',
            contrasena: '123456',
            codigo_tipo: 2,
            codigo_estado: 1
        });
        expect(response.statusCode).toBe(302);
    });

    test('Probando el cerrar sesión', async () => {
        const response = await request(app).get('/login/cerrars');
        expect(response.statusCode).toBe(302);
    });
});

//Probando el perfil
describe('Probando el perfil de mi página', () =>
{
    test('Probando el get del Perfil', async () => {    
        const response = await request(app).get('/perfil');
        expect(response.statusCode).toBe(302);
    });
});

//Probando el admin
describe('Probando el admin de mi página', () => 
{

    //Solicitudes
    test('Probando el GET del admin', async () => 
    {
        const response = await request(app).get('/admin');
        expect(response.statusCode).toBe(302);
    });

    test('Probando el GET del admin/rechazado/:id', async () => 
    {
        const response = await request(app).get('/admin/rechazado/6');
        expect(response.statusCode).toBe(302);
    });

    test('Probando el GET del admin/aceptado/:id', async () =>
    {
        const response = await request(app).get('/admin/aceptado/6');
        expect(response.statusCode).toBe(302);
    });

    //Registrados
    test('Probando el GET del admin/registrados', async () => 
    {
        const response = await request(app).get('/admin/registrados');
        expect(response.statusCode).toBe(302);
    });

    test('Probando el GET del admin/editRegistrados/:id', async () =>
    {
        const response = await request(app).get('/admin/editRegistrados/19');
        expect(response.statusCode).toBe(302);
    });

    test('Probando el POST del admin/editRegistrados/:id', async () =>
    {
        const response = await request(app).post('/admin/editRegistrados/19').send({
            nombre: 'Juan',
            papellido: 'Perez',
            sapellido: 'Perez',
            correo: 'juan@perez.com',
            codigo_tipo: 2,
            codigo_estado: 1});
        expect(response.statusCode).toBe(302);
    });

    test('Probando el GET del admin/eliminarRegistrado/:id', async () =>
    {
        const response = await request(app).get('/admin/eliminarRegistrado/19');
        expect(response.statusCode).toBe(302);
    });

    //Estados
    test('Probando el GET del admin/estados', async () => 
    {
        const response = await request(app).get('/admin/estados');
        expect(response.statusCode).toBe(302);
    });

    test('Probando el POST del admin/estados', async () =>
    {
        const response = await request(app).post('/admin/estados').send({
            id_estado: '6',
            estado : 'Availd'});
        expect(response.statusCode).toBe(302);
    });

    test('Probando el GET del admin/borrarEstado/:id', async () =>
    {
        const response = await request(app).get('/admin/borrarEstado/3');
        expect(response.statusCode).toBe(302);
    });

    test('Probando el GET del admin/editEstados/:id', async () =>
    {
        const response = await request(app).get('/admin/editEstados/3');
        expect(response.statusCode).toBe(302);
    });
    
    test('Probando el POST del admin/editEstados/:id', async () =>
    {
        const response = await request(app).post('/admin/editEstados/3').send({
            id_estado: '3',
            estado : 'Availd'});
        expect(response.statusCode).toBe(302);
    });

    //Tipos
    test('Probando el GET del admin/tipos', async () => 
    {
        const response = await request(app).get('/admin/tipos');
        expect(response.statusCode).toBe(302);
    });

    test('Probando el POST del admin/tipos', async () =>
    {
        const response = await request(app).post('/admin/tipos').send({
            id_tipo: '4',
            tipo : 'Admined'});
        expect(response.statusCode).toBe(302);
    });

    test('Probando el GET del admin/borrarTipo/:id', async () =>
    {
        const response = await request(app).get('/admin/borrarTipo/3');
        expect(response.statusCode).toBe(302);
    });

    test('Probando el GET del admin/editTipos/:id', async () =>
    {
        const response = await request(app).get('/admin/editTipos/3');
        expect(response.statusCode).toBe(302);
    });

    test('Probando el POST del admin/editTipos/:id', async () =>
    {
        const response = await request(app).post('/admin/editTipos/3').send({
            id_tipo: '3',
            tipo : 'Admined'});
        expect(response.statusCode).toBe(302);
    });
   
});

