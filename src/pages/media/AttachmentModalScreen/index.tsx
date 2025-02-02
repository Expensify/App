import React from 'react';
import AttachmentModalScreenImpl from './AttachmentModal';
import type {AttachmentModalScreenProps} from './types';

function AttachmentModalScreen(props: AttachmentModalScreenProps) {
    return (
        <AttachmentModalScreenImpl
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

AttachmentModalScreen.displayName = 'AttachmentModalScreen';

export default AttachmentModalScreen;
