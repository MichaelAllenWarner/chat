setRealViewportHeightVar();
window.addEventListener('resize', setRealViewportHeightVar);

function setRealViewportHeightVar() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
