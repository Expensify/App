import useOnyx from '@hooks/useOnyx';

import {clearExportDownload} from '@libs/actions/Export';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

import ExportDownloadStatusModal from './ExportDownloadStatusModal';

/**
 * Renders the queued export status modal for the whole app. It watches the export collection and shows the modal
 * for the active export (preparing, ready, or failed). Because it is the single owner of the modal and reads
 * straight from Onyx, a screen only has to start an export (which writes its record); this shows the progress,
 * delivers the file when it is ready, and still surfaces it after a reload or once the screen that started it is
 * gone. There is no per-screen modal to coordinate with.
 */
function ExportDownloadStatusManager() {
    const [exportDownloads] = useOnyx(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD);

    // Locally dismissed exports, so closing the modal hides them even when the record must stay in Onyx (the
    // Concierge path, where the worker still needs to read it). A set, not a single ID, so several lingering
    // records (e.g. multiple Concierge hand-offs) all stay hidden instead of taking turns re-surfacing. Reset on
    // reload, so a genuinely leftover ready export still re-surfaces.
    const [dismissedExportIDs, setDismissedExportIDs] = useState<ReadonlySet<string>>(() => new Set<string>());

    const activeEntry = Object.entries(exportDownloads ?? {}).find(([key, exportDownload]) => {
        const id = key.replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');
        return (
            !dismissedExportIDs.has(id) &&
            (exportDownload?.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING ||
                exportDownload?.state === CONST.EXPORT_DOWNLOAD.STATE.READY ||
                exportDownload?.state === CONST.EXPORT_DOWNLOAD.STATE.FAILED)
        );
    });

    if (!activeEntry) {
        return null;
    }

    const exportID = activeEntry[0].replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');
    const exportDownload = activeEntry[1];

    const handleClose = () => {
        // The modal blocks dismissal while still preparing (unless handed to Concierge), so this is belt-and-suspenders.
        if (exportDownload?.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING && !exportDownload?.shouldSendFromConcierge) {
            return;
        }
        // Hide the modal locally. For the Concierge path the worker deletes the record after sending, so clearing
        // it here would wipe shouldSendFromConcierge before the worker reads it; dismissing locally closes the
        // modal (and lets "Go to Concierge" navigate) without touching the record.
        setDismissedExportIDs((prev) => {
            const next = new Set(prev);
            next.add(exportID);
            return next;
        });
        if (!exportDownload?.shouldSendFromConcierge) {
            clearExportDownload(exportID, exportDownload);
        }
    };

    return (
        <ExportDownloadStatusModal
            exportID={exportID}
            isVisible
            onClose={handleClose}
        />
    );
}

ExportDownloadStatusManager.displayName = 'ExportDownloadStatusManager';

export default ExportDownloadStatusManager;
