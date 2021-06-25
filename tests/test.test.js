import app from '../src/app.js';
import supertest from 'supertest';
import connection from '../src/database/database.js'

//token do usuário teste: bb1a76e6-4508-4d10-aec1-25a2c09dc9bc
/*
describe("GET /finances", () => {
    it("returns status 200 for valid params", async () => {
        const result = await supertest(app).get("/teste")
        expect(result.status).toEqual(200);
    });
 }); 
 */

 describe("POST /finances", () => {
     //tudo certo
    it("returns json for valid params", async () => {
        const result = await supertest(app).post("/finances").set('Authorization', `Bearer bb1a76e6-4508-4d10-aec1-25a2c09dc9bc`)
        expect(res.type).toEqual('application/json');
    });

    //token errado
    it("returns status 400 for invalid params", async () => {
        const result = await supertest(app).post("/finances").set('Authorization', `Bearer bb1a76e6-4508-4d19-aec1-25a2c09dc9bc`)
        expect(result.status).toEqual(400);
    });

    //sem enviar o token
    it("returns status 400 for invalid params", async () => {
        const result = await supertest(app).post("/finances").set('Authorization', `Bearer `)
        expect(result.status).toEqual(400);
    });
 }); 