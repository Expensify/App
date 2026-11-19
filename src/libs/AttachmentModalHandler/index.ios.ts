import TransitionTracker from '@libs/Navigation/TransitionTracker';

import type AttachmentModalHandler from './types';

const attachmentModalHandler: AttachmentModalHandler = {
    handleModalClose: (onCloseCallback) => {
        // Wait for active transitions to avoid the visual glitch tracked in https://github.com/Expensify/App/issues/52937.
        // Do not wait for an upcoming transition: the close callback starts the navigation that would trigger it.
        TransitionTracker.runAfterTransitions({
            callback: () => {
                onCloseCallback?.();
            },
        });
    },
};

export default attachmentModalHandler;
