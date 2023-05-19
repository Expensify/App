import React from 'react';
import NewChatPage from './NewChatPage';

const NewGroupPage = (props) => (
    <NewChatPage
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        isGroupChat
    />
);

NewGroupPage.displayName = 'NewGroupPage';

export default NewGroupPage;
