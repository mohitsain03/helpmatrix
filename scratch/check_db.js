const ADODB = require('node-adodb');
const connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.12.0;Data Source=HelpMatrix.accdb;Persist Security Info=False;');

async function check() {
  try {
    const tables = ['Users', 'Orders', 'Products'];
    for (let table of tables) {
      try {
        const result = await connection.query(`SELECT COUNT(*) as total FROM [${table}]`);
        console.log(`${table} count:`, result[0].total);
      } catch (e) {
        console.error(`Error querying ${table}:`, e.process.message);
      }
    }
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

check();
