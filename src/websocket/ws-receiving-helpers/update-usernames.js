export default (usernames, ownPublicid) => {
  const usernamesList = document.querySelector('#usernames-list');
  while (usernamesList.firstChild) {
    usernamesList.removeChild(usernamesList.firstChild);
  }

  const ownUserItem = document.createElement('li');
  ownUserItem.id = 'own-user';
  ownUserItem.setAttribute('data-publicid', ownPublicid);
  usernamesList.appendChild(ownUserItem);

  for (const [publicid, username] of Object.entries(usernames)) {
    if (publicid === ownPublicid) {
      ownUserItem.textContent = (username) ? `${username} (You)` : 'An anonymous user (You)';
    } else {
      const usernameItem = document.createElement('li');
      usernameItem.textContent = username || 'An anonymous user';
      usernameItem.setAttribute('data-publicid', publicid);
      usernamesList.appendChild(usernameItem);
    }
  }
};
