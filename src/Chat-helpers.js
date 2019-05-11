// works w/ CSS to maintain full-height on all devices
// (will run once on load and then on window-resize)
export const setRealVH = () => {
  const realVH = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${realVH}px`);
};

// keeps correct area in view when virtual keyboard appears on mobile
// (will run on window-resize, which "detects" virtual-keyboard toggle)
export const scrollToContentWrapperIfNeeded = () => {
  const activeEl = document.activeElement;
  if (activeEl.classList.contains('content-input')) {
    activeEl.parentNode.parentNode.scrollIntoView(false);
  }
};