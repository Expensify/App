import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useStallLogger from '@hooks/useStallLogger';

import {downloadReportPDF} from '@libs/actions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import type {ModalProps} from './Modal/Global/ModalContext';

import FileDownloadModalWrapper from './Modal/Global/FileDownloadModalWrapper';

type ReportPDFDownloadModalProps = ModalProps & {
    reportID: string;
};

/**
 * Rendered by the global modal stack, so its Onyx subscriptions live as long as the modal does. The caller that opened
 * it can unmount while the PDF is generating and the modal still picks up the filename.
 */
function ReportPDFDownloadModal({reportID, closeModal, resolveModal}: ReportPDFDownloadModalProps) {
    const [reportPDFFilename] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${reportID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserLogin = currentUserPersonalDetails?.login ?? '';
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';
    const reportName = report?.reportName ?? '';
    const {isOffline} = useNetwork();

    const hasPDFDownloadFailed = reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR;
    const hasFinishedPDFDownload = !!reportPDFFilename && !hasPDFDownloadFailed;

    // reportPDFFilename only ever resolves via a backend-pushed Onyx update (no client timeout), so a filename
    // that never arrives and never errors leaves the spinner stuck with nothing else to log it. See Expensify#667674.
    // Excluded while offline: the request is legitimately queued and waiting for connectivity, not stuck.
    // Keyed by reportID (not just a boolean) so if this modal is ever reused for a different report without
    // unmounting, the timer restarts against the new report instead of firing late and blaming the wrong one.
    useStallLogger(!isOffline && !reportPDFFilename ? reportID : false, '[PDFStall] reportPDFFilename never resolved to a filename or error while the download modal was open', {
        reportID,
    });

    const message = (() => {
        if (hasPDFDownloadFailed) {
            return translate('reportDetailsPage.errorPDF');
        }
        if (!hasFinishedPDFDownload) {
            return translate('reportDetailsPage.waitForPDF');
        }
        return translate('reportDetailsPage.successPDF');
    })();

    // reportPDFFilename is null while the backend is still generating, so the wrapper reports a dismissal at that point
    // as a cancel (e.g. Submit via PDF retracts the submit). Once it holds a filename or 'error' the submit has resolved.
    const status = (() => {
        if (hasPDFDownloadFailed) {
            return CONST.FILE_DOWNLOAD_STATUS.FAILED;
        }
        return hasFinishedPDFDownload ? CONST.FILE_DOWNLOAD_STATUS.READY : CONST.FILE_DOWNLOAD_STATUS.GENERATING;
    })();

    return (
        <FileDownloadModalWrapper
            closeModal={closeModal}
            resolveModal={resolveModal}
            title={translate('reportDetailsPage.generatingPDF')}
            status={status}
            message={message}
            shouldTreatModalAsCovering
            // Submit via PDF retracts the report and stops the submit animation once this resolves. Doing that behind
            // the fading modal keeps the animation's exit from overlapping the Submit button on a clear screen.
            shouldResolveOnDismiss
            onDownload={() => {
                if (!hasFinishedPDFDownload) {
                    return;
                }
                downloadReportPDF(reportPDFFilename, reportName, translate, currentUserLogin, encryptedAuthToken);
            }}
        />
    );
}

export default ReportPDFDownloadModal;
export type {ReportPDFDownloadModalProps};
