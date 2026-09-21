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
    Onyx.merge(ONYXKEYS.DEFERRED_ATTACHMENT_EDITS, {[reportActionID]: deferredEdit});
}

function clearDeferredAttachmentEdit(reportActionID: string) {
    deferredAttachmentEditWatchers.get(reportActionID)?.();
    if (!deferredAttachmentEdits?.[reportActionID]) {
        return;
    }
    Onyx.merge(ONYXKEYS.DEFERRED_ATTACHMENT_EDITS, {[reportActionID]: null});
}

function watchDeferredAttachmentEdit(reportActionID: string, deferredEdit: DeferredAttachmentEdit) {
    const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${deferredEdit.reportID}` as const;
    let connection: Connection | undefined;
    let hasStopped = false;
    const stop = () => {
        hasStopped = true;
        deferredAttachmentEditWatchers.delete(reportActionID);
        if (connection !== undefined) {
            Onyx.disconnect(connection);
        }
    };
    deferredAttachmentEditWatchers.set(reportActionID, stop);

    // We use connectWithoutView because this waits on a background sync and renders nothing itself.
    connection = Onyx.connectWithoutView({
        key: reportActionsKey,
        callback: (reportActions) => {
            if (hasStopped) {
                return;
            }
            const syncedAction = reportActions?.[reportActionID];
            if (!syncedAction) {
                return;
            }
            if (!isEmptyObject(syncedAction.errors ?? {})) {
                stop();
                Onyx.merge(ONYXKEYS.DEFERRED_ATTACHMENT_EDITS, {[reportActionID]: null});
                Onyx.merge(reportActionsKey, {[reportActionID]: {pendingAction: null, ...(deferredEdit.originalMessage ? {message: [deferredEdit.originalMessage]} : {})}});
                return;
            }
            if (getReportActionHtml(syncedAction)?.includes(CONST.ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE)) {
                return;
            }
            if (!replayDeferredAttachmentEdit?.(deferredEdit, syncedAction)) {
                return;
            }
            stop();
            Onyx.merge(ONYXKEYS.DEFERRED_ATTACHMENT_EDITS, {[reportActionID]: null});
        },
    });
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
