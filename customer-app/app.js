let MY_EMAIL = 'customer@example.com';
const TARGET_EMAIL = 'agent@example.com';
const API_URL = 'http://localhost:3000/api/messages';
const CUSTOMERS_API_URL = 'http://localhost:3000/api/customers';

$('#loggedInAs').text(`Logged in as: ${MY_EMAIL}`);

async function fetchAndRenderCustomers() {
  const response = await fetch(CUSTOMERS_API_URL);
  const customers = await response.json();

  $('#customerSelect').empty();

  customers.forEach((customer) => {
    $('#customerSelect').append(
      $('<option>').val(customer.email).text(customer.email)
    );
  });

  if (customers.length > 0) {
    MY_EMAIL = customers[0].email;
    $('#customerSelect').val(MY_EMAIL);
    $('#loggedInAs').text(`Logged in as: ${MY_EMAIL}`);
  }
}

async function markMessagesAsRead(messages) {
  const unreadMessages = messages.filter((message) => (
    !message.read &&
    message.receiver_email === MY_EMAIL &&
    message.sender_email === TARGET_EMAIL
  ));

  await Promise.all(unreadMessages.map((message) => (
    fetch(`${API_URL}/${message.id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: MY_EMAIL,
      }),
    })
  )));
}

async function fetchAndRenderMessages() {
  const response = await fetch(API_URL);
  const messages = await response.json();

  $('#messages').empty();

  const filteredMessages = messages.filter((message) => (
    (message.sender_email === MY_EMAIL && message.receiver_email === TARGET_EMAIL) ||
    (message.sender_email === TARGET_EMAIL && message.receiver_email === MY_EMAIL)
  ));

  await markMessagesAsRead(filteredMessages);

  filteredMessages.forEach((message) => {
    const side = message.sender_email === MY_EMAIL ? 'mine' : 'theirs';
    const $row = $('<div>').addClass(`message-row ${side}`);
    const $bubble = $('<div>').addClass('message');

    $bubble.append($('<div>').addClass('message-email').text(message.sender_email));
    const $content = $('<div>').addClass('message-content').text(message.content);

    if (message.sender_email === MY_EMAIL) {
      $content.append(
        $('<span>').addClass(`read-tick ${message.read ? 'read' : ''}`).text('✓')
      );
    }

    $bubble.append($content);
    $row.append($bubble);
    $('#messages').append($row);
  });

  $('#messages').scrollTop($('#messages')[0].scrollHeight);
}

async function sendMessage() {
  const content = $('#messageInput').val();

  if (!content.trim()) {
    return;
  }

  await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender_email: MY_EMAIL,
      receiver_email: TARGET_EMAIL,
      content,
    }),
  });

  $('#messageInput').val('');
  await fetchAndRenderMessages();
}

$('#sendButton').on('click', sendMessage);

$('#messageInput').on('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

$('#customerSelect').on('change', async () => {
  MY_EMAIL = $('#customerSelect').val();
  $('#loggedInAs').text(`Logged in as: ${MY_EMAIL}`);
  await fetchAndRenderMessages();
});

async function start() {
  await fetchAndRenderCustomers();
  await fetchAndRenderMessages();
}

start();
setInterval(fetchAndRenderMessages, 3000);
