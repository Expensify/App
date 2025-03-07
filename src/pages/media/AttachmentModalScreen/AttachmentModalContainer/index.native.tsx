import React, {memo, useCallback, useContext} from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import type AttachmentModalContainerProps from './types';

function AttachmentModalContainer({contentProps, navigation}: AttachmentModalContainerProps) {
    const attachmentsContext = useContext(AttachmentModalContext);
    const testID = typeof contentProps.source === 'string' ? contentProps.source : contentProps.source?.toString() ?? '';

    const closeModal = useCallback(() => {
        attachmentsContext.setCurrentAttachment(undefined);
        Navigation.goBack(contentProps.fallbackRoute);
    }, [attachmentsContext, contentProps.fallbackRoute]);

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

AttachmentModalContainer.displayName = 'AttachmentModalContainer';

export default memo(AttachmentModalContainer);
