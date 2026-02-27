import type AttachmentModalHandler from './types';

const attachmentModalHandler: AttachmentModalHandler = {
    handleModalClose: (onCloseCallback) => {
        onCloseCallback?.();
    },
};

export default attachmentModalHandler;
