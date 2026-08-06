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

    // Export IDs this hook dismissed-and-cleared, so the ownership cleanup below skips handing them off.
    const dismissedExportIDRef = useRef<string | undefined>(undefined);

    const handleExportModalClose = () => {
        // Keep the modal open while the export is still preparing (unless it was handed off to Concierge).
        if (activeExportDownload?.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING && !activeExportDownload?.shouldSendFromConcierge) {
            return;
        }
        // For the Concierge path the worker deletes the NVP after sending, so clearing it here would wipe
        // shouldSendFromConcierge before the worker reads it and the file would never reach Concierge.
        if (activeExportID && !activeExportDownload?.shouldSendFromConcierge) {
            clearExportDownload(activeExportID, activeExportDownload);
            // Remember this dismissal so the ownership cleanup below does not hand off to the reload handler.
            // The export is being cleared, and releasing ownership before the Onyx delete propagates would let
            // the handler momentarily see the still-present ready value with no owner and pop a duplicate modal.
            dismissedExportIDRef.current = activeExportID;
        }
        setActiveExportID(undefined);
        onCleanup?.();
    };

    // While this modal owns an export, register it so the app-level reload handler skips it and doesn't show a
    // duplicate. On a real unmount (the user navigates away before, or right as, the export becomes ready) the
    // cleanup releases ownership so the reload handler takes over. On an explicit dismiss we skip that release,
    // since the export is being cleared from Onyx; the leftover marker is harmless because export IDs are unique
    // and the key is gone.
    useEffect(() => {
        if (!activeExportID) {
            return;
        }
        markExportModalOpen(activeExportID);
        const ownedExportID = activeExportID;
        return () => {
            if (dismissedExportIDRef.current === ownedExportID) {
                dismissedExportIDRef.current = undefined;
                return;
            }
            markExportModalClosed(ownedExportID);
        };
    }, [activeExportID]);

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
