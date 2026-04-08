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
        OrderDate VARCHAR(50),
        Price VARCHAR(50),
        ProviderMobile VARCHAR(50)
      )
    `);
    console.log("Orders table created");

    // Products table
    await connection.execute(`
      CREATE TABLE Products (
        ProductID VARCHAR(50) PRIMARY KEY,
        ProviderMobile VARCHAR(50),
        ItemName VARCHAR(255),
        Category VARCHAR(100),
        Price VARCHAR(50),
        [Status] VARCHAR(50)
      )
    `);
    console.log("Products table created");

    // Seed Mock Data for Provider 9999999999
    const mockOrders = [
      ['HM-1001', '0987654321', 'Cotton Saree Set', '456 Mumbai St', 'Normal', 'Pending', '4/8/2026', '650', '9999999999'],
      ['HM-1002', '1234567890', 'Winter Jacket', '789 Delhi Ave', 'High', 'Pending', '4/8/2026', '899', '9999999999'],
      ['HM-1003', '5555555555', 'Linen Kurta', '101 Pune Rd', 'Normal', 'Pending', '4/8/2026', '1200', '9999999999']
    ];

    for (const mo of mockOrders) {
      await connection.execute(`
        INSERT INTO Orders (OrderID, UserMobile, Item, Address, Urgency, Status, OrderDate, Price, ProviderMobile) 
        VALUES ('${mo[0]}', '${mo[1]}', '${mo[2]}', '${mo[3]}', '${mo[4]}', '${mo[5]}', '${mo[6]}', '${mo[7]}', '${mo[8]}')
      `);
    }
    console.log("Mock orders seeded");
  } catch (error) {
    console.error("Error setting up tables:", error);
  }
}

setup();
