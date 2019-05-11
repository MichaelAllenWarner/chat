import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  setRealVH,
  scrollToContentWrapperIfNeeded
} from './Chat-helpers';

class Chat extends Component {
  messagesRef = React.createRef();

  handleInput = event => {
    this.props.updateMessageInput(event.target.value);
  };

  scrollMessages = ({ scrHgt, scrTop, cliHgt }) => {
    const messagesWasScrolledDown = (scrHgt - scrTop <= cliHgt + 5);
    const messages = this.messagesRef.current;

    // scroll messages down if already was, else preserve scroll
    if (messagesWasScrolledDown) { 
      messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    } else {
      messages.scrollTop = scrTop;
      // messages.scrollTop = messages.scrollHeight - (scrHgt - scrTop);
      // when message is ADDED, we instead use `messages.scrollTop = scrTop;`
    }
  };

  getSnapshotBeforeUpdate(prevProps) {
    if (prevProps.messages.length !== this.props.messages.length) {
      const messages = this.messagesRef.current;
      return {
        scrHgt: messages.scrollHeight,
        scrTop: messages.scrollTop,
        cliHgt: messages.clientHeight
      };
    }
    return null;
  }

  componentDidUpdate(_prevProps, _prevState, snapshot) {
    if (snapshot !== null) {
      this.scrollMessages(snapshot);
    }
  }

  componentDidMount() {
    // set full-viewport and scroll as needed on window-resize
    // (would do in App component, but need messagesRef & order of execution matters)
    window.addEventListener('resize', () => {
      const messages = this.messagesRef.current;
      const messagesScrollData = {
        scrHgt: messages.scrollHeight,
        scrTop: messages.scrollTop,
        cliHgt: messages.clientHeight
      };
      setRealVH();
      scrollToContentWrapperIfNeeded();
      this.scrollMessages(messagesScrollData);
    });

    // also set full-viewport once on load
    setRealVH();
  }

  render() {
    return (
      <div id="messages-wrapper" className="content-wrapper">
        <h2>Chat</h2>
        <div id="messages-viewer" className="viewer">
          <div
            id="messages"
            ref={this.messagesRef}
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

Chat.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  messageInputValue: PropTypes.string.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  updateMessageInput: PropTypes.func.isRequired
};

export { Chat };