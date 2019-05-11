import React from 'react';
import { Header } from './Header';
import { Content } from './Content';

// window events set up in Chat.js
// document events set up in Header.js

export const App = () => (
  <>
    <Header />
    <Content />
  </>
);