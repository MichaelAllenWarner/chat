// needed for React to support IE10 / IE11
import 'core-js/es/map';
import 'core-js/es/set';

import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App.js';

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);