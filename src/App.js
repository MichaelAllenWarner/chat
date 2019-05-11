import React from 'react';
import { Menu } from './Menu';
import { Content } from './Content';

// window events set up in Chat.js
// document events set up in Menu.js

export const App = () => (
  <>
    <header>
      <Menu />
      <h1>Mike’s Chat App</h1>
    </header>
    <Content />
  </>
);