export default () => {
  const darkModeToggler = document.querySelector('#dark-mode-toggler');
  darkModeToggler.addEventListener('click', () => {
    document.querySelector('html').classList.toggle('dark-mode');
  });
};
