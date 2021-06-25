import app from '../src/app.js';
import supertest from 'supertest';
import connection from '../src/database/database.js'

//token do usuário teste: bb1a76e6-4508-4d10-aec1-25a2c09dc9bc
//id do usuário teste: 4

beforeEach(async () => {
    await connection.query(`DELETE FROM financial_events WHERE "userId" = 4`);
  });

afterAll(() => {
    connection.end();
});

describe("GET /finances", () => {
         //tudo certo saída
         it("returns status 201 for valid params", async () => {
            const body = {
                "value": "3000",
                "event_type": "saída",
                "description": "gastei" 
            }
            const result = await supertest(app).post("/finances").send(body).set('Authorization', `Bearer bb1a76e6-4508-4d10-aec1-25a2c09dc9bc`)
            expect(result.status).toEqual(201);
        });

        //tudo certo entrada
         it("returns status 201 for valid params", async () => {
            const body = {
                "value": "3000",
                "event_type": "entrada",
                "description": "ganhei" 
            }
            const result = await supertest(app).post("/finances").send(body).set('Authorization', `Bearer bb1a76e6-4508-4d10-aec1-25a2c09dc9bc`)
            expect(result.status).toEqual(201);
        });
    
        //token errado
        it("returns status 401 for invalid token", async () => {
            const body = {
                "value": "3000",
                "event_type": "entrada",
                "description": "ganhei" 
            }
            const result = await supertest(app)
            .post("/finances")
            .send(body)
            .set('Authorization', `Bearer bb1a76e6-4508-4d19-aec1-25a2c09dc9bc`)
            expect(result.status).toEqual(401);
        });
    
        //sem enviar o token
        it("returns status 401 for without token", async () => {
            const body = {
                "value": "3000",
                "event_type": "entrada",
                "description": "ganhei" 
            }
            const result = await supertest(app)
            .post("/finances")
            .send(body)
            .set('Authorization', `Bearer `)
            expect(result.status).toEqual(401);
        });

        //value vazio
        it("returns status 400 for invalid params", async () => {
            const body = {
                "value": "",
                "event_type": "entrada",
                "description": "ganhei" 
            }
            const result = await supertest(app)
            .post("/finances")
            .send(body)
            .set('Authorization', `Bearer bb1a76e6-4508-4d10-aec1-25a2c09dc9bc`)
            expect(result.status).toEqual(400);
        });

        //value string
        it("returns status 400 for invalid params", async () => {
            const body = {
                "value": "lalala",
                "event_type": "entrada",
                "description": "ganhei" 
            }
            const result = await supertest(app)
            .post("/finances")
            .send(body)
            .set('Authorization', `Bearer bb1a76e6-4508-4d10-aec1-25a2c09dc9bc`)
            expect(result.status).toEqual(400);
        });
        //description vazio
        it("returns status 400 for invalid params", async () => {
            const body = {
                "value": "3000",
                "event_type": "entrada",
                "description": "" 
            }
            const result = await supertest(app)
            .post("/finances")
            .send(body)
            .set('Authorization', `Bearer bb1a76e6-4508-4d10-aec1-25a2c09dc9bc`)
            expect(result.status).toEqual(400);
        });

        //event_type vazio
        it("returns status 401 for invalid params", async () => {
            const body = {
                "value": "3000",
                "event_type": "",
                "description": "ganhei" 
            }
            const result = await supertest(app)
            .post("/finances")
            .send(body)
            .set('Authorization', `Bearer bb1a76e6-4508-4d10-aec1-25a2c09dc9bc`)
            expect(result.status).toEqual(401);
        });

        //event_type errado
        it("returns status 401 for invalid params", async () => {
            const body = {
                "value": "3000",
                "event_type": "coisa",
                "description": "lalala" 
            }
            const result = await supertest(app)
            .post("/finances")
            .send(body)
            .set('Authorization', `Bearer bb1a76e6-4508-4d10-aec1-25a2c09dc9bc`)
            expect(result.status).toEqual(401);
        });
 }); 
 

 describe("POST /finances", () => {
     //tudo certo
    it("returns text for valid params", async () => {
        const result = await supertest(app).post("/finances").set('Authorization', `Bearer bb1a76e6-4508-4d10-aec1-25a2c09dc9bc`)
        expect(result.type).toEqual("text/plain");
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