import {useSyncExternalStore} from 'react';

/**
 * In-memory registry of export IDs that currently have an in-session status modal open.
 *
 * The app-level ExportDownloadReloadHandler uses this to avoid showing a duplicate modal for an export a
 * screen-owned modal is already displaying, and to take over the moment that owner unmounts (e.g. the user
 * navigates away before, or right as, the export becomes ready). It is deliberately module-level and reset on
 * reload, and exposed through useSyncExternalStore so the handler re-renders when ownership ends even if the
 * Onyx export value has not changed.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let openExportModalIDs: ReadonlySet<string> = new Set();

function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot(): ReadonlySet<string> {
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

function useOpenExportModalIDs(): ReadonlySet<string> {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export {markExportModalOpen, markExportModalClosed, useOpenExportModalIDs};
