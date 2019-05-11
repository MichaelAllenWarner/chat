import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Users extends Component {
  handleInput = event => {
    this.props.updateUsername(event.target.value);
  };

  render() {
    return (
      <div id="users-wrapper" className="content-wrapper">
        <h2>Current Users</h2>
        <div id="users-viewer" className="viewer">
          <ul id="usernames-list">
            {this.props.usernames}
          </ul>
        </div>
        <div id="username-bar" className="bottom-bar">
          <label
            htmlFor="username-input"
            id="username-label"
            ref={this.props.usernameLabelRef}
          >
            Username:&nbsp;
          </label>
          <input
            id="username-input"
            type="text"
            className="content-input"
            onInput={this.handleInput}
            onKeyDown={this.props.handleKeyDown}
          />
        </div>
      </div>
    );
  }
}

Users.propTypes = {
  usernames: PropTypes.arrayOf(PropTypes.object).isRequired,
  usernameLabelRef: PropTypes.object.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  updateUsername: PropTypes.func.isRequired
};

export { Users };