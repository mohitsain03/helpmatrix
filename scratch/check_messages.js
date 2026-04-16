const ADODB = require('node-adodb');
const path = require('path');
const DB_PATH = path.join(__dirname, 'HelpMatrix.accdb');
const connection = ADODB.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${DB_PATH};Persist Security Info=False;`);

async function check() {
  try {
    console.log("Checking Messages...");
    try {
      const messages = await connection.query('SELECT * FROM Messages');
      console.log("Messages count:", messages.length);
      console.log(JSON.stringify(messages, null, 2));
    } catch(e) { console.log("Messages table error:", e.message); }

    console.log("\nChecking Notifications...");
    try {
      const notifications = await connection.query('SELECT * FROM Notifications');
      console.log("Notifications count:", notifications.length);
      console.log(JSON.stringify(notifications, null, 2));
    } catch(e) { console.log("Notifications table error:", e.message); }
    
  } catch (err) {
    console.error("DB Error:", err);
  }
}
check();
