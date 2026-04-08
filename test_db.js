const ADODB = require('node-adodb');
const connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.12.0;Data Source=HelpMatrix.accdb;Persist Security Info=False;');

async function test() {
  try {
    const users = await connection.query('SELECT TOP 1 * FROM Users');
    console.log('Database query successful:', users);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

test();
