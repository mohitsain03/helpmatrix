const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
// Serve static files from the current directory
app.use(express.static('.'));

const DATA_DIR = path.join(__dirname, 'data');

// Helper functions for JSON database
function readData(file) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return [];
  }
}

function writeData(file, data) {
  const filePath = path.join(DATA_DIR, file);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

// GET Category Items API
app.get('/api/items/:category', (req, res) => {
  const { category } = req.params;
  const items = readData(`${category.toLowerCase()}.json`);
  res.json({ success: true, items });
});

// REGISTER API
app.post('/api/register', (req, res) => {
  const { name, mobile, address, password, role, category, org } = req.body;
  const users = readData('users.json');
  
  if (users.find(u => u.Mobile === mobile && u.Role === role)) {
    return res.status(400).json({ error: 'User already exists in this role. Please login.' });
  }

  const newUser = {
    FullName: name,
    Mobile: mobile,
    Address: address,
    Password: password,
    Role: role,
    Category: category || "",
    Org: org || ""
  };

  users.push(newUser);
  writeData('users.json', users);
  
  res.json({ success: true, message: 'Account created successfully' });
});

// LOGIN API
app.post('/api/login', (req, res) => {
  const { mobile, password, role } = req.body;
  const users = readData('users.json');
  
  const user = users.find(u => u.Mobile === mobile && u.Password === password && u.Role === role);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or role mismatch!' });
  }
  
  res.json({ success: true, user: { name: user.FullName, mobile: user.Mobile, role: user.Role } });
});

// ORDERS API (Submit from Consumer)
app.post('/api/orders', (req, res) => {
  const { id, userMobile, item, address, urgency, status, date, price, providerMobile } = req.body;
  const orders = readData('orders.json');
  
  const newOrder = {
    OrderID: id,
    UserMobile: userMobile,
    Item: item,
    Address: address,
    Urgency: urgency,
    Status: status,
    OrderDate: date,
    Price: price || "0",
    ProviderMobile: providerMobile || "Not Assigned"
  };

  orders.push(newOrder);
  writeData('orders.json', orders);
  res.json({ success: true });
});

// GET ORDERS (Consumer)
app.get('/api/orders/:mobile', (req, res) => {
  const { mobile } = req.params;
  const orders = readData('orders.json');
  const userOrders = orders.filter(o => o.UserMobile === mobile);
  res.json({ success: true, orders: userOrders });
});

// Orders for a Provider (Incoming requests)
app.get('/api/provider/orders/:mobile', (req, res) => {
  const { mobile } = req.params;
  const orders = readData('orders.json');
  let providerOrders = orders.filter(o => o.ProviderMobile === mobile);
  
  // Auto-seed mock data for every provider if they have no orders
  if (providerOrders.length === 0) {
    const mockOrders = [
      { OrderID: 'HM-D' + Math.floor(1000+Math.random()*9000), UserMobile: '0987654321', Item: 'Premium Saree Set', Address: '456 MG Road, Mumbai', Urgency: 'Normal', Status: 'Pending', OrderDate: '4/8/2026', Price: '1250', ProviderMobile: mobile },
      { OrderID: 'HM-D' + Math.floor(1000+Math.random()*9000), UserMobile: '1234567890', Item: 'Leather Jacket', Address: '789 Connaught Place, Delhi', Urgency: 'High', Status: 'Pending', OrderDate: '4/8/2026', Price: '2499', ProviderMobile: mobile },
      { OrderID: 'HM-D' + Math.floor(1000+Math.random()*9000), UserMobile: '5555555555', Item: 'Handmade Vase', Address: '101 FC Road, Pune', Urgency: 'Normal', Status: 'Pending', OrderDate: '4/8/2026', Price: '450', ProviderMobile: mobile }
    ];
    orders.push(...mockOrders);
    writeData('orders.json', orders);
    providerOrders = mockOrders;
  }

  res.json({ success: true, orders: providerOrders });
});

// Products for a Provider
app.get('/api/provider/products/:mobile', (req, res) => {
  const { mobile } = req.params;
  const products = readData('provider_pending_products.json');
  const providerProducts = products.filter(p => p.ProviderMobile === mobile);
  res.json({ success: true, products: providerProducts });
});

// Add Product (Provider)
app.post('/api/provider/products', (req, res) => {
  const { id, mobile, name, category, price, status } = req.body;
  const products = readData('provider_pending_products.json');
  
  const newProduct = {
    ProductID: id,
    ProviderMobile: mobile,
    ItemName: name,
    Category: category,
    Price: price,
    Status: status || "Pending"
  };

  products.push(newProduct);
  writeData('provider_pending_products.json', products);
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('HelpMatrix Backend running on http://localhost:3000');
});

