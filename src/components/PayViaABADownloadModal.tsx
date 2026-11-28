/**
 * Waits for the ABA file to generate when reports are paid via ABA, then downloads it. There is also a Download button
 * so that the user can manually download the file in case the automatic download didn't work.
 */
import useLocalize from '@hooks/useLocalize';

import HttpsError from '@libs/Errors/HttpsError';
import Log from '@libs/Log';
import saveTextFile from '@libs/saveTextFile';

import type {PayViaABAResult} from '@userActions/IOU/PayMoneyRequest';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';

import type {ModalProps} from './Modal/Global/ModalContext';

import FileDownloadModalWrapper from './Modal/Global/FileDownloadModalWrapper';

const KNOWN_SKIPPED_REPORT_REASONS = new Set<string>(Object.values(CONST.ABA_SKIPPED_REPORT_REASON));

type PayViaABADownloadModalProps = ModalProps & {
    abaFileRequest: Promise<PayViaABAResult>;

    getDownloadFailedMessage: (error?: HttpsError) => string;
};

function PayViaABADownloadModal({abaFileRequest, getDownloadFailedMessage, closeModal, resolveModal}: PayViaABADownloadModalProps) {
    const {translate} = useLocalize();
    const [payViaABAResult, setPayViaABAResult] = useState<PayViaABAResult>();
    const abaFile = payViaABAResult?.abaFile;
    const [downloadFailedMessage, setDownloadFailedMessage] = useState<string>();

    useEffect(() => {
        abaFileRequest
            .then((result) => setPayViaABAResult(result))
            .catch((error: unknown) => setDownloadFailedMessage(getDownloadFailedMessage(error instanceof HttpsError ? error : undefined)));
    }, [abaFileRequest, getDownloadFailedMessage]);

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
        if (!abaFile) {
            return translate('iou.waitForABAFile');
        }
        const skippedReportIDs = payViaABAResult?.skippedReportIDs;
        const paragraphs = [translate('iou.successABAFile')];
        if (skippedReportIDs?.[CONST.ABA_SKIPPED_REPORT_REASON.MISSING_DEPOSIT_ACCOUNT]?.length) {
            paragraphs.push(translate('iou.submittersMissingABADepositAccount'));
        }
        if (skippedReportIDs?.[CONST.ABA_SKIPPED_REPORT_REASON.NOTHING_TO_PAY]?.length) {
            paragraphs.push(translate('iou.reportsWithNothingToPayViaABA'));
        }
        // Fall back to a generic message if there are skipped reports where we don't have the reason in App yet
        if (Object.keys(skippedReportIDs ?? {}).some((reason) => !KNOWN_SKIPPED_REPORT_REASONS.has(reason))) {
            paragraphs.push(translate('iou.reportsLeftOutOfABAFile'));
        }
        return paragraphs.join('\n\n');
    })();

    return (
        <FileDownloadModalWrapper
            closeModal={closeModal}
            resolveModal={resolveModal}
            title={translate('iou.payViaABA')}
            status={status}
            message={message}
            shouldTreatModalAsCovering
            shouldPreventDismissWhileGenerating
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
