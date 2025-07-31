import {Str} from 'expensify-common';
import {useEffect, useState} from 'react';
import {translateLocal} from '@libs/Localize';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import type ModalType from '@src/types/utils/ModalType';

function useReportAttachmentModalType(file: FileObject | FileObject[] | undefined) {
    const [modalType, setModalType] = useState<ModalType>(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
    useEffect(() => {
        if (!file) {
            return;
        }

        if (Array.isArray(file)) {
            const firstFile = file.at(0);
            setModalType(getModalType(firstFile?.uri ?? '', firstFile ?? {}));
            return;
        }

        setModalType(getModalType(file?.uri ?? '', file ?? {}));
    }, [file]);

    return modalType;
}

/**
 * If our attachment is a PDF, return the unswipeable Modal type.
 */
function getModalType(sourceURL: string, fileObject: FileObject): ModalType {
    return sourceURL && (Str.isPDF(sourceURL) || (fileObject && Str.isPDF(fileObject.name ?? translateLocal('attachmentView.unknownFilename'))))
        ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
        : CONST.MODAL.MODAL_TYPE.CENTERED;
}

export default useReportAttachmentModalType;
