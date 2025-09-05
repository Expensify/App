import {Str} from 'expensify-common';
import {useEffect, useState} from 'react';
import {translateLocal} from '@libs/Localize';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import type ModalType from '@src/types/utils/ModalType';

function isPdfFile(sourceURL: string, fileObject: FileObject) {
    return !!sourceURL && (Str.isPDF(sourceURL) || (fileObject && Str.isPDF(fileObject.name ?? translateLocal('attachmentView.unknownFilename'))));
}

function useReportAttachmentModalType(file?: FileObject | FileObject[]) {
    const [modalType, setModalType] = useState<ModalType>(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
    useEffect(() => {
        if (!file) {
            setModalType(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
            return;
        }

        let isPdf = false;

        if (Array.isArray(file)) {
            isPdf = file.some((f) => isPdfFile(f.uri ?? '', f));
        } else {
            isPdf = isPdfFile(file?.uri ?? '', file ?? {});
        }

        // If our attachment is a PDF, return the unswipeable Modal type.
        setModalType(isPdf ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.CENTERED);
    }, [file]);

    return modalType;
}

export default useReportAttachmentModalType;
