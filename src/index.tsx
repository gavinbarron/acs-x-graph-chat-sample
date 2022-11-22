import React from 'react';
import './index.css';
import App from './App';
import ReactDOM from 'react-dom';
import { Msal2Provider } from '@microsoft/mgt-msal2-provider';
import { Providers } from '@microsoft/mgt-element';

Providers.globalProvider = new Msal2Provider({
  clientId: '90913aff-de43-4c26-9f84-ffe0ebeedc9b', // must be the ClientID of the AAD app create for GNB
  scopes: ['ChatMember.Read', 'ChatMember.ReadWrite', 'Chat.ReadBasic', 'Chat.Read', 'Chat.ReadWrite']
});

// we need a second provider to handle the OBO calls via GNB which has a separate audience
const gnbProvider = new Msal2Provider({
  clientId: '90913aff-de43-4c26-9f84-ffe0ebeedc9b', // must be the ClientID of the AAD app create for GNB
  scopes: ['cbc7d490-3e80-4df6-868a-3859a8506272/.default']});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

export { gnbProvider };