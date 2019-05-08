import React, { Component } from 'react';
import PropTypes from 'prop-types';

class MessagesWrapper extends Component {
  handleInput = event => {
    this.props.updateMessageInput(event.target.value);
  };

  // preserve scroll data
  getSnapshotBeforeUpdate(prevProps) {
    if (prevProps.messages.length !== this.props.messages.length) {
      const messages = this.props.messagesRef.current;
      return {
        scrHgt: messages.scrollHeight,
        scrTop: messages.scrollTop,
        cliHgt: messages.clientHeight
      };
    }
    return null;
  }

  componentDidUpdate(_prevProps, _prevState, snapshot) {
    if (snapshot === null) {
      return;
    }

    const { scrHgt, scrTop, cliHgt } = snapshot;
    const messages = this.props.messagesRef.current;

    const messagesWasScrolledDown = (scrHgt - scrTop <= cliHgt + 5);

    // scroll messages down if already was, else preserve scroll
    if (messagesWasScrolledDown) { 
      messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    } else {
      messages.scrollTop = scrTop;
      // on window-resize (in App.js), we instead use:
      // `messages.scrollTop = messages.scrollHeight - (scrHgt - scrTop);`
    }
  }

  render() {
    return (
      <div id="messages-wrapper" className="content-wrapper">
        <h2>Chat</h2>
        <div id="messages-viewer" className="viewer">
          <div
            id="messages"
            ref={this.props.messagesRef}
          >
            {this.props.messages}
          </div>
        </div>
        <div id="input-bar" className="bottom-bar">
          <label htmlFor="message-input">Message: </label>
          <input 
            id="message-input"
            type="text"
            className="content-input"
            onInput={this.handleInput}
            onKeyDown={this.props.handleKeyDown}
            value={this.props.messageInputValue}
          />
        </div>
      </div>  
    );
  }
}

MessagesWrapper.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  messageInputValue: PropTypes.string.isRequired,
  messagesRef: PropTypes.object.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  updateMessageInput: PropTypes.func.isRequired
};

export { MessagesWrapper };