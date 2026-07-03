import {useSearchSelectionActions} from '@components/Search/SearchContext';

import useExportDownloadStatusModal from '@hooks/useExportDownloadStatusModal';

import React, {createContext, useContext} from 'react';

type ExportDownloadStatusContextValue = {
    /** Start tracking a queued export so the shared status modal renders for it */
    trackExport: (exportID: string) => void;
};

const ExportDownloadStatusContext = createContext<ExportDownloadStatusContextValue>({
    trackExport: () => {},
});

type ExportDownloadStatusProviderProps = {
    children: React.ReactNode;
};

/**
 * Owns the queued export status modal for the money report header. The state lives here, above the
 * two mutually-exclusive layout branches in MoneyReportHeader, so the modal survives orientation /
 * layout changes that remount the header actions subtree.
 */
function ExportDownloadStatusProvider({children}: ExportDownloadStatusProviderProps) {
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {trackExport, exportDownloadStatusModal} = useExportDownloadStatusModal(() => clearSelectedTransactions(undefined, true));

    return (
        <ExportDownloadStatusContext.Provider value={{trackExport}}>
            {exportDownloadStatusModal}
            {children}
        </ExportDownloadStatusContext.Provider>
    );
}

function useExportDownloadStatus(): ExportDownloadStatusContextValue {
    return useContext(ExportDownloadStatusContext);
}

export {ExportDownloadStatusProvider, useExportDownloadStatus};
