import express from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import connection from './database/database.js';
import cors from 'cors';

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
})

app.listen(4000, () => {
    console.log('Server is listening on port 4000.');
  });