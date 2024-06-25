import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SendButtonProps} from './SendButton';
import SendButton from './SendButton';

type Props = SendButtonProps & {
    reportID: string;
};

function ConnectedSendButton({reportID, isDisabled: isDisabledProp, handleSendMessage}: Props) {
    const [commentValue] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
    const isCommentEmpty = useMemo(() => commentValue?.match(/^(\s)*$/) !== null, [commentValue]);

    return (
        <SendButton
            isDisabled={isDisabledProp || isCommentEmpty}
            handleSendMessage={handleSendMessage}
        />
    );
}

ConnectedSendButton.displayName = 'ConnectedSendButton';

export default ConnectedSendButton;
