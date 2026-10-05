import React, {createContext, useContext, useState} from 'react';

import ReportPDFDownloadModal from './ReportPDFDownloadModal';

type OpenReportPDFDownloadModal = (reportID: string) => void;

const ReportPDFDownloadModalContext = createContext<OpenReportPDFDownloadModal>(() => {
    // Default: no provider. Opening is a no-op.
});

function useOpenReportPDFDownloadModal(): OpenReportPDFDownloadModal {
    return useContext(ReportPDFDownloadModalContext);
}

/**
 * Renders the report PDF download modal outside the selection-gated bulk action bar, so the selection can be
 * cleared as soon as the download starts without unmounting the modal.
 */
function ReportPDFDownloadModalHost({children}: {children: React.ReactNode}) {
    const [reportID, setReportID] = useState<string | undefined>();
    const [isVisible, setIsVisible] = useState(false);

    const openReportPDFDownloadModal = (reportIDToDownload: string) => {
        setReportID(reportIDToDownload);
        setIsVisible(true);
    };

    return (
        <ReportPDFDownloadModalContext.Provider value={openReportPDFDownloadModal}>
            {children}
            {!!reportID && (
                <ReportPDFDownloadModal
                    reportID={reportID}
                    isVisible={isVisible}
                    onClose={() => setIsVisible(false)}
                    onModalHide={() => setReportID(undefined)}
                />
            )}
        </ReportPDFDownloadModalContext.Provider>
    );
}

export default ReportPDFDownloadModalHost;
export {useOpenReportPDFDownloadModal};
