const ADODB = require('node-adodb');
const path = require('path');
const DB_PATH = path.join(__dirname, 'HelpMatrix.accdb');
const connection = ADODB.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${DB_PATH};Persist Security Info=False;`);

async function updateSchema() {
  console.log("Updating Database Schema with Notifications and Messages tables...");
  
  try {
    // 1. Create Notifications Table
    try {
      await connection.execute(`
        CREATE TABLE Notifications (
          ID AUTOINCREMENT PRIMARY KEY,
          UserMobile VARCHAR(50),
          Content MEMO,
          IsRead BIT,
          CreateDate VARCHAR(50)
        )
      `);
      console.log("✅ Notifications table created");
    } catch (e) {
      if (e.message.includes("already exists")) {
        console.log("ℹ️ Notifications table already exists");
      } else {
        throw e;
      }
    }

    // 2. Create Messages Table
    try {
      await connection.execute(`
        CREATE TABLE Messages (
          ID AUTOINCREMENT PRIMARY KEY,
          OrderID VARCHAR(50),
          SenderMobile VARCHAR(50),
          ReceiverMobile VARCHAR(50),
          Message MEMO,
          CreateDate VARCHAR(50)
        )
      `);
      console.log("✅ Messages table created");
    } catch (e) {
      if (e.message.includes("already exists")) {
        console.log("ℹ️ Messages table already exists");
      } else {
        throw e;
      }
    }

    console.log("Database update completed successfully.");
  } catch (err) {
    console.error("❌ Error updating database:", err.process ? err.process.message : err.message);
  }
}

updateSchema();
