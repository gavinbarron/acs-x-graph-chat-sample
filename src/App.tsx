import React from 'react';
import { Stack } from '@fluentui/react';
import { Login } from '@microsoft/mgt-react';
import { _GraphToolkitEnabledProvider as GP, _useGraphToolkitEnabled, _useIsSignedIn } from '@azure/communication-react';

const renderAppBody = () => {
  const [isSignedIn] = _useIsSignedIn();

  console.log('isSignedIn:', isSignedIn);

  if (!isSignedIn) return <Login />;

  return 'Invalid App Page.. Not sure how you got here.. file a github issue about this.';
}

// TODO FIX THIS!!!!
if (window.localStorage.getItem('GraphUIToolkitEnabled') !== 'true'){
  window.localStorage.setItem('GraphUIToolkitEnabled', 'true')
  window.location.reload();
}

function App() {
  return (
    <GP isEnabled={true}>
      <Stack verticalFill verticalAlign='center' horizontalAlign='center'>
        {renderAppBody()}
      </Stack>
    </GP>
  );
}

export default App;
