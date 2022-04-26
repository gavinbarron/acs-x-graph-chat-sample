import React, { useEffect, useState } from 'react';
import { Spinner, Stack } from '@fluentui/react';
import { Login } from '@microsoft/mgt-react';
import { _useIsSignedIn } from '@azure/communication-react';
import { ChatThreadSelectionPage } from './pages/ChatThreadSelectionPage';
import { Model } from './graph-adapter/Model';
import { ChatPage } from './pages/ChatPage';
import { Providers } from '@microsoft/mgt-element';
import { User } from '@microsoft/microsoft-graph-types';

const AppBody = (): JSX.Element => {
  const [isSignedIn] = _useIsSignedIn();
  const [graphData, setGraphData] = useState<Model>();
  const [activeChatThread, setActiveChatThread] = useState<string>();
  const [me, setMe] = useState<User>();

  useEffect(() => {
    if (isSignedIn) {
      (async () => {
        const model = new Model();
        await model.populateAllThreads();
        setGraphData(model);
      })();
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      (async () => {
        setMe(await Providers.me());
      })();
    }
  }, [isSignedIn]);

  if (!isSignedIn) return <Login />;
  if (!graphData || !me) return <Spinner label="Fetching chat information from Microsoft Graph..." />;

  if (!me.id) {
    return <>{'Unable to get your user id from graph 🤷'}</>;
  }
  if (!me.displayName) {
    return <>{'Unable to get your displayName from graph 🤷'}</>;
  }

  if (!activeChatThread) {
    return <ChatThreadSelectionPage threads={graphData.getAllThreads()} joinChatThread={(threadId) => {setActiveChatThread(threadId)}} />;
  }

  if (activeChatThread) {
    return (
      <ChatPage
        model={graphData}
        threadId={activeChatThread}
        leaveChat={() => setActiveChatThread(undefined)}
        participantId={me.id}
        displayName={me.displayName}
      />
    );
  }

  return <>{'Invalid App Page.. Not sure how you got here.. file a github issue about this.'}</>;
}

function App() {
  return (
    <Stack verticalFill verticalAlign='center' horizontalAlign='center'>
      <AppBody />
    </Stack>
  );
}

export default App;
