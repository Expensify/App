import React, {memo, useCallback, useContext} from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalContent/BaseContent';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import type {AttachmentModalWrapperProps} from './types';

function AttachmentModalWrapper({contentProps, navigation, attachmentId}: AttachmentModalWrapperProps) {
    const attachmentsContext = useContext(AttachmentModalContext);
    const testID = typeof contentProps.source === 'string' ? contentProps.source : contentProps.source?.toString() ?? '';

    const closeModal = useCallback(() => {
        if (attachmentId) {
            attachmentsContext.removeAttachment(attachmentId);
        }

        Navigation.goBack(contentProps.fallbackRoute);
    }, [attachmentId, attachmentsContext, contentProps.fallbackRoute]);

    return (
        <ScreenWrapper
            navigation={navigation}
            testID={`attachment-modal-${testID}`}
        >
            <AttachmentModalBaseContent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...contentProps}
                closeModal={closeModal}
            />
        </ScreenWrapper>
    );
}

AttachmentModalWrapper.displayName = 'AttachmentModalWrapper';

export default memo(AttachmentModalWrapper);
