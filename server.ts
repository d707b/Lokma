import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database('lokma.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    tableNumber TEXT NOT NULL,
    notes TEXT,
    totalPrice REAL NOT NULL,
    items TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' }
  });
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    // Simple hardcoded password for demonstration
    if (password === 'lokma2024') {
      res.json({ success: true, token: 'admin-token-123' });
    } else {
      res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    }
  });

  app.get('/api/orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all() as any[];
    res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
  });

  app.post('/api/orders', (req, res) => {
    const { customerName, tableNumber, notes, totalPrice, items } = req.body;
    const stmt = db.prepare('INSERT INTO orders (customerName, tableNumber, notes, totalPrice, items) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(customerName, tableNumber, notes, totalPrice, JSON.stringify(items));
    
    const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid) as any;
    newOrder.items = JSON.parse(newOrder.items);
    
    io.emit('newOrder', newOrder);
    res.status(201).json(newOrder);
  });

  app.patch('/api/orders/:id/complete', (req, res) => {
    const { id } = req.params;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('completed', id);
    io.emit('orderCompleted', id);
    res.json({ success: true });
  });

  io.on('connection', (socket) => {
    console.log('Admin connected');
  });

  // Vite middleware for development
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
