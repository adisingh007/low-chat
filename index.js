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

  app.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
