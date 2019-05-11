import React, { Component } from 'react';
import { Chat } from './Chat';
import { Users } from './Users';
import {
  generateUsersSetter,
  generateMessagesSetter,
  errorHandler,
  defineOriginIfNeeded,
  herokuTimeoutAlert
} from './Content-helpers';

class Content extends Component {
  state = {
    ids: {}, // will have 2 key/value pairs: publicid & privateid
    username: '',
    usernames: [], // each element is <li>[displayed username]</li> w/ attributes
    messages: [], // each element is <p><span>username: </span>message</p> w/ attributes
    messageInput: '', // controls message-input value (so we can clear after submit)
    usernameInput: '' // does NOT control username-input value (no need)
  };

  usernameLabelRef = React.createRef();
  userItemRefs = {}; // will have ref for each user's <li> element (`${publicid}Ref`)

  clearMessageInput = () => {
    this.setState({ messageInput: '' });
  };

  updateMessageInput = input => {
    this.setState({ messageInput: input });
  };

  updateUsername = input => {
    this.setState({ usernameInput: input });
  };

  sendMessage = () => {
    const message = JSON.stringify({
      type: 'text',
      text: this.state.messageInput.trim(),
      time: Date.now(),
      privateid: this.state.ids.privateid,
      publicid: this.state.ids.publicid,
      username: this.state.usernameInput.trim()
    });
    this.ws.send(message);
  };

  handleKeyDown = event => {
    if (event.key !== 'Enter') {
      return;
    }

    const thereIsText = !!this.state.messageInput.trim();
    const usernameIsNew = (this.state.username !== this.state.usernameInput.trim());
    const usernameIsTaken = this.state.usernames.some(usernameItem =>
      usernameItem.props.children === this.state.usernameInput.trim()
      && usernameItem.key !== this.state.ids.publicid
    );

    if (thereIsText || usernameIsNew) {
      this.sendMessage();
      if (!usernameIsTaken) {
        this.clearMessageInput();
      }
    }
  };

  componentDidMount() {

    // define window.location.origin if needed (Internet Explorer)
    defineOriginIfNeeded();

    // create WebSocket (as class property!)
    const HOST = window.location.origin.replace(/^http/, 'ws');
    this.ws = new WebSocket(HOST);

    // set up WebSocket receiving (sending is set up in sendMessage() above)
    this.ws.onmessage = incomingMsgObj => {
      // console.log(incomingMsgObj);
  
      const msgData = JSON.parse(incomingMsgObj.data);
  
      switch (msgData.type) {

        case 'ids': {
          this.setState({ ids: msgData.ids });
          break;
        }

        case 'users': {
          // clear and replace user refs
          this.userItemRefs = {};
          for (const publicid of Object.keys(msgData.usernames)) {
            this.userItemRefs[`${publicid}Ref`] = React.createRef();
          }
          // set username and usernames state (latter uses the new user refs)
          const users = Object.entries(msgData.usernames);
          const setUsernameAndUsernames = generateUsersSetter(users);
          this.setState(setUsernameAndUsernames);
          break;
        }

        case 'text': {
          const setMessages = generateMessagesSetter(msgData);
          this.setState(setMessages);
          break;
        }
        
        case 'error': {
          const handleError = errorHandler.bind(this);
          handleError(msgData); // if taken username, uses userItemRefs
          break;
        }
      }
    };
  
    // set up disconnection alert for Heroku (55-second timeout)
    if (window.location.hostname.includes('heroku')) {
      this.ws.onclose = () => {
        setTimeout(herokuTimeoutAlert, 1000); // so alert doesn't pop on manual close
      };
    }
  }

  render() {
    return (
      <div id="content-grid">
        <Chat
          messages={this.state.messages}
          messageInputValue={this.state.messageInput}
          handleKeyDown={this.handleKeyDown}
          updateMessageInput={this.updateMessageInput}
        />
        <Users
          usernames={this.state.usernames}
          usernameLabelRef={this.usernameLabelRef}
          handleKeyDown={this.handleKeyDown}
          updateUsername={this.updateUsername}
        />
      </div>
    );
  }
}

export { Content };