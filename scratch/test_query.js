const ADODB = require('node-adodb');
const path = require('path');
const DB_PATH = path.join(__dirname, '..', 'HelpMatrix.accdb');
const connection = ADODB.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${DB_PATH};Persist Security Info=False;`);

async function testQuery() {
  try {
    const mobile = '1111111111'; // mohit provider
    console.log("Testing with Status (no brackets)...");
    const sql1 = `SELECT * FROM Orders WHERE Status = 'Pending' OR ProviderMobile = '${mobile}' ORDER BY OrderDate DESC`;
    const rows1 = await connection.query(sql1);
    console.log("Query 1 success, rows:", rows1.length);

    console.log("\nTesting with [Status] (with brackets)...");
    const sql2 = `SELECT * FROM Orders WHERE [Status] = 'Pending' OR ProviderMobile = '${mobile}' ORDER BY OrderDate DESC`;
    const rows2 = await connection.query(sql2);
    console.log("Query 2 success, rows:", rows2.length);

  } catch (err) {
    console.error("Query failed!");
    console.error(err.process ? err.process.message : err.message);
  }
}
testQuery();
