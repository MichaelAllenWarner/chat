import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Header extends Component {
  toggleDarkMode = () => { // modify <html> tag directly
    document.querySelector('html').classList.toggle('dark-mode');
  };

  render() {
    const verticalEllipsis = String.fromCharCode(0x22EE);

    return (
      <header
        onClick={this.props.handleClickOrTouchStart}
        onTouchStart={this.props.handleClickOrTouchStart}
      >
        <div id="menu-flex">
          <span
            id="menu-logo"
            ref={this.props.menuLogoRef}
            onClick={this.props.toggleMenu}
          >
            &nbsp;{verticalEllipsis}&nbsp;
          </span>
          <div id="menu-wrapper">
            <div
              id="menu"
              ref={this.props.menuRef}
              className={this.props.menuClass}
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

Header.propTypes = {
  handleClickOrTouchStart: PropTypes.func.isRequired,
  menuRef: PropTypes.object.isRequired,
  menuLogoRef: PropTypes.object.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  menuClass: PropTypes.string.isRequired,
};

export { Header };