export default msgData => {
  const errorType = msgData.errorType;
  const errorData = msgData.errorData;

  switch (errorType) {
    case 'badObject':
      alert('Error: Stop trying to hack me!');
      break;
    case 'takenUsername': {
      const usernameLabel = document.querySelector('#username-label');

      const usernameItemsArr = Array.from(document.querySelectorAll('#usernames-list li'));
      const takenUsernameItem = usernameItemsArr.find(usernameItem =>
        usernameItem.getAttribute('data-publicid') === errorData.publicidOfTakenUsername);

      const generateHandler = className => {
        return function handleAnimationend() {
          this.classList.remove(className);
        };
      };

      usernameLabel.addEventListener('animationend', generateHandler('bad-username'), { once: true });
      takenUsernameItem.addEventListener('animationend', generateHandler('taken-username'), { once: true });

      usernameLabel.classList.add('bad-username');
      takenUsernameItem.classList.add('taken-username');

      break;
    }
  }
};
