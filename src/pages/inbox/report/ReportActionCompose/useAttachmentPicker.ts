import {useContext, useState} from 'react';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {cleanFileObject, cleanFileObjectName, getFilesFromClipboardEvent} from '@libs/fileDownload/FileUtils';
import Navigation from '@navigation/Navigation';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';
import {useComposerActions, useComposerMeta, useComposerSendState} from './ComposerContext';

function useAttachmentPicker(reportID: string) {
    const {translate} = useLocalize();
    const {exceededMaxLength} = useComposerSendState();
    const {clearComposer} = useComposerActions();
    const {attachmentFileRef, suggestionsRef} = useComposerMeta();
    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);

    const reportAttachmentsContext = useContext(AttachmentModalContext);

    const addAttachment = (file: FileObject | FileObject[]) => {
        attachmentFileRef.current = file;
        clearComposer();
    };

    const onAttachmentPreviewClose = () => {
        if (suggestionsRef.current) {
            suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
        }
        setIsAttachmentPreviewActive(false);
        ComposerFocusManager.setReadyToFocus();
    };

    const onFilesValidated = (files: FileObject[], dataTransferItems: DataTransferItem[]) => {
        if (files.length === 0) {
            return;
        }

        reportAttachmentsContext.setCurrentAttachment<typeof SCREENS.REPORT_ADD_ATTACHMENT>({
            reportID,
            file: files,
            dataTransferItems,
            headerTitle: translate('reportActionCompose.sendAttachment'),
            onConfirm: addAttachment,
            onShow: () => setIsAttachmentPreviewActive(true),
            onClose: onAttachmentPreviewClose,
            shouldDisableSendButton: !!exceededMaxLength,
        });
        Navigation.navigate(ROUTES.REPORT_ADD_ATTACHMENT.getRoute(reportID));
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation(onFilesValidated);

    const pickAttachments = ({dragEvent, files}: {dragEvent?: DragEvent; files?: FileObject | FileObject[]}) => {
        if (isAttachmentPreviewActive) {
            return;
        }

        let extractedFiles: FileObject[] = [];

        if (files) {
            extractedFiles = Array.isArray(files) ? files : [files];
        } else {
            if (!dragEvent) {
                return;
            }
            extractedFiles = getFilesFromClipboardEvent(dragEvent);
        }

        const dataTransferItems = Array.from(dragEvent?.dataTransfer?.items ?? []);
        if (extractedFiles.length === 0) {
            return;
        }

        const validIndices: number[] = [];
        const fileObjects = extractedFiles
            .map((item, index) => {
                const fileObject = cleanFileObject(item);
                const cleanedFileObject = cleanFileObjectName(fileObject);
                if (cleanedFileObject !== null) {
                    validIndices.push(index);
                }
                return cleanedFileObject;
            })
            .filter((fileObject) => fileObject !== null);

        if (!fileObjects.length) {
            return;
        }

        const filteredItems = dataTransferItems && validIndices.length > 0 ? validIndices.map((index) => dataTransferItems.at(index) ?? ({} as DataTransferItem)) : undefined;

        validateFiles(fileObjects, filteredItems, {isValidatingReceipts: false});
    };

    return {pickAttachments, PDFValidationComponent, ErrorModal};
}

export default useAttachmentPicker;
