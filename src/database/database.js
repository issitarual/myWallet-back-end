import pg from 'pg';

const { Pool } = pg;

const connection = new Pool({
  user: 'postgress',
  password: '123456',
  host: 'localhost',
  port: 5432,
  database: 'mywallet'
});

export default connection;