export const menuToggler = state =>
  state.menuClass === 'menu-out'
    ? { menuClass: 'menu-in' }
    : { menuClass: 'menu-out' };

export const menuOutIfIn = state =>
  state.menuClass === 'menu-in'
    ? { menuClass: 'menu-out' }
    : null;