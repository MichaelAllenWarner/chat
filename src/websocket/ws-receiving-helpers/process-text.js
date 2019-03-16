export default (msgData, ownPublicid) => {
  const newMsg = document.createElement('p');

  newMsg.setAttribute('data-time', new Date(msgData.time));

  const className = (msgData.publicid === ownPublicid) ? 'own-message' : 'other-message';
  newMsg.classList.add(className);

  const usernamePrefix = document.createElement('span');
  const displayedUsername = msgData.username || 'An anonymous user';
  usernamePrefix.textContent = `${displayedUsername}: `;
  usernamePrefix.classList.add('username-prefix');
  newMsg.appendChild(usernamePrefix);

  const textNode = document.createTextNode(msgData.text);
  newMsg.appendChild(textNode);

  const messages = document.querySelector('#messages');
  const scrHgt = messages.scrollHeight;
  const scrTop = messages.scrollTop;
  const cliHgt = messages.clientHeight;
  const messagesWasScrolledDown = (scrHgt - scrTop <= cliHgt + 5);

  messages.appendChild(newMsg);

  // scroll down messages if already was (nearly) scrolled down
  if (messagesWasScrolledDown) {
    messages.scrollTop = messages.scrollHeight - messages.clientHeight; 
  }
};
