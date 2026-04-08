const express = require('express');
const cors = require('cors');
const ADODB = require('node-adodb');

const app = express();
app.use(cors());
app.use(express.json());
// Serve static files from the current directory
app.use(express.static('.'));

const connection = ADODB.open('Provider=Microsoft.ACE.OLEDB.12.0;Data Source=HelpMatrix.accdb;Persist Security Info=False;');

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
      VALUES ('${name}', '${mobile}', '${address}', '${password}', '${role}', '${category || ""}', '${org || ""}')
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
    const users = await connection.query(`SELECT * FROM Users WHERE Mobile = '${mobile}' AND [Password] = '${password}' AND Role = '${role}'`);
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

// ORDERS API (Submit)
app.post('/api/orders', async (req, res) => {
  const { id, userMobile, item, address, urgency, status, date } = req.body;
  try {
    await connection.execute(`
      INSERT INTO Orders (OrderID, UserMobile, Item, Address, Urgency, Status, OrderDate) 
      VALUES ('${id}', '${userMobile}', '${item}', '${address}', '${urgency}', '${status}', '${date}')
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

app.listen(3000, () => {
  console.log('HelpMatrix Backend running on http://localhost:3000');
});
