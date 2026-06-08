import React from 'react';
import ExceededCommentLength from '@components/ExceededCommentLength';
import {useComposerSendState} from './ComposerContext';

function ComposerExceededLength() {
    const {exceededMaxLength, isTaskTitle} = useComposerSendState();
    if (!exceededMaxLength) {
        return null;
    }
    return (
        <ExceededCommentLength
            maxCommentLength={exceededMaxLength}
            isTaskTitle={isTaskTitle}
        />
    );
}

export default ComposerExceededLength;
