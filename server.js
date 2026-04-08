const express = require('express');
const cors = require('cors');
const ADODB = require('node-adodb');

const app = express();
app.use(cors());
app.use(express.json());
// Serve static files from the current directory
app.use(express.static('.'));

const connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.12.0;Data Source=HelpMatrix.accdb;Persist Security Info=False;');

// Helper to escape single quotes for MS Access SQL
function sqlEscape(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
}

// REGISTER API
app.post('/api/register', async (req, res) => {
  const { name, mobile, address, password, role, category, org } = req.body;
  try {
    // Check if user exists
    const users = await connection.query(`SELECT * FROM Users WHERE Mobile = '${mobile}' AND Role = '${role}'`);
    if (users.length > 0) {
      return res.status(400).json({ error: 'User already exists in this role. Please login.' });
    }

    // Insert user
    await connection.execute(`
      INSERT INTO Users (FullName, Mobile, Address, [Password], Role, Category, Org) 
      VALUES ('${sqlEscape(name)}', '${sqlEscape(mobile)}', '${sqlEscape(address)}', '${sqlEscape(password)}', '${sqlEscape(role)}', '${sqlEscape(category || "")}', '${sqlEscape(org || "")}')
    `);
    
    res.json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// LOGIN API
app.post('/api/login', async (req, res) => {
  const { mobile, password, role } = req.body;
  try {
    const users = await connection.query(`SELECT * FROM Users WHERE Mobile = '${sqlEscape(mobile)}' AND [Password] = '${sqlEscape(password)}' AND Role = '${sqlEscape(role)}'`);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or role mismatch!' });
    }
    
    const user = users[0];
    res.json({ success: true, user: { name: user.FullName, mobile: user.Mobile, role: user.Role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ORDERS API (Submit from Consumer)
app.post('/api/orders', async (req, res) => {
  const { id, userMobile, item, address, urgency, status, date, price, providerMobile } = req.body;
  try {
    await connection.execute(`
      INSERT INTO Orders (OrderID, UserMobile, Item, Address, Urgency, Status, OrderDate, Price, ProviderMobile) 
      VALUES ('${sqlEscape(id)}', '${sqlEscape(userMobile)}', '${sqlEscape(item)}', '${sqlEscape(address)}', '${sqlEscape(urgency)}', '${sqlEscape(status)}', '${sqlEscape(date)}', '${sqlEscape(price || "0")}', '${sqlEscape(providerMobile || "Not Assigned")}')
    `);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET ORDERS 
app.get('/api/orders/:mobile', async (req, res) => {
  const { mobile } = req.params;
  try {
    const orders = await connection.query(`SELECT * FROM Orders WHERE UserMobile = '${mobile}'`);
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});
// Orders for a Provider (Incoming requests)
app.get('/api/provider/orders/:mobile', async (req, res) => {
  const { mobile } = req.params;
  try {
    let orders = await connection.query(`SELECT * FROM Orders WHERE ProviderMobile = '${sqlEscape(mobile)}'`);
    
    // Auto-seed mock data for every provider if they have no orders
    if (orders.length === 0) {
      const mockOrders = [
        ['HM-D' + Math.floor(1000+Math.random()*9000), '0987654321', 'Premium Saree Set', '456 MG Road, Mumbai', 'Normal', 'Pending', '4/8/2026', '1250', mobile],
        ['HM-D' + Math.floor(1000+Math.random()*9000), '1234567890', 'Leather Jacket', '789 Connaught Place, Delhi', 'High', 'Pending', '4/8/2026', '2499', mobile],
        ['HM-D' + Math.floor(1000+Math.random()*9000), '5555555555', 'Handmade Vase', '101 FC Road, Pune', 'Normal', 'Pending', '4/8/2026', '450', mobile]
      ];

      for (const mo of mockOrders) {
        await connection.execute(`
          INSERT INTO Orders (OrderID, UserMobile, Item, Address, Urgency, Status, OrderDate, Price, ProviderMobile) 
          VALUES ('${mo[0]}', '${mo[1]}', '${mo[2]}', '${mo[3]}', '${mo[4]}', '${mo[5]}', '${mo[6]}', '${mo[7]}', '${mo[8]}')
        `);
      }
      // Re-fetch now that we've seeded
      orders = await connection.query(`SELECT * FROM Orders WHERE ProviderMobile = '${sqlEscape(mobile)}'`);
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Products for a Provider
app.get('/api/provider/products/:mobile', async (req, res) => {
  const { mobile } = req.params;
  try {
    const products = await connection.query(`SELECT * FROM Products WHERE ProviderMobile = '${sqlEscape(mobile)}'`);
    res.json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add Product (Provider)
app.post('/api/provider/products', async (req, res) => {
  const { id, mobile, name, category, price, status } = req.body;
  try {
    await connection.execute(`
      INSERT INTO Products (ProductID, ProviderMobile, ItemName, Category, Price, [Status]) 
      VALUES ('${sqlEscape(id)}', '${sqlEscape(mobile)}', '${sqlEscape(name)}', '${sqlEscape(category)}', '${sqlEscape(price)}', '${sqlEscape(status)}')
    `);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(3000, () => {
  console.log('HelpMatrix Backend running on http://localhost:3000');
});
