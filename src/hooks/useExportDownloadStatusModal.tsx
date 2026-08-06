import ExportDownloadStatusModal from '@components/ExportDownloadStatusModal';

import {clearExportDownload} from '@libs/actions/Export';
import {markExportModalClosed, markExportModalOpen} from '@libs/OpenExportModalsStore';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useRef, useState} from 'react';

import useOnyx from './useOnyx';

type UseExportDownloadStatusModalReturn = {
    /** Start tracking a queued export so the status modal renders for it */
    trackExport: (exportID: string) => void;

    /** The realtime export status modal for the in-progress export (or null when none is active). Render it directly in the consumer. */
    exportDownloadStatusModal: React.JSX.Element | null;
};

/**
 * Encapsulates the shared wiring for the queued export status modal (ExportDownloadStatusModal): it tracks the
 * active export, renders the modal, and handles close/cleanup (no-op while still preparing, unless handed off to
 * Concierge). Used by every surface that triggers a tracked template export so the modal wiring lives in one place.
 *
 * @param onCleanup - Optional extra cleanup to run once the modal is dismissed (e.g. clearing the selection).
 */
function useExportDownloadStatusModal(onCleanup?: () => void): UseExportDownloadStatusModalReturn {
    const [activeExportID, setActiveExportID] = useState<string | undefined>(undefined);
    const [activeExportDownload] = useOnyx(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${activeExportID}`);

    // After a dismiss we hold the export's ownership marker until its Onyx key actually settles, so the reload
    // handler never sees a still-present ready value with no owner (which would flash a duplicate modal and
    // re-download). The ref mirrors the state because the ownership cleanup below captures a stale render and
    // cannot read the latest state to tell a dismiss apart from a real unmount.
    const [clearingExportID, setClearingExportID] = useState<string | undefined>(undefined);
    const [clearingExportDownload, clearingExportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${clearingExportID}`);
    const clearingExportIDRef = useRef<string | undefined>(undefined);

    const handleExportModalClose = () => {
        // Keep the modal open while the export is still preparing (unless it was handed off to Concierge).
        if (activeExportDownload?.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING && !activeExportDownload?.shouldSendFromConcierge) {
            return;
        }
        // For the Concierge path the worker deletes the NVP after sending, so clearing it here would wipe
        // shouldSendFromConcierge before the worker reads it and the file would never reach Concierge.
        if (activeExportID && !activeExportDownload?.shouldSendFromConcierge) {
            clearExportDownload(activeExportID, activeExportDownload);
            // Hold ownership until the cleared key settles; the clearing effect below releases it.
            clearingExportIDRef.current = activeExportID;
            setClearingExportID(activeExportID);
        }
        setActiveExportID(undefined);
        onCleanup?.();
    };

    // Register ownership while this modal shows an export so the app-level reload handler skips it and doesn't
    // show a duplicate. On a real unmount (the user navigates away before, or right as, the export becomes ready)
    // the cleanup releases ownership so the reload handler takes over. For a dismiss-and-clear we skip the release
    // here and let the clearing effect below release it once the key settles.
    useEffect(() => {
        if (!activeExportID) {
            return;
        }
        markExportModalOpen(activeExportID);
        const ownedExportID = activeExportID;
        return () => {
            if (clearingExportIDRef.current === ownedExportID) {
                return;
            }
            markExportModalClosed(ownedExportID);
        };
    }, [activeExportID]);

    // Release a dismissed export's ownership once its Onyx key is confirmed gone (status loaded + no value).
    // Waiting for the delete to apply avoids a duplicate during the async clear, and releasing here still hands
    // off to the reload handler if the clear rolls back and restores the ready value. We leave clearingExportID
    // pointing at the (now absent) key; the next dismiss overwrites it, so there is nothing to reset.
    useEffect(() => {
        if (!clearingExportID || clearingExportMetadata.status !== 'loaded' || clearingExportDownload) {
            return;
        }
        markExportModalClosed(clearingExportID);
        clearingExportIDRef.current = undefined;
    }, [clearingExportID, clearingExportDownload, clearingExportMetadata.status]);

    const exportDownloadStatusModal = activeExportID ? (
        <ExportDownloadStatusModal
            exportID={activeExportID}
            isVisible
            onClose={handleExportModalClose}
        />
    ) : null;

    return {trackExport: setActiveExportID, exportDownloadStatusModal};
}

export default useExportDownloadStatusModal;
