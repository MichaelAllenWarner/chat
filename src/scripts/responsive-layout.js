export default function setUpResponsiveLayout() {
  setRealVH();

  window.addEventListener('resize', () => {
    setRealVH();
    scrollToContentWrapper();
    scrollDownMessages();
  });

  function setRealVH() {
    const realVH = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${realVH}px`);
  }

  function scrollToContentWrapper() {
    const activeEl = document.activeElement;
    if (activeEl.classList.contains('content-input')) {
      activeEl.parentNode.parentNode.scrollIntoView(false);
    }
  }

  function scrollDownMessages() {
    const messages = document.querySelector('#messages');
    messages.scrollTop = messages.scrollHeight - messages.clientHeight;
  }
}
