import React from 'react';
import ExceededCommentLength from '@components/ExceededCommentLength';
import {useComposerSendState} from './ComposerContext';

function ComposerExceededLength() {
    const {exceededMaxLength, hasExceededMaxTaskTitleLength} = useComposerSendState();
    if (!exceededMaxLength) {
        return null;
    }
    return (
        <ExceededCommentLength
            maxCommentLength={exceededMaxLength}
            isTaskTitle={hasExceededMaxTaskTitleLength}
        />
    );
}

export default ComposerExceededLength;
