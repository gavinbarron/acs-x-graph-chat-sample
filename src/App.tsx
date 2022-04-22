import React, { useEffect, useState } from 'react';
import { Spinner, Stack } from '@fluentui/react';
import { Login } from '@microsoft/mgt-react';
import { _GraphToolkitEnabledProvider as GP, _useIsSignedIn } from '@azure/communication-react';
import { ChatThreadSelectionPage } from './pages/ChatThreadSelectionPage';
import { Model } from './graph-adapter/Model';
import { ChatPage } from './pages/ChatPage';

// TODO FIX THIS
if (window.localStorage.getItem('GraphUIToolkitEnabled') !== 'true'){
  window.localStorage.setItem('GraphUIToolkitEnabled', 'true')
  window.location.reload();
}

const AppBody = (): JSX.Element => {
  const [isSignedIn] = _useIsSignedIn();
  const [graphData, setGraphData] = useState<Model>();
  const [activeChatThread, setActiveChatThread] = useState<string>();

  useEffect(() => {
    if (isSignedIn) {
      (async () => {
        const model = new Model();
        await model.populateAllThreads();
        setGraphData(model);
      })();
    }
  }, [isSignedIn]);

  if (!isSignedIn) return <Login />;
  if (!graphData) return <Spinner label="Fetching chat information from Microsoft Graph..." />;

  if (!activeChatThread) {
    return <ChatThreadSelectionPage threads={graphData.getAllThreads()} joinChatThread={(threadId) => {setActiveChatThread(threadId)}} />;
  }

  if (activeChatThread) {
    return <ChatPage model={graphData} threadId={activeChatThread} leaveChat={() => setActiveChatThread(undefined)} />;
  }

  return <>{'Invalid App Page.. Not sure how you got here.. file a github issue about this.'}</>;
}

function App() {
  return (
    <GP isEnabled={true}>
      <Stack verticalFill verticalAlign='center' horizontalAlign='center'>
        <AppBody />
      </Stack>
    </GP>
  );
}

export default App;
