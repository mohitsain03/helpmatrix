const ADODB = require('node-adodb');
const path = require('path');
const DB_PATH = path.join(__dirname, 'HelpMatrix.accdb');
const connection = ADODB.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${DB_PATH};Persist Security Info=False;`);

async function check() {
  try {
    console.log("Checking Users...");
    const users = await connection.query('SELECT * FROM Users');
    console.log("Users count:", users.length);
    console.log(users);

    console.log("\nChecking Orders...");
    const orders = await connection.query('SELECT * FROM Orders');
    console.log("Orders count:", orders.length);
    console.log(orders);
    
    console.log("\nChecking ProviderProducts...");
    const prod = await connection.query('SELECT * FROM ProviderProducts');
    console.log("Products count:", prod.length);
  } catch (err) {
    console.error("DB Error:", err);
  }
}
check();
