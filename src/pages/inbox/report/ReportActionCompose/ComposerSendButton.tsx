import React from 'react';
import {useComposerActions, useComposerSendState} from './ComposerContext';
import SendButton from './SendButton';

function ComposerSendButton() {
    const {isSendDisabled} = useComposerSendState();
    const {handleSendMessage} = useComposerActions();

    return (
        <SendButton
            isDisabled={isSendDisabled}
            handleSendMessage={handleSendMessage}
        />
    );
}

export default ComposerSendButton;
