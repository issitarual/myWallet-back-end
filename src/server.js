import express from 'express';
import connection from './database/database.js';

const app = express();
app.use(express.json());

app.listen(4000, () => {
    console.log('Server is listening on port 4000.');
  });