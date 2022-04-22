import React from 'react';
import './index.css';
import App from './App';
import ReactDOM from 'react-dom';
import { Msal2Provider } from '@microsoft/mgt-msal2-provider';
import { Providers } from '@microsoft/mgt-element';

Providers.globalProvider = new Msal2Provider({
  clientId: 'a2ee26d1-a1e2-4289-b37b-1da484a72fb8',
  scopes: ['ChatMember.Read', 'ChatMember.ReadWrite', 'Chat.ReadBasic', 'Chat.Read', 'Chat.ReadWrite']
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);