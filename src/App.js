import React, { Component } from 'react';
import { Header } from './Header';
import { ContentGrid } from './ContentGrid';
import {
  menuToggler,
  menuOutIfIn,
  generateUsernameAndUsernamesSetter,
  generateMessageSetter,
  errorHandler,
  setRealVH,
  setUpWindowListener,
  defineOriginIfNeeded,
  setUpHerokuTimeoutMessage
} from './app-helpers';


export class App extends Component {
  state = {
    ids: {}, // will have 2 key/value pairs: publicid & privateid
    username: '',
    usernames: [], // each element is <li>[displayed username]</li> w/ attributes
    messages: [], // each element is <p><span>username: </span>message</p> w/ attributes
    menuClass: 'menu-out' // toggles between 'menu-out' and 'menu-in'
  };

  menuRef = React.createRef();
  menuLogoRef = React.createRef();
  messagesRef = React.createRef();
  usernameLabelRef = React.createRef();
  // refs will also be created for each user's <li> element (`${publicid}Ref`)

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

  componentDidMount() {
    // SET UP RESPONSIVE DESIGN (RESIZE CONTENT AND SCROLL WHEN NEEDED)

    // set full-height once on load
    setRealVH();

    // set full-height and scroll on window-resize
    const setUpWindowResizeListener = setUpWindowListener.bind(this);
    setUpWindowResizeListener();

    
    // SET UP WEBSOCKET

    // define window.location.origin if needed (Internet Explorer)
    defineOriginIfNeeded();

    // connect to WebSocket (make it class property so can be passed down as prop)
    const HOST = window.location.origin.replace(/^http/, 'ws');
    this.ws = new WebSocket(HOST);

    // set up WebSocket receiving (sending is handled in ContentGrid.js)
    this.ws.onmessage = incomingMsgObj => {
      // console.log(incomingMsgObj);
      const msgData = JSON.parse(incomingMsgObj.data);
  
      switch (msgData.type) {
        case 'ids': {
          this.setState({ ids: msgData.ids });
          break;
        }
        case 'users': {
          const users = Object.entries(msgData.usernames);
          this.setState(generateUsernameAndUsernamesSetter(users));
          break;
        }
        case 'text': {
          this.setState(generateMessageSetter(msgData));
          break;
        }
        case 'error': {
          const handleError = errorHandler.bind(this);
          handleError(msgData);
          break;
        }
      }
    };


    // SET UP DISCONNECTION ALERT FOR HEROKU (55-SECOND TIMEOUT)

    const setUpTimeoutMessage = setUpHerokuTimeoutMessage.bind(this);
    setUpTimeoutMessage();
  }

  render() {
    return (
      <>
        <Header
          handleClickOrTouchStart={this.handleClickOrTouchStart}
          menuRef={this.menuRef}
          menuLogoRef={this.menuLogoRef}
          menuClass={this.state.menuClass}
          toggleMenu={this.toggleMenu}
        />
        <ContentGrid
          handleClickOrTouchStart={this.handleClickOrTouchStart}
          ids={this.state.ids}
          username={this.state.username}
          usernames={this.state.usernames}
          messages={this.state.messages}
          messagesRef={this.messagesRef}
          usernameLabelRef={this.usernameLabelRef}
          ws={this.ws}
        />
      </>
    );
  }
}