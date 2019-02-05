export default function setUpMenuToggle() {
  const menuLogo = document.querySelector('#menu-logo');
  const menu = document.querySelector('#menu');

  menuLogo.addEventListener('click', () => {
    menu.classList.toggle('menu-in');
    menu.classList.toggle('menu-out');
  });

  // hide menu if click/touch outside of menu or menuLogo
  // (touchstart seems to be necessary on iPhone)
  document.addEventListener('touchstart', hideMenu);
  document.addEventListener('click', hideMenu);

  function hideMenu(event) {
    if (menu.classList.contains('menu-in')
        && !menu.contains(event.target)
        && !menuLogo.contains(event.target)) {
      menuLogo.click();
    }
  }
}
