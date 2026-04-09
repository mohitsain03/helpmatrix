const ADODB = require('node-adodb');
const connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.12.0;Data Source=HelpMatrix.accdb;Persist Security Info=False;');

async function dump() {
  try {
    const orders = await connection.query('SELECT * FROM [Orders]');
    console.log(JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error(err);
  }
}

dump();
