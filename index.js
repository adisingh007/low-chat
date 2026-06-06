const express = require('express');

async function start() {
  const { JSONFilePreset } = await import('lowdb/node');
  const { nanoid } = await import('nanoid');

  const db = await JSONFilePreset('db.json', {
    agents: [],
    customers: [],
    messages: [],
  });

  db.data.agents ||= [];
  db.data.customers ||= [];
  db.data.messages ||= [];

  if (db.data.agents.length === 0) {
    db.data.agents.push({
      id: nanoid(),
      email: 'agent@example.com',
    });
  }

  if (db.data.customers.length === 0) {
    db.data.customers.push({
      id: nanoid(),
      email: 'customer@example.com',
    });
  }

  await db.write();

  const app = express();
  app.use(express.json());

  app.get('/api/messages', (req, res) => {
    res.json(db.data.messages);
  });

  app.put('/api/messages', async (req, res) => {
    if (!req.is('application/json')) {
      return res.status(400).json({ error: 'JSON content type is required' });
    }

    const { email, content } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const userExists =
      db.data.agents.some((agent) => agent.email === email) ||
      db.data.customers.some((customer) => customer.email === email);

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const trimmedContent = String(content || '').trim();

    if (!trimmedContent) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const message = {
      email,
      content: trimmedContent,
    };

    db.data.messages.push(message);
    await db.write();

    res.json(message);
  });

  app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
