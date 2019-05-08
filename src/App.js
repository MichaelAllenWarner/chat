import React, { Component } from 'react';
import { Header } from './Header';
import { ContentGrid } from './ContentGrid';

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

  toggleMenu = () => {
    const newMenuClass = (this.state.menuClass === 'menu-out')
      ? 'menu-in'
      : 'menu-out';
    this.setState({
      menuClass: newMenuClass
    });
  };

  handleClickOrTouchStart = event => { // seems mobile Safari needs touchStart
    if (this.state.menuClass === 'menu-in'
      && !this.menuRef.current.contains(event.target)
      && !this.menuLogoRef.current.contains(event.target)
    ) {
      this.toggleMenu();
    }
  };

  setIds = newIds => {
    this.setState({
      ids: newIds
    });
  };

  setUsernameAndUsernames = receivedUsernames => {
    let newUsername;
    const newUsernames = [];
    for (const [publicid, username] of receivedUsernames) {
      if (publicid === this.state.ids.publicid) {
        newUsername = username;
        newUsernames.unshift( // so own username is always listed first
          <li
            key={publicid}
            id='own-user'
            data-publicid={publicid}
          >
            {username ? `${username} (You)` : 'An anonymous user (You)'}
          </li>
        );
      } else {
        this[`${publicid}Ref`] = React.createRef();
        newUsernames.push(
          <li
            key={publicid}
            data-publicid={publicid}
            ref={this[`${publicid}Ref`]}
          >
            {username || 'An anonymous user'}
          </li>
        );
      }
    }    
    this.setState({
      username: newUsername,
      usernames: newUsernames
    });
  };

  setMessages = msgData => {
    const newMessages = [...this.state.messages];
    newMessages.push(
      <p
        key={msgData.time} // guaranteed unique? maybe include publicid somehow?
        data-time={new Date(msgData.time)}
        className={msgData.publicid === this.state.ids.publicid ? 'own-message' : 'other-message'}
      >
        <span className='username-prefix'>
          {msgData.username || 'An anonymous user'}:&nbsp;
        </span>
        {msgData.text}
      </p>
    );
    this.setState({
      messages: newMessages
    });
  };

  handleError = msgData => {
    const errorType = msgData.errorType;
    const errorData = msgData.errorData;
  
    switch (errorType) {
      case 'badObject': {
        window.alert('Error: Stop trying to hack me!');
        break;
      }
      case 'takenUsername': { // IS THERE A MORE REACT-Y WAY TO DO THIS?
        const usernameLabel = this.usernameLabelRef.current;
        const takenUsernameItem = this[`${errorData.publicidOfTakenUsername}Ref`].current;
  
        const generateHandler = className => {
          return function handleAnimationend() {
            this.classList.remove(className);
          };
        };
  
        usernameLabel.addEventListener('animationend', generateHandler('bad-username'), { once: true });
        takenUsernameItem.addEventListener('animationend', generateHandler('taken-username'), { once: true });
  
        usernameLabel.classList.add('bad-username');
        takenUsernameItem.classList.add('taken-username');
  
        break;
      }
    }
  };  

  // works w/ CSS to maintain full-height on all devices
  // (will run once on load and then on window-resize)
  setRealVH = () => {
    const realVH = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${realVH}px`);
  };

  // keeps correct area in view when virtual keyboard appears on mobile
  // (will run on window-resize, which "detects" virtual-keyboard toggle)
  scrollToContentWrapperIfNeeded = () => {
    const activeEl = document.activeElement;
    if (activeEl.classList.contains('content-input')) {
      activeEl.parentNode.parentNode.scrollIntoView(false);
    }
  };

  // scrolls messages as needed on window-resize
  // (default behavior is to scroll UP! we must override)
  scrollMessages = scrollData => {
    const { scrHgt, scrTop, cliHgt } = scrollData;
    const messages = this.messagesRef.current;

    const messagesWasScrolledDown = (scrHgt - scrTop <= cliHgt + 5);

    // scroll messages down if already was, else preserve scroll
    if (messagesWasScrolledDown) { 
      messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    } else {
      messages.scrollTop = messages.scrollHeight - (scrHgt - scrTop);
      // when message is ADDED, we instead use `messages.scrollTop = scrTop;`
      // (see MessagesWrapper.js)
    }
  };

  componentDidMount() {
    // SET UP RESPONSIVE DESIGN (RESIZE CONTENT AND SCROLL WHEN NEEDED)

    // set full-height once on load
    this.setRealVH();

    // set full-height and scroll on window-resize
    window.addEventListener('resize', () => {
      const messages = this.messagesRef.current;
      const messagesScrollData = {
        scrHgt: messages.scrollHeight,
        scrTop: messages.scrollTop,
        cliHgt: messages.clientHeight
      };
      this.setRealVH();
      this.scrollToContentWrapperIfNeeded();
      this.scrollMessages(messagesScrollData);
    });

    
    // SET UP WEBSOCKET

    // define window.location.origin if needed (Internet Explorer)
    if (!window.location.origin) {
      window.location.origin =
        window.location.protocol
        + '//'
        + window.location.hostname
        + (window.location.port
          ? ':' + window.location.port
          : '');
    }

    // connect to WebSocket (make it class property so can be passed down as prop)
    const HOST = window.location.origin.replace(/^http/, 'ws');
    this.ws = new WebSocket(HOST);

    // set up WebSocket receiving (sending is handled in ContentGrid.js)
    this.ws.onmessage = incomingMsgObj => {
      // console.log(incomingMsgObj);
      const msgData = JSON.parse(incomingMsgObj.data);
  
      switch (msgData.type) {
        case 'ids': {
          this.setIds(msgData.ids);
          break;
        }
        case 'users': {
          this.setUsernameAndUsernames(Object.entries(msgData.usernames));
          break;
        }
        case 'text': {
          this.setMessages(msgData);
          break;
        }
        case 'error': {
          this.handleError(msgData);
          break;
        }
      }
    };


    // SET UP DISCONNECTION ALERT FOR HEROKU (55-SECOND TIMEOUT):
    const herokuTimeoutAlert = () => {
      window.alert('You\'ve been disconnected from Mike\'s Chat App!\n'
      + '(Heroku does this after 55 seconds of server inactivity.)\n'
      + 'Please refresh the page to reconnect.');
    };

    if (window.location.hostname.includes('heroku')) {
      this.ws.onclose = () => {
        setTimeout(herokuTimeoutAlert, 1000); // so alert doesn't pop on manual close
      };
    }
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