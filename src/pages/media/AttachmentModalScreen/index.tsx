import React from 'react';
import AttachmentModalWrapper from './AttachmentModalWrapper';
import type {AttachmentModalScreenProps} from './types';

function AttachmentModalScreen(props: AttachmentModalScreenProps) {
    return (
        <AttachmentModalWrapper
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

AttachmentModalScreen.displayName = 'AttachmentModalScreen';

export default AttachmentModalScreen;
