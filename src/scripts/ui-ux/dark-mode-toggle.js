export default function setUpDarkModeToggle() {
  const darkModeToggler = document.querySelector('#dark-mode-toggler');
  darkModeToggler.addEventListener('click', () => {
    document.querySelector('html').classList.toggle('dark-mode');
  });
}
