import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {downloadReportPDF} from '@libs/actions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import PDFDownloadModal from './PDFDownloadModal';

type ReportPDFDownloadModalProps = {
    reportID: string | undefined;
    isVisible: boolean;
    onClose: () => void;
    onModalHide?: () => void;
};

function ReportPDFDownloadModal({reportID, isVisible, onClose, onModalHide}: ReportPDFDownloadModalProps) {
    const [reportPDFFilename] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDF_FILENAME}${reportID}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserLogin = currentUserPersonalDetails?.login ?? '';
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';
    const reportName = report?.reportName ?? '';

    const hasFinishedPDFDownload = !!reportPDFFilename && reportPDFFilename !== CONST.REPORT_DETAILS_MENU_ITEM.ERROR;

    const message = (() => {
        if (reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR) {
            return translate('reportDetailsPage.errorPDF');
        }
        if (!hasFinishedPDFDownload) {
            return translate('reportDetailsPage.waitForPDF');
        }
        return translate('reportDetailsPage.successPDF');
    })();

    return (
        <PDFDownloadModal
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onModalHide}
            hasFinishedPDFDownload={hasFinishedPDFDownload}
            message={message}
            loadingReasonContext="MoneyReportHeader.PDFModal"
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
