const MY_EMAIL = 'agent@example.com';
const TARGET_EMAIL = 'customer@example.com';
const API_URL = 'http://localhost:3000/api/messages';

$('#loggedInAs').text(`Logged in as: ${MY_EMAIL}`);

async function fetchAndRenderMessages() {
  const response = await fetch(API_URL);
  const messages = await response.json();

  $('#messages').empty();

  const filteredMessages = messages.filter((message) => (
    (message.sender_email === MY_EMAIL && message.receiver_email === TARGET_EMAIL) ||
    (message.sender_email === TARGET_EMAIL && message.receiver_email === MY_EMAIL)
  ));

  filteredMessages.forEach((message) => {
    const side = message.sender_email === MY_EMAIL ? 'mine' : 'theirs';
    const $row = $('<div>').addClass(`message-row ${side}`);
    const $bubble = $('<div>').addClass('message');

    $bubble.append($('<div>').addClass('message-email').text(message.sender_email));
    $bubble.append($('<div>').addClass('message-content').text(message.content));
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

fetchAndRenderMessages();
setInterval(fetchAndRenderMessages, 3000);
