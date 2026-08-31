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
    /** The children to render inside the provider */
    children: React.ReactNode;

    /** Extra cleanup to run once the status modal is dismissed. Defaults to clearing the current selection. */
    onCleanup?: () => void;
};

/**
 * Owns the queued export status modal for a surface that triggers tracked exports (the money report header,
 * the Search page). The state lives here, above the two mutually-exclusive layout branches those surfaces
 * render, so the modal survives orientation / layout changes that remount the branch it was triggered from.
 */
function ExportDownloadStatusProvider({children, onCleanup}: ExportDownloadStatusProviderProps) {
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {trackExport, exportDownloadStatusModal} = useExportDownloadStatusModal(() => (onCleanup ? onCleanup() : clearSelectedTransactions(true)));

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
