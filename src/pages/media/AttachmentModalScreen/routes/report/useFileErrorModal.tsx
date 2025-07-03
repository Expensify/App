import {useMemo} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import type {MultipleAttachmentsValidationError, SingleAttachmentValidationError} from '@libs/AttachmentValidation';
import {getFileValidationErrorText} from '@libs/fileDownload/FileUtils';

type UseFileErrorModalProps = {
    fileError: SingleAttachmentValidationError | MultipleAttachmentsValidationError | undefined;
    isFileErrorModalVisible: boolean;
    isMultipleFiles: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
};

function useFileErrorModal({fileError, isFileErrorModalVisible, onConfirm, onCancel, isMultipleFiles}: UseFileErrorModalProps) {
    const {translate} = useLocalize();

    return useMemo(
        () => (
            <ConfirmModal
                title={getFileValidationErrorText(fileError).title}
                onConfirm={() => onConfirm?.()}
                onCancel={onCancel}
                isVisible={isFileErrorModalVisible}
                prompt={getFileValidationErrorText(fileError).reason}
                confirmText={translate(isMultipleFiles ? 'common.continue' : 'common.close')}
                shouldShowCancelButton={isMultipleFiles}
                cancelText={translate('common.cancel')}
            />
        ),
        [fileError, isFileErrorModalVisible, isMultipleFiles, onCancel, onConfirm, translate],
    );
}

export default useFileErrorModal;
