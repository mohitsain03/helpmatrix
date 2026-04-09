const ADODB = require('node-adodb');
const connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.12.0;Data Source=HelpMatrix.accdb;Persist Security Info=False;');

async function setup() {
  console.log("Starting Database Setup...");
  
  const tables = ['Users', 'Orders', 'Products'];
  for (const table of tables) {
    try {
      await connection.execute(`DROP TABLE [${table}]`);
      console.log(`Existing table ${table} dropped.`);
    } catch (e) {
      // Ignore if table doesn't exist
    }
  }

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
        OrderDate VARCHAR(50),
        Price VARCHAR(50),
        ProviderMobile VARCHAR(50)
      )
    `);
    console.log("Orders table created");

    // Expanded Products table
    await connection.execute(`
      CREATE TABLE Products (
        ProductID VARCHAR(50) PRIMARY KEY,
        ProviderMobile VARCHAR(50),
        ItemName VARCHAR(255),
        Category VARCHAR(100),
        Price VARCHAR(50),
        [Status] VARCHAR(50),
        [Meta] MEMO,
        [Tags] MEMO,
        [Image] MEMO,
        [Badge] VARCHAR(100),
        [IsUrgent] BIT
      )
    `);
    console.log("Products table created");

    console.log("Database setup completed successfully (Empty tables).");
  } catch (error) {
    console.error("Error setting up tables:", error);
  }
}

setup();
