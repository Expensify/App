import React from 'react';
import ComposerActionButton from './ComposerActionButton';
import ComposerBox from './ComposerBox';
import ComposerDropZone from './ComposerDropZone';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerInput from './ComposerInput';
import ComposerSendButton from './ComposerSendButton';

function ComposerInputArea() {
    return (
        <ComposerDropZone>
            <ComposerBox>
                <ComposerActionButton />
                <ComposerInput />
                <ComposerEmojiPicker />
                <ComposerSendButton />
            </ComposerBox>
        </ComposerDropZone>
    );
}

export default ComposerInputArea;
