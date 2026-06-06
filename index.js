const express = require('express');
const cors = require('cors');

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
    db.data.customers.push({
      id: nanoid(),
      email: 'customer2@example.com',
    });
  }

  await db.write();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/messages', (req, res) => {
    res.json(db.data.messages);
  });

  app.get('/api/customers', (req, res) => {
    res.json(db.data.customers);
  });

  app.put('/api/messages', async (req, res) => {
    if (!req.is('application/json')) {
      return res.status(400).json({ error: 'JSON content type is required' });
    }

    const { sender_email, receiver_email, content } = req.body;

    if (!sender_email) {
      return res.status(400).json({ error: 'Sender email is required' });
    }

    if (!receiver_email) {
      return res.status(400).json({ error: 'Receiver email is required' });
    }

    const senderExists =
      db.data.agents.some((agent) => agent.email === sender_email) ||
      db.data.customers.some((customer) => customer.email === sender_email);

    if (!senderExists) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    const receiverExists =
      db.data.agents.some((agent) => agent.email === receiver_email) ||
      db.data.customers.some((customer) => customer.email === receiver_email);

    if (!receiverExists) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const trimmedContent = String(content || '').trim();

    if (!trimmedContent) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const message = {
      sender_email,
      receiver_email,
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
