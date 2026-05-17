import React from 'react';
import ComposerActionMenu from './ComposerActionMenu';
import ComposerBox from './ComposerBox';
import {useComposerEditState} from './ComposerContext';
import ComposerDropZone from './ComposerDropZone';
import ComposerEditingButtons from './ComposerEditingButtons';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerInput from './ComposerInput';
import ComposerSendButton from './ComposerSendButton';
import type {ReportActionComposeProps} from './ReportActionComposeTypes';

function ReportActionComposeInputArea({reportID}: ReportActionComposeProps) {
    const {isEditingInComposer} = useComposerEditState();

    return (
        <ComposerDropZone reportID={reportID}>
            <ComposerBox reportID={reportID}>
                {isEditingInComposer ? <ComposerEditingButtons reportID={reportID} /> : <ComposerActionMenu reportID={reportID} />}
                <ComposerInput reportID={reportID} />
                <ComposerEmojiPicker reportID={reportID} />
                <ComposerSendButton reportID={reportID} />
            </ComposerBox>
        </ComposerDropZone>
    );
}

export default ReportActionComposeInputArea;
