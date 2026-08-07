import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * In-memory registry of export IDs that currently have an in-session status modal open.
 *
 * The app-level ExportDownloadReloadHandler uses this to avoid showing a duplicate modal for an export a
 * screen-owned modal is already displaying, and to take over the moment that owner unmounts (e.g. the user
 * navigates away before, or right as, the export becomes ready). It is deliberately module-level and reset on
 * reload, and exposed through subscribe/getSnapshot so the handler can read it with useSyncExternalStore and
 * re-render when ownership ends even if the Onyx export value has not changed.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let openExportModalIDs: ReadonlySet<string> = new Set();

function subscribeToOpenExportModals(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getOpenExportModalIDs(): ReadonlySet<string> {
    return openExportModalIDs;
}

function notifyListeners() {
    for (const listener of listeners) {
        listener();
    }
}

function markExportModalOpen(exportID: string) {
    if (openExportModalIDs.has(exportID)) {
        return;
    }
    // Replace the set (rather than mutating in place) so useSyncExternalStore sees a new snapshot and re-renders.
    const next = new Set(openExportModalIDs);
    next.add(exportID);
    openExportModalIDs = next;
    notifyListeners();
}

function markExportModalClosed(exportID: string) {
    if (!openExportModalIDs.has(exportID)) {
        return;
    }
    const next = new Set(openExportModalIDs);
    next.delete(exportID);
    openExportModalIDs = next;
    notifyListeners();
}

/**
 * Releases a dismissed export's ownership once its Onyx key is gone. This runs here, in the module-level store,
 * rather than in the screen hook that dismissed it, so it still completes if that hook unmounts mid-clear (for
 * example when clearing the selection unmounts the toolbar). Holding ownership until the delete lands avoids a
 * duplicate during the async clear; if the clear rolls back and the value returns, ownership is already released
 * so the reload handler re-surfaces the export.
 */
function releaseExportModalWhenCleared(exportID: string) {
    const connectionID = Onyx.connectWithoutView({
        key: `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`,
        callback: (exportDownload) => {
            // Still present (e.g. ready during the async clear window); keep ownership and wait.
            if (exportDownload) {
                return;
            }
            markExportModalClosed(exportID);
            Onyx.disconnect(connectionID);
        },
    });
}

export {markExportModalOpen, markExportModalClosed, subscribeToOpenExportModals, getOpenExportModalIDs, releaseExportModalWhenCleared};
