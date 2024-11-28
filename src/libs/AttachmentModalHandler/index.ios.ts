import {InteractionManager} from 'react-native';
import type AttachmentModalHandler from './types';

const attachmentModalHandler: AttachmentModalHandler = {
    handleModalClose: (onCloseCallback) => {
        InteractionManager.runAfterInteractions(() => {
            onCloseCallback?.();
        });
    },
};

export default attachmentModalHandler;
