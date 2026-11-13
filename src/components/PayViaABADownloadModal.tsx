import useLocalize from '@hooks/useLocalize';

import HttpsError from '@libs/Errors/HttpsError';
import Log from '@libs/Log';
import saveTextFile from '@libs/saveTextFile';

import type {ABAFile} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';

import type {ModalProps} from './Modal/Global/ModalContext';

import FileDownloadModalWrapper from './Modal/Global/FileDownloadModalWrapper';

type PayViaABADownloadModalProps = ModalProps & {
    /** Resolves with nothing when the reports can't be paid, which closes the modal */
    abaFileRequest: Promise<ABAFile | undefined>;

    getDownloadFailedMessage: (error?: HttpsError) => string;
};

/**
 * Waits for the ABA file to generate when reports are paid via ABA, then downloads it. There is also a Download button
 * so that the user can manually download the file in case the automatic download didn't work.
 */
function PayViaABADownloadModal({abaFileRequest, getDownloadFailedMessage, closeModal, resolveModal}: PayViaABADownloadModalProps) {
    const {translate} = useLocalize();
    const [abaFile, setABAFile] = useState<ABAFile>();
    const [downloadFailedMessage, setDownloadFailedMessage] = useState<string>();

    useEffect(() => {
        let isUnmounted = false;
        abaFileRequest
            .then((file) => {
                if (isUnmounted) {
                    return;
                }
                if (!file) {
                    closeModal();
                    return;
                }
                setABAFile(file);
            })
            .catch((error: unknown) => {
                if (isUnmounted) {
                    return;
                }
                setDownloadFailedMessage(getDownloadFailedMessage(error instanceof HttpsError ? error : undefined));
            });
        return () => {
            isUnmounted = true;
        };
    }, [abaFileRequest, getDownloadFailedMessage, closeModal]);

    const status = (() => {
        if (downloadFailedMessage) {
            return CONST.FILE_DOWNLOAD_STATUS.FAILED;
        }
        return abaFile ? CONST.FILE_DOWNLOAD_STATUS.READY : CONST.FILE_DOWNLOAD_STATUS.GENERATING;
    })();

    const message = (() => {
        if (downloadFailedMessage) {
            return downloadFailedMessage;
        }
        return abaFile ? translate('iou.successABAFile') : translate('iou.waitForABAFile');
    })();

    return (
        <FileDownloadModalWrapper
            closeModal={closeModal}
            resolveModal={resolveModal}
            title={translate('iou.payViaABA')}
            status={status}
            message={message}
            shouldTreatModalAsCovering
            onDownload={() => {
                if (!abaFile) {
                    return;
                }

                // Re-requesting the file again would pay the reports again, so this saves the copy from the first request
                saveTextFile(abaFile).catch(() => Log.warn('[PayViaABADownloadModal] Failed to save the ABA file'));
            }}
        />
    );
}

export default PayViaABADownloadModal;
export type {PayViaABADownloadModalProps};
