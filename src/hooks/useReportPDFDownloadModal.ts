import {downloadReportPDF} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useState} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useFileDownloadModal from './useFileDownloadModal';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useStallLogger from './useStallLogger';

type ReportPDFDownloadModalOptions = {
    reportID: string;
};

const REPORT_PDF_DOWNLOAD_MODAL_ID = 'reportPDFDownloadModal';

const useReportPDFDownloadModal = () => {
    const [activeReportID, setActiveReportID] = useState<string>();

    const [reportPDFFilename] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${getNonEmptyStringOnyxID(activeReportID)}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(activeReportID)}`);
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
    // Keyed by reportID (not just a boolean) so if the modal is shown for a different report, the timer restarts
    // against the new report instead of firing late and blaming the wrong one.
    useStallLogger(
        !!activeReportID && !isOffline && !reportPDFFilename ? activeReportID : false,
        '[PDFStall] reportPDFFilename never resolved to a filename or error while the download modal was open',
        {
            reportID: activeReportID,
        },
    );

    const message = (() => {
        if (hasPDFDownloadFailed) {
            return translate('reportDetailsPage.errorPDF');
        }
        if (!hasFinishedPDFDownload) {
            return translate('reportDetailsPage.waitForPDF');
        }
        return translate('reportDetailsPage.successPDF');
    })();

    const status = (() => {
        if (hasPDFDownloadFailed) {
            return CONST.FILE_DOWNLOAD_STATUS.FAILED;
        }
        return hasFinishedPDFDownload ? CONST.FILE_DOWNLOAD_STATUS.READY : CONST.FILE_DOWNLOAD_STATUS.GENERATING;
    })();

    // reportPDFFilename is null while the backend is still generating, so the modal reports a dismissal at that point
    // as a cancel (e.g. Submit via PDF retracts the submit); once it holds a filename or 'error' the submit has resolved.
    const {showFileDownloadModal} = useFileDownloadModal({
        id: REPORT_PDF_DOWNLOAD_MODAL_ID,
        title: translate('reportDetailsPage.generatingPDF'),
        status,
        message,
        shouldTreatModalAsCovering: true,
        onDownload: () => {
            if (!hasFinishedPDFDownload) {
                return;
            }
            downloadReportPDF(reportPDFFilename, reportName, translate, currentUserLogin, encryptedAuthToken);
        },
    });

    /** Resolves once the modal has finished hiding, with `CLOSE` if it was dismissed while the PDF was still generating. */
    const showReportPDFDownloadModal = ({reportID}: ReportPDFDownloadModalOptions) => {
        setActiveReportID(reportID);
        return showFileDownloadModal().then((result) => {
            setActiveReportID(undefined);
            return result;
        });
    };

    return {showReportPDFDownloadModal};
};

export default useReportPDFDownloadModal;
