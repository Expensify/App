import React from 'react';
import NewChatPage from './NewChatPage';

function NewGroupPage(props) {
    return (
        <NewChatPage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isGroupChat
        />
    );
}

NewGroupPage.displayName = 'NewGroupPage';

export default NewGroupPage;
