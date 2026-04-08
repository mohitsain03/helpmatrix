const ADODB = require('node-adodb');
const connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.12.0;Data Source=HelpMatrix.accdb;Persist Security Info=False;');

async function setup() {
  try {
    await connection.execute(`
      CREATE TABLE Users (
        ID AUTOINCREMENT PRIMARY KEY,
        FullName VARCHAR(255),
        Mobile VARCHAR(50),
        Address MEMO,
        [Password] VARCHAR(255),
        Role VARCHAR(50),
        Category VARCHAR(100),
        Org VARCHAR(255)
      )
    `);
    console.log("Users table created");

    await connection.execute(`
      CREATE TABLE Orders (
        OrderID VARCHAR(50) PRIMARY KEY,
        UserMobile VARCHAR(50),
        Item VARCHAR(255),
        Address MEMO,
        Urgency VARCHAR(50),
        Status VARCHAR(50),
        OrderDate VARCHAR(50)
      )
    `);
    console.log("Orders table created");
  } catch (error) {
    console.error("Error setting up tables:", error);
  }
}

setup();
