import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';

import {cleanFileObject, cleanFileObjectName} from '@libs/fileDownload/FileUtils';

import Navigation from '@navigation/Navigation';

import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';

import {useContext} from 'react';

/**
 * Lets the Concierge prompt box pick file(s) and open the shared attachment preview modal.
 * On confirm the modal invokes `onConfirm`, which is where the caller actually sends the attachment to Concierge.
 */
function useConciergeAttachmentPicker(reportID: string | undefined, onConfirm: (files: FileObject | FileObject[]) => void) {
    const {translate} = useLocalize();
    const reportAttachmentsContext = useContext(AttachmentModalContext);

    const onFilesValidated = (files: FileObject[]) => {
        if (files.length === 0 || !reportID) {
            return;
        }

        reportAttachmentsContext.setCurrentAttachment<typeof SCREENS.REPORT_ADD_ATTACHMENT>({
            reportID,
            file: files,
            headerTitle: translate('reportActionCompose.sendAttachment'),
            onConfirm,
            // Confirming sends to Concierge and leaves Home, so the modal sequences its close with that transition.
            confirmLeavesScreen: true,
        });
        Navigation.navigate(ROUTES.REPORT_ADD_ATTACHMENT.getRoute(reportID));
    };

    const {validateFiles, PDFValidationComponent} = useFilesValidation(onFilesValidated);

    const pickAttachments = (files: FileObject[]) => {
        const fileObjects = files.map((item) => cleanFileObjectName(cleanFileObject(item)));
        if (!fileObjects.length) {
            return;
        }
        validateFiles(fileObjects, undefined, {isValidatingReceipts: false});
    };

    return {pickAttachments, PDFValidationComponent};
}

export default useConciergeAttachmentPicker;
