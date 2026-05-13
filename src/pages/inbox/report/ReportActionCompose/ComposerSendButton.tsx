import React from 'react';
import {useComposerSendActions, useComposerSendState} from './ComposerContext';
import SendButton from './SendButton';

function ComposerSendButton() {
    const {isSendDisabled} = useComposerSendState();
    const {handleSendMessage} = useComposerSendActions();

    return (
        <SendButton
            isDisabled={isSendDisabled}
            handleSendMessage={handleSendMessage}
        />
    );
}

export default ComposerSendButton;
