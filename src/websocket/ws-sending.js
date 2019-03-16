export default (ids, ws) => {
  const messageInput = document.querySelector('#message-input');
  const usernameInput = document.querySelector('#username-input');

  messageInput.addEventListener('keydown', handleKeydown);
  usernameInput.addEventListener('keydown', handleKeydown);

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      const ownUserItem = document.querySelector('#own-user');
      const ownUserItemText = ownUserItem.textContent;

      // because ' (You)' suffix is 6 characters
      const oldUsername = ownUserItemText.substring(0, ownUserItemText.length - 6);

      const username = usernameInput.value.trim();
      const usernameIsNew = (username !== oldUsername)
        && !(!username && oldUsername === 'An anonymous user');

      const text = messageInput.value;
      const thereIsText = text.trim() ? true : false;

      if (usernameIsNew || thereIsText) {
        ws.send(JSON.stringify({
          type: 'text',
          text,
          time: Date.now(),
          privateid: ids.privateid,
          publicid: ids.publicid,
          username
        }));

        if (thereIsText) {
          messageInput.value = '';
        }
      }
    }
  }
};
