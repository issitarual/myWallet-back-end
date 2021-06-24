import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import connection from './database/database.js';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

const app = express();
app.use(express.json());
app.use(cors());

app.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;

  const schema = Joi.object({
    name: Joi.string().alphanum().min(1).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] }}).required(),
    password: Joi.string().alphanum().pattern(/[a-zA-Z0-9]/).min(6).required(),
  })

  const { error, value } = schema.validate({
    name: name, 
    email: email, 
    password: password, 
  })

  if(error){
    return res.sendStatus(400);
  }

  try{
    const user = await connection.query(`
      SELECT * FROM users
      WHERE email = $1
    `, [email]);

    const validateUser = user.rows[0];

    if(validateUser){
      return res.sendStatus(400);
    }

    const hash = bcrypt.hashSync(password, 12);

    await connection.query(`
      INSERT INTO users
      (name, email, password)
      VALUES ($1, $2, $3)
    `, [name, email, hash])

    res.sendStatus(200);
  }
  catch(e){
    console.log(e);
    res.sendStatus(400);
  }
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  const schema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] }}).required(),
    password: Joi.string().alphanum().pattern(/[a-zA-Z0-9]/).min(6).required(),
  })

  const { error, value } = schema.validate({
    email: email, 
    password: password, 
  })

  if(error) return res.sendStatus(400);

  try{
    const result = await connection.query(`
      SELECT * FROM users
      WHERE email = $1
    `, [email]);

    const user = result.rows[0];

    if(user && bcrypt.compareSync(password, user.password)){
      const token = uuid();
      await connection.query(`
        INSERT INTO sessions ("userId", token)
        VALUES ($1, $2)
      `, [user.id, token]);

      user.token = token;
      delete user.password;

      res.send(user);
    } 
    else{ 
      res.sendStatus (401);
    }

  }
  catch(e){
    console.log(e);
    res.sendStatus(400);
  };
});

app.post("/finances", async (req, res) => {
  const authorization = req.headers['authorization'];
  const { value, description, event_type } = req.body;
  const token = authorization?.replace('Bearer ', "");

  if(!token) return sendStatus(401);

  const schema = Joi.object({
    value: Joi.number().min(1).required(),
    description: Joi.string().alphanum().pattern(/[a-zA-Z0-9]/).min(1).required()
  })

  const { error } = schema.validate({
    value: value, 
    description: description
  })

  if(error) return res.sendStatus(400);

  try{
    const result = await connection.query(`
      SELECT users.*, categories.id AS "categoryId"
      FROM sessions
      JOIN users
      ON sessions."userId" = users.id
      JOIN categories
      ON categories.name = $1
      WHERE sessions.token = $2
    `, [event_type, token]);
    const user = result.rows[0];
    if(user && user.categoryId){
      await connection.query(`
        INSERT INTO financial_events 
        (valor, description, "categoryId", "userId", created_at) 
        VALUES ($1, $2, $3, $4, NOW());
      `,[value, description, user.categoryId, user.id]);

      res.sendStatus(201);
    }
    else{
      res.sendStatus(401);
    }
    }
  catch{
    res.sendStatus(400);
  };
});

app.get("/finances", async (req, res) => {
  const authorization = req.headers['authorization'];
  const token = authorization?.replace('Bearer ', "");

  if(!token) return sendStatus(401);

  try{
    const result = await connection.query(`
      SELECT users.* FROM sessions
      JOIN users
      ON sessions."userId" = users.id
      WHERE sessions.token = $1
`   , [token]);
    const user = result.rows[0];

    if(user){
      const historic = await connection.query(`
        SELECT financial_events.created_at, financial_events.description, financial_events.valor, categories.name
        FROM sessions   
        JOIN financial_events
        ON financial_events."userId" = sessions."userId"
        JOIN categories
        ON categories.id = financial_events."categoryId"
        WHERE sessions.token = $1
      `, [token]);

    res.send(historic.rows);
    }
  }
  catch{
    res.sendStatus(400);
  }

});

app.post("/sign-out", async (req, res) => {
  const authorization = req.headers['authorization'];
  const token = authorization?.replace('Bearer ', "");

  if(!token) return sendStatus(401);
  try{
      await connection.query(`
      DELETE FROM sessions
      WHERE token = $1
    `, [token]);

    res.sendStatus(200);
  }
  catch{
    res.sendStatus(400);
  }
})

app.listen(4000, () => {
    console.log('Server is listening on port 4000.');
  });