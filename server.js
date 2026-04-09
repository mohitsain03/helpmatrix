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

// GET Category Items API (Unified view of system + community products)
app.get('/api/items/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const tableName = getTableName(category);
    
    // Fetch from system table
    const sysRows = await query(`SELECT * FROM [${tableName}]`);
    
    // Fetch from ProviderProducts where category matches
    // Using a broad check since category names in ProviderProducts might be "Clothing" vs "clothing"
    const communityRows = await query(`SELECT * FROM ProviderProducts WHERE Category = '${tableName}' OR Category = '${category}'`);
    
    const rows = [...sysRows, ...communityRows];
    
    const items = rows.map(r => ({
      id: r.ProductID,
      name: r.ItemName,
      meta: r.Meta || "",
      tags: (r.Tags || "").split(',').filter(t => t),
      price: r.Price,
      image: r.Image || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=300&fit=crop",
      badge: r.Badge || r.Status,
      isUrgent: r.IsUrgent === true || r.IsUrgent === -1,
      providerMobile: r.ProviderMobile
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
    const { id, userMobile, item, address, urgency, status, category, date, price, providerMobile } = req.body;
    
    await execute(`
      INSERT INTO Orders (OrderID, UserMobile, Item, Address, Urgency, Status, Category, OrderDate, Price, ProviderMobile)
      VALUES ('${id}', '${userMobile}', '${item.replace(/'/g, "''")}', '${address.replace(/'/g, "''")}', '${urgency}', '${status}', '${category || ""}', '${date}', '${price || "0"}', '${providerMobile || "Not Assigned"}')
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
    
    // 1. Get Provider info to know their category
    const providers = await query(`SELECT Category FROM Users WHERE Mobile = '${mobile}' AND Role = 'provider'`);
    if (providers.length > 0) {
      const providerCategory = providers[0].Category;
      // 2. Fetch orders: Specifically assigned OR unassigned matching category
      rows = await query(`
        SELECT * FROM Orders 
        WHERE (ProviderMobile = '${mobile}' OR (ProviderMobile = 'Not Assigned' AND (Category = '${providerCategory}' OR Category = 'General')))
        AND Status = 'Pending'
        ORDER BY OrderDate DESC
      `);
    }

    res.json({ success: true, orders: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch provider orders' });
  }
});

// Products for a Provider (Active and Pending)
app.get('/api/provider/products/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;
    
    const active = await query(`SELECT * FROM ProviderProducts WHERE ProviderMobile = '${mobile}'`);
    const pending = await query(`SELECT * FROM PendingProducts WHERE ProviderMobile = '${mobile}'`);
    
    res.json({ success: true, active, pending });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch provider products' });
  }
});

// Add Product (Provider) -> Goes to PENDING
app.post('/api/provider/products', async (req, res) => {
  try {
    const { id, mobile, name, category, price, status } = req.body;
    
    await execute(`
      INSERT INTO ProviderProducts (ProductID, ProviderMobile, ItemName, Category, Price, [Status], [Badge])
      VALUES ('${id}', '${mobile}', '${name.replace(/'/g, "''")}', '${category}', '${price}', 'Active', 'In Stock')
    `);
    
    res.json({ success: true, message: 'Product listed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to submit product' });
  }
});

// Update Order Status
app.patch('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, providerMobile } = req.body;
    
    if (providerMobile) {
      await execute(`
        UPDATE Orders 
        SET [Status] = '${status}', ProviderMobile = '${providerMobile}'
        WHERE OrderID = '${orderId}'
      `);
    } else {
      await execute(`
        UPDATE Orders 
        SET [Status] = '${status}' 
        WHERE OrderID = '${orderId}'
      `);
    }
    
    res.json({ success: true, message: `Order ${orderId} updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

app.listen(3000, () => {
  console.log('HelpMatrix Backend running on http://localhost:3000 (Provider Approval Mode)');
});
