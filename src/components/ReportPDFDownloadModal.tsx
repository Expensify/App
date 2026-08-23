import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useStallLogger from '@hooks/useStallLogger';

import {downloadReportPDF} from '@libs/actions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import PDFDownloadModal from './PDFDownloadModal';

type ReportPDFDownloadModalProps = {
    reportID: string | undefined;
    isVisible: boolean;
    onClose: () => void;
    onModalHide?: () => void;

    /** Called when the modal is dismissed while the PDF is still generating (e.g. Submit via PDF retracts the submit). */
    onCancel?: () => void;
};

function ReportPDFDownloadModal({reportID, isVisible, onClose, onModalHide, onCancel}: ReportPDFDownloadModalProps) {
    const [reportPDFFilename] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${reportID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserLogin = currentUserPersonalDetails?.login ?? '';
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';
    const reportName = report?.reportName ?? '';
    const {isOffline} = useNetwork();

    const hasFinishedPDFDownload = !!reportPDFFilename && reportPDFFilename !== CONST.REPORT_DETAILS_MENU_ITEM.ERROR;

    // reportPDFFilename only ever resolves via a backend-pushed Onyx update (no client timeout), so a filename
    // that never arrives and never errors leaves the spinner stuck with nothing else to log it. See Expensify#667674.
    // Excluded while offline: the request is legitimately queued and waiting for connectivity, not stuck.
    // Keyed by reportID (not just a boolean) so if this modal is ever reused for a different report without
    // unmounting, the timer restarts against the new report instead of firing late and blaming the wrong one.
    useStallLogger(isVisible && !isOffline && !reportPDFFilename ? reportID : false, '[PDFStall] reportPDFFilename never resolved to a filename or error while the download modal was open', {
        reportID,
    });

    const message = (() => {
        if (reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR) {
            return translate('reportDetailsPage.errorPDF');
        }
        if (!hasFinishedPDFDownload) {
            return translate('reportDetailsPage.waitForPDF');
        }
        return translate('reportDetailsPage.successPDF');
    })();

    // reportPDFFilename is null while the backend is still generating, so a dismissal at that point is a cancel
    // (e.g. Submit via PDF retracts the submit); once it holds a filename or 'error' the submit has already resolved.
    const handleClose = () => {
        if (!reportPDFFilename) {
            onCancel?.();
        }
        onClose();
    };

    return (
        <PDFDownloadModal
            isVisible={isVisible}
            shouldTreatModalAsCovering
            onClose={handleClose}
            onModalHide={onModalHide}
            hasFinishedPDFDownload={hasFinishedPDFDownload}
            message={message}
            onDownloadPDF={() => {
                if (!reportPDFFilename || reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR) {
                    return;
                }
                downloadReportPDF(reportPDFFilename, reportName, translate, currentUserLogin, encryptedAuthToken);
            }}
        />
    );
}

ReportPDFDownloadModal.displayName = 'ReportPDFDownloadModal';

export default ReportPDFDownloadModal;
