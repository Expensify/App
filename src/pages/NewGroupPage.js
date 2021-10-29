import React from 'react';
import NewChatPage from './NewChatPage';

// eslint-disable-next-line react/jsx-props-no-spreading
const NewGroupPage = props => <NewChatPage {...props} isGroupChat />;

NewGroupPage.displayName = 'NewGroupPage';

export default NewGroupPage;
