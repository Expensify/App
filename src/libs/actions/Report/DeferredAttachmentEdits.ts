import {getReportActionHtml} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type DeferredAttachmentEdits from '@src/types/onyx/DeferredAttachmentEdits';
import type {DeferredAttachmentEdit} from '@src/types/onyx/DeferredAttachmentEdits';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {Connection, OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Returns whether the edit was replayed. A `false` keeps the watcher armed for the next update. */
type ReplayDeferredAttachmentEdit = (deferredEdit: DeferredAttachmentEdit, syncedAction: ReportAction) => boolean;

const deferredAttachmentEditWatchers = new Map<string, () => void>();
let deferredAttachmentEdits: OnyxEntry<DeferredAttachmentEdits>;
let replayDeferredAttachmentEdit: ReplayDeferredAttachmentEdit | undefined;

function deferAttachmentEdit(reportActionID: string, deferredEdit: DeferredAttachmentEdit) {
    deferredAttachmentEdits = {...deferredAttachmentEdits, [reportActionID]: deferredEdit};
    Onyx.merge(ONYXKEYS.DEFERRED_ATTACHMENT_EDITS, {[reportActionID]: deferredEdit});
}

function clearDeferredAttachmentEdit(reportActionID: string) {
    deferredAttachmentEditWatchers.get(reportActionID)?.();
    if (!deferredAttachmentEdits?.[reportActionID]) {
        return;
    }
    const remainingEdits = {...deferredAttachmentEdits};
    delete remainingEdits[reportActionID];
    deferredAttachmentEdits = remainingEdits;
    Onyx.merge(ONYXKEYS.DEFERRED_ATTACHMENT_EDITS, {[reportActionID]: null});
}

function watchDeferredAttachmentEdit(reportActionID: string, deferredEdit: DeferredAttachmentEdit) {
    const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${deferredEdit.reportID}` as const;
    const connections: Connection[] = [];
    let hasStopped = false;
    let syncedAction: ReportAction | undefined;

    const stop = () => {
        hasStopped = true;
        deferredAttachmentEditWatchers.delete(reportActionID);
        for (const connection of connections.splice(0)) {
            Onyx.disconnect(connection);
        }
    };
    // A subscriber can fire while it is still being connected, so a connection made after the watcher stopped is
    // disconnected rather than stored.
    const track = (connection: Connection) => {
        if (hasStopped) {
            Onyx.disconnect(connection);
            return;
        }
        connections.push(connection);
    };
    deferredAttachmentEditWatchers.set(reportActionID, stop);

    const replayWhenReady = () => {
        if (hasStopped || !syncedAction || !replayDeferredAttachmentEdit?.(deferredEdit, syncedAction)) {
            return;
        }
        stop();
        Onyx.merge(ONYXKEYS.DEFERRED_ATTACHMENT_EDITS, {[reportActionID]: null});
    };

    // We use connectWithoutView because this waits on a background sync and renders nothing itself.
    track(
        Onyx.connectWithoutView({
            key: reportActionsKey,
            callback: (reportActions) => {
                if (hasStopped) {
                    return;
                }
                const action = reportActions?.[reportActionID];
                if (!action) {
                    return;
                }
                if (!isEmptyObject(action.errors ?? {})) {
                    stop();
                    Onyx.merge(ONYXKEYS.DEFERRED_ATTACHMENT_EDITS, {[reportActionID]: null});
                    Onyx.merge(reportActionsKey, {[reportActionID]: {pendingAction: null, ...(deferredEdit.originalMessage ? {message: [deferredEdit.originalMessage]} : {})}});
                    return;
                }
                if (getReportActionHtml(action)?.includes(CONST.ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE)) {
                    return;
                }
                syncedAction = action;
                replayWhenReady();
            },
        }),
    );

    // The replay also needs the report, and on a cold start it can arrive after the action. Nothing else would wake
    // the watcher then, so the edit would sit deferred until the app restarted.
    track(
        Onyx.connectWithoutView({
            key: `${ONYXKEYS.COLLECTION.REPORT}${deferredEdit.reportID}` as const,
            // The replay reads the report through another subscriber's cache, so the retry waits for this update to
            // finish reaching every subscriber.
            callback: () => {
                Promise.resolve().then(replayWhenReady);
            },
        }),
    );
}

function startDeferredAttachmentEditReplays(replay: ReplayDeferredAttachmentEdit) {
    replayDeferredAttachmentEdit = replay;

    // We use connectWithoutView because the deferred edits are persisted so they survive a restart, and the watchers
    // that replay them are background work with nothing to render.
    Onyx.connectWithoutView({
        key: ONYXKEYS.DEFERRED_ATTACHMENT_EDITS,
        callback: (deferredEdits) => {
            deferredAttachmentEdits = deferredEdits;
            for (const [reportActionID, stop] of deferredAttachmentEditWatchers) {
                if (!deferredEdits?.[reportActionID]) {
                    stop();
                }
            }
            for (const [reportActionID, deferredEdit] of Object.entries(deferredEdits ?? {})) {
                if (!deferredEdit || deferredAttachmentEditWatchers.has(reportActionID)) {
                    continue;
                }
                watchDeferredAttachmentEdit(reportActionID, deferredEdit);
            }
        },
    });
}

export {clearDeferredAttachmentEdit, deferAttachmentEdit, startDeferredAttachmentEditReplays};
