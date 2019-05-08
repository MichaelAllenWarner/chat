import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MessagesWrapper } from './MessagesWrapper';
import { UsersWrapper } from './UsersWrapper';

class ContentGrid extends Component {
  state = {
    messageInput: '', // controls message-input value (so we can clear after submit)
    usernameInput: '' // does NOT control username-input value (no need)
  };

  clearMessageInput = () => {
    this.setState({
      messageInput: ''
    });
  };

  updateMessageInput = input => {
    this.setState({
      messageInput: input
    });
  };

  updateUsername = input => {
    this.setState({
      usernameInput: input
    });
  };

  sendMessage = () => {
    const message = JSON.stringify({
      type: 'text',
      text: this.state.messageInput.trim(),
      time: Date.now(),
      privateid: this.props.ids.privateid,
      publicid: this.props.ids.publicid,
      username: this.state.usernameInput.trim()
    });
    this.props.ws.send(message);
  };

  handleKeyDown = event => {
    if (event.key === 'Enter') {
      const usernameIsNew = (this.props.username !== this.state.usernameInput.trim());
      const thereIsText = this.state.messageInput.trim() ? true : false;

      if (usernameIsNew || thereIsText) {
        this.sendMessage();
        this.clearMessageInput();
      }
    }
  };

  render() {
    return (
      <div
        id="content-grid"
        onClick={this.props.handleClickOrTouchStart}
        onTouchStart={this.props.handleClickOrTouchStart}
      >
        <MessagesWrapper
          messages={this.props.messages}
          messageInputValue={this.state.messageInput}
          messagesRef={this.props.messagesRef}
          handleKeyDown={this.handleKeyDown}
          updateMessageInput={this.updateMessageInput}
        />
        <UsersWrapper
          usernames={this.props.usernames}
          usernameLabelRef={this.props.usernameLabelRef}
          handleKeyDown={this.handleKeyDown}
          updateUsername={this.updateUsername}
        />
      </div>
    );
  }
}

ContentGrid.propTypes = {
  handleClickOrTouchStart: PropTypes.func.isRequired,
  ids: PropTypes.object.isRequired,
  username: PropTypes.string.isRequired,
  usernames: PropTypes.arrayOf(PropTypes.object).isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  messagesRef: PropTypes.object.isRequired,
  usernameLabelRef: PropTypes.object.isRequired,
  ws: PropTypes.object.isRequired
};

export { ContentGrid };