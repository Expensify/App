import {Str} from 'expensify-common';
import {useEffect, useState} from 'react';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import type ModalType from '@src/types/utils/ModalType';

function isPdfFile(source: string | number, fileObject: FileObject) {
    if (!source) {
        return false;
    }

    const isSourcePdf = typeof source === 'string' ? Str.isPDF(source) : false;
    const isFilePdf = fileObject?.name ? Str.isPDF(fileObject.name) : false;
    return isSourcePdf || isFilePdf;
}

function useReportAttachmentModalType(source?: string | number, file?: FileObject | FileObject[]) {
    const [modalType, setModalType] = useState<ModalType>(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
    useEffect(() => {
        if (!file && !source) {
            setModalType(CONST.MODAL.MODAL_TYPE.CENTERED);
            return;
        }

        let isPdf = false;

        if (Array.isArray(file)) {
            isPdf = file.some((f) => isPdfFile(source ?? f.uri ?? '', f));
        } else {
            isPdf = isPdfFile(source ?? file?.uri ?? '', file ?? {});
        }

        // If our attachment is a PDF, return the unswipeable Modal type.
        setModalType(isPdf ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.CENTERED);
    }, [file, source]);

    return modalType;
}

export default useReportAttachmentModalType;
