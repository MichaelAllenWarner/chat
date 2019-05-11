import React, { Component } from 'react';
import { menuToggler, menuOutIfIn } from './Header-helpers';

class Header extends Component {
  state = {
    menuClass: 'menu-out' // toggles between 'menu-out' and 'menu-in'
  };

  menuRef = React.createRef();
  menuLogoRef = React.createRef();

  toggleMenu = () => {
    this.setState(menuToggler);
  };

  handleClickOrTouchStart = event => { // seems mobile Safari needs touchStart
    if (
      !this.menuRef.current.contains(event.target)
      && !this.menuLogoRef.current.contains(event.target)
    ) {
      this.setState(menuOutIfIn);
    }
  };

  toggleDarkMode = () => { // modify <html> tag directly
    document.querySelector('html').classList.toggle('dark-mode');
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClickOrTouchStart);
    document.addEventListener('touchstart', this.handleClickOrTouchStart);
  }

  render() {
    const verticalEllipsis = String.fromCharCode(0x22EE);

    return (
      <header>
        <div id="menu-flex">
          <span
            id="menu-logo"
            ref={this.menuLogoRef}
            onClick={this.toggleMenu}
          >
            &nbsp;{verticalEllipsis}&nbsp;
          </span>
          <div id="menu-wrapper">
            <div
              id="menu"
              ref={this.menuRef}
              className={this.state.menuClass}
            >
              <div
                className="menu-item"
                onClick={this.toggleDarkMode}
              >
                Toggle dark mode
              </div>
              <div className="menu-item">Sample menu item</div>
              <div className="menu-item">Another sample item</div>
            </div>
          </div>
        </div>
        <h1>Mike’s Chat App</h1>
      </header>
    );
  }
}

export { Header };