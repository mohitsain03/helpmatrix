const express = require('express');
const cors = require('cors');
const path = require('path');
const ADODB = require('node-adodb');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const DB_PATH = path.join(__dirname, 'HelpMatrix.accdb');
const connection = ADODB.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${DB_PATH};Persist Security Info=False;`);

// Helper for SQL execution
async function query(sql) {
  try {
    return await connection.query(sql);
  } catch (err) {
    console.error('Database Query Error:', err.process ? err.process.message : err.message);
    throw err;
  }
}

async function execute(sql) {
  try {
    return await connection.execute(sql);
  } catch (err) {
    console.error('Database Execution Error:', err.process ? err.process.message : err.message);
    throw err;
  }
}

// Category Mapping helper
function getTableName(category) {
  const map = {
    'electronics': 'Electronics',
    'clothing': 'Clothing',
    'household': 'Household',
    'household workers': 'Household',
    'aadhaar': 'Aadhaar',
    'aadhaar services': 'Aadhaar',
    'blood-bank': 'BloodBank',
    'blood bank': 'BloodBank',
    'emergency': 'Emergency',
    'emergency helpline': 'Emergency'
  };
  return map[category.toLowerCase()] || 'Household';
}

// GET Category Items API
app.get('/api/items/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const tableName = getTableName(category);
    
    // Query the specific category table
    const rows = await query(`SELECT * FROM [${tableName}]`);
    
    const items = rows.map(r => ({
      id: r.ProductID,
      name: r.ItemName,
      meta: r.Meta || "",
      tags: (r.Tags || "").split(',').filter(t => t),
      price: r.Price,
      image: r.Image,
      badge: r.Badge,
      isUrgent: r.IsUrgent === true || r.IsUrgent === -1
    }));
    
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch items' });
  }
});

// REGISTER API
app.post('/api/register', async (req, res) => {
  try {
    const { name, mobile, address, password, role, category, org } = req.body;
    
    const existing = await query(`SELECT * FROM Users WHERE Mobile = '${mobile}' AND Role = '${role}'`);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists in this role. Please login.' });
    }

    await execute(`
      INSERT INTO Users (FullName, Mobile, Address, [Password], Role, Category, Org)
      VALUES ('${name}', '${mobile}', '${address.replace(/'/g, "''")}', '${password}', '${role}', '${category || ""}', '${org || ""}')
    `);
    
    res.json({ success: true, message: 'Account created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// LOGIN API
app.post('/api/login', async (req, res) => {
  try {
    const { mobile, password, role } = req.body;
    const users = await query(`SELECT * FROM Users WHERE Mobile = '${mobile}' AND [Password] = '${password}' AND Role = '${role}'`);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or role mismatch!' });
    }
    
    const user = users[0];
    res.json({ success: true, user: { name: user.FullName, mobile: user.Mobile, role: user.Role } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ORDERS API (Submit)
app.post('/api/orders', async (req, res) => {
  try {
    const { id, userMobile, item, address, urgency, status, date, price, providerMobile } = req.body;
    
    await execute(`
      INSERT INTO Orders (OrderID, UserMobile, Item, Address, Urgency, Status, OrderDate, Price, ProviderMobile)
      VALUES ('${id}', '${userMobile}', '${item.replace(/'/g, "''")}', '${address.replace(/'/g, "''")}', '${urgency}', '${status}', '${date}', '${price || "0"}', '${providerMobile || "Not Assigned"}')
    `);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Order submission failed' });
  }
});

// GET ORDERS (Consumer)
app.get('/api/orders/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    const rows = await query(`SELECT * FROM Orders WHERE UserMobile = '${mobile}'`);
    res.json({ success: true, orders: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Orders for a Provider
app.get('/api/provider/orders/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    let rows = await query(`SELECT * FROM Orders WHERE ProviderMobile = '${mobile}'`);
    
    if (rows.length === 0) {
      const mockOrders = [
        ['HM-D' + Math.floor(1000+Math.random()*9000), '0987654321', 'Premium Saree Set', '456 MG Road, Mumbai', 'Normal', 'Pending', '4/8/2026', '1250', mobile],
        ['HM-D' + Math.floor(1000+Math.random()*9000), '1234567890', 'Leather Jacket', '789 Connaught Place, Delhi', 'High', 'Pending', '4/8/2026', '2499', mobile]
      ];
      
      for (const mo of mockOrders) {
        await execute(`
          INSERT INTO Orders (OrderID, UserMobile, Item, Address, Urgency, Status, OrderDate, Price, ProviderMobile)
          VALUES ('${mo[0]}', '${mo[1]}', '${mo[2]}', '${mo[3]}', '${mo[4]}', '${mo[5]}', '${mo[6]}', '${mo[7]}', '${mo[8]}')
        `);
      }
      rows = await query(`SELECT * FROM Orders WHERE ProviderMobile = '${mobile}'`);
    }
    
    res.json({ success: true, orders: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch provider orders' });
  }
});

// Products for a Provider
app.get('/api/provider/products/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    
    // Note: To find products by provider across all tables, we'd need to UNION or loop.
    // For now, checking the Category associated with the user role might be more efficient,
    // but here we'll just check the most common tables for the product list.
    const tables = ['Electronics', 'Clothing', 'BloodBank', 'Aadhaar', 'Emergency', 'Household'];
    let allProducts = [];
    
    for(const table of tables) {
        const rows = await query(`SELECT * FROM [${table}] WHERE ProviderMobile = '${mobile}'`);
        allProducts = allProducts.concat(rows);
    }
    
    res.json({ success: true, products: allProducts });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch provider products' });
  }
});

// Add Product (Provider)
app.post('/api/provider/products', async (req, res) => {
  try {
    const { id, mobile, name, category, price, status } = req.body;
    const tableName = getTableName(category);
    
    await execute(`
      INSERT INTO [${tableName}] (ProductID, ProviderMobile, ItemName, Price, [Status])
      VALUES ('${id}', '${mobile}', '${name.replace(/'/g, "''")}', '${price}', '${status || "Pending"}')
    `);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add product' });
  }
});

app.listen(3000, () => {
  console.log('HelpMatrix Backend running on http://localhost:3000 (Multi-Table Access Mode)');
});
