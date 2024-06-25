import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SendButtonProps} from './SendButton';
import SendButton from './SendButton';

type Props = SendButtonProps & {
    reportID: string;
};

function ConnectedSendButton({reportID, isDisabled: isDisabledProp, ...forwardedProps}: Props) {
    const [commentValue] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
    const isCommentEmpty = useMemo(() => commentValue?.match(/^(\s)*$/) !== null, [commentValue]);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <SendButton
            isDisabled={isDisabledProp || isCommentEmpty}
            {...forwardedProps}
        />
    );
}

ConnectedSendButton.displayName = 'ConnectedSendButton';

export default ConnectedSendButton;
