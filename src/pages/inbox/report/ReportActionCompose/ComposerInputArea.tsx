import React from 'react';
import ComposerActionButton from './ComposerActionButton';
import ComposerBox from './ComposerBox';
import ComposerDropZone from './ComposerDropZone';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerInput from './ComposerInput';
import ComposerSendButton from './ComposerSendButton';
import type {ReportActionComposeProps} from './types';

function ComposerInputArea({reportID}: ReportActionComposeProps) {
    return (
        <ComposerDropZone reportID={reportID}>
            <ComposerBox reportID={reportID}>
                <ComposerActionButton reportID={reportID} />
                <ComposerInput reportID={reportID} />
                <ComposerEmojiPicker reportID={reportID} />
                <ComposerSendButton reportID={reportID} />
            </ComposerBox>
        </ComposerDropZone>
    );
}

export default ComposerInputArea;
