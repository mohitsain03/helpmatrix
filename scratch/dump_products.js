const ADODB = require('node-adodb');
const connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.12.0;Data Source=HelpMatrix.accdb;Persist Security Info=False;');

async function dump() {
  try {
    const products = await connection.query('SELECT * FROM [Products]');
    console.log(JSON.stringify(products, null, 2));
  } catch (err) {
    console.error(err);
  }
}

dump();
