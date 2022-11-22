import React from 'react';
import './index.css';
import App from './App';
import ReactDOM from 'react-dom';
import { Msal2Provider } from '@microsoft/mgt-msal2-provider';
import { Providers } from '@microsoft/mgt-element';

Providers.globalProvider = new Msal2Provider({
  clientId: '90913aff-de43-4c26-9f84-ffe0ebeedc9b', // must be the ClientID of the AAD app create for GNB
  // request the scopes needed for direct to graph calls here
  // The OBO scopes are requested in the NotificationClient
  // With the separate scope request for the Notification Client there is a second consent screen
  scopes: ['User.Read', 'ChatMember.Read', 'ChatMember.ReadWrite', 'Chat.ReadBasic', 'Chat.Read', 'Chat.ReadWrite']
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);