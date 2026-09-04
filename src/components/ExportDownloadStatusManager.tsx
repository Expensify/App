import useOnyx from '@hooks/useOnyx';

import {clearExportDownload, wasExportInitiatedLocally} from '@libs/actions/Export';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

import ExportDownloadStatusModal from './ExportDownloadStatusModal';

/**
 * Renders the export status modal for the whole app. It watches the export collection and shows the modal
 * for the active export (preparing or ready). Because it is the single owner of the modal and reads straight
 * from Onyx, a screen only has to start an export (which writes its record); this shows the progress, delivers
 * the file when it is ready, and still surfaces it after a reload. There is no per-screen modal to coordinate with.
 */
function ExportDownloadStatusManager() {
    const [exportDownloads, exportDownloadsMetadata] = useOnyx(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD);
    const [openExportID, setOpenExportID] = useState<string | undefined>();

    // Record keys that already existed when this tab loaded. A reload re-reads the collection and re-seeds this,
    // which is how an in-flight export resurfaces after a reload. A record that appears later because another
    // tab started an export is not in here, so it does not pop the modal open in this tab until it reloads.
    const [recordKeysAtLoad, setRecordKeysAtLoad] = useState<Set<string> | undefined>(undefined);
    if (recordKeysAtLoad === undefined && exportDownloadsMetadata.status === 'loaded') {
        setRecordKeysAtLoad(new Set(Object.keys(exportDownloads ?? {})));
    }

    const surfaceableCandidate = Object.entries(exportDownloads ?? {}).find(([key, exportDownload]) => {
        if (!exportDownload) {
            return false;
        }

        // Concierge hand-off is owned by the BE worker: it delivers via the Concierge chat on success and posts
        // a failure notice there too. There is nothing useful to show in a modal, so we never surface these.
        if (exportDownload.shouldSendFromConcierge) {
            return false;
        }
        const isSurfaceableState = exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING || exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.READY;
        if (!isSurfaceableState) {
            return false;
        }

        // Only surface an export this tab owns: one it started itself, or one that already existed when it
        // loaded. An export started in another tab must not pop open here until this tab reloads.
        const exportID = key.replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');
        return !!recordKeysAtLoad?.has(key) || wasExportInitiatedLocally(exportID);
    });
    const [surfaceableKey] = surfaceableCandidate ?? [];
    const surfaceableExportID = surfaceableKey?.replace(ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD, '');

    // Adjust state to avoid a flash. openExportID keeps the modal open through the state changes
    // the selector above skips (like the flip to shouldSendFromConcierge), and close it only once
    // the record is gone.
    if (!openExportID && surfaceableExportID) {
        setOpenExportID(surfaceableExportID);
    }
    if (openExportID && !exportDownloads?.[`${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${openExportID}`]) {
        setOpenExportID(undefined);
    }

    if (!openExportID) {
        return null;
    }

    const openExportKey = `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${openExportID}`;
    const exportDownload = exportDownloads?.[openExportKey];
    if (!exportDownload) {
        return null;
    }

    const handleClose = () => {
        if (exportDownload.state === CONST.EXPORT_DOWNLOAD.STATE.PREPARING && !exportDownload.shouldSendFromConcierge) {
            return;
        }
        if (exportDownload.shouldSendFromConcierge) {
            setOpenExportID(undefined);
            return;
        }
        clearExportDownload(openExportID, exportDownload);
        setOpenExportID(undefined);
    };

    return (
        <ExportDownloadStatusModal
            key={openExportID}
            exportID={openExportID}
            isVisible
            onClose={handleClose}
        />
    );
}

ExportDownloadStatusManager.displayName = 'ExportDownloadStatusManager';

export default ExportDownloadStatusManager;
