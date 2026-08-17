import useFilesValidation from '@hooks/useFilesValidation';

import {cleanFileObject, cleanFileObjectName, getFilesFromClipboardEvent} from '@libs/fileDownload/FileUtils';

import type {FileObject} from '@src/types/utils/Attachment';

import {useComposerActions, useComposerMeta, useComposerSendState} from './ComposerContext';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useAttachmentPicker(reportID: string) {
    const {clearComposer} = useComposerActions();
    const {attachmentFileRef} = useComposerMeta();
    const {exceededMaxLength} = useComposerSendState();

    const addAttachment = (file: FileObject | FileObject[]) => {
        attachmentFileRef.current = file;
        clearComposer();
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onFilesValidated = (files: FileObject[], dataTransferItems: DataTransferItem[]) => {
        if (files.length === 0 || exceededMaxLength) {
            return;
        }

        // With native platforms, we don't need to show the preview screen.
        addAttachment(files);
    };

    const {validateFiles, PDFValidationComponent} = useFilesValidation(onFilesValidated);

    const pickAttachments = ({dragEvent, files}: {dragEvent?: DragEvent; files?: FileObject | FileObject[]}) => {
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

        const filteredItems = validIndices.length > 0 ? validIndices.map((index) => dataTransferItems.at(index)).filter((item) => item !== undefined) : undefined;

        validateFiles(fileObjects, filteredItems, {isValidatingReceipts: false});
    };

    return {pickAttachments, PDFValidationComponent};
}

export default useAttachmentPicker;
