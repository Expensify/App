import React, {memo} from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import AttachmentModalContent from '@pages/media/AttachmentModal/AttachmentModalContent';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModal/types';
import useAttachmentModalLogic from '@pages/media/AttachmentModal/useAttachmentModalLogic';

function AttachmentModalScreen({route, navigation}: AttachmentModalScreenProps) {
    const {
        contentProps,
        shouldLoadAttachment,
        isModalOpen,
        setIsModalOpen,
        attachmentInvalidReasonTitle,
        attachmentInvalidReason,
        submitRef,

        closeConfirmModal,
    } = useAttachmentModalLogic(route);

    return (
        <ScreenWrapper
            navigation={navigation}
            testID={`attachment-modal-${route.params.source}`}
        >
            <AttachmentModalContent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...contentProps}
                shouldLoadAttachment={shouldLoadAttachment}
                isOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                attachmentInvalidReasonTitle={attachmentInvalidReasonTitle}
                attachmentInvalidReason={attachmentInvalidReason}
                submitRef={submitRef}
                closeConfirmModal={closeConfirmModal}
                // onSubmitAndClose={onSubmitAndClose}
                // onPdfLoadError={onPdfLoadError}
                // onInvalidReasonModalHide={onInvalidReasonModalHide}
                // onUploadFileValidated={onUploadFileValidated}
            />
        </ScreenWrapper>
    );
}

AttachmentModalScreen.displayName = 'AttachmentModalScreen';

export default memo(AttachmentModalScreen);
