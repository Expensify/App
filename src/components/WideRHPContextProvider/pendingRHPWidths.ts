import CONST from '@src/CONST';

import type {RHPWidthHint} from './types';

/** Stamped, so a width nothing used expires. */
type PendingRHPWidth = {width: RHPWidthHint; markedAt: number};

/**
 * Widths left by presses for the screens they open, keyed by report; one press can leave two. Outside React state, so marking one
 * doesn't re-run every mounted `useRHPWidth`, any of which could take it.
 */
const pendingRHPWidths = new Map<string, PendingRHPWidth>();

function markPendingRHPWidth(reportID: string, width: RHPWidthHint) {
    const now = Date.now();
    for (const [pendingReportID, pending] of pendingRHPWidths) {
        if (now - pending.markedAt < CONST.PENDING_RHP_WIDTH_WINDOW) {
            continue;
        }
        pendingRHPWidths.delete(pendingReportID);
    }
    pendingRHPWidths.set(reportID, {width, markedAt: now});
}

/** Only the first screen to ask gets it, and only while it is fresh. */
function consumePendingRHPWidth(reportID: string): RHPWidthHint | undefined {
    const pending = pendingRHPWidths.get(reportID);
    if (!pending) {
        return undefined;
    }
    pendingRHPWidths.delete(reportID);
    return Date.now() - pending.markedAt < CONST.PENDING_RHP_WIDTH_WINDOW ? pending.width : undefined;
}

/** For a press that never opened what it left a width for, so a later visit isn't widened by it. */
function clearPendingRHPWidth(reportID: string) {
    pendingRHPWidths.delete(reportID);
}

export {markPendingRHPWidth, consumePendingRHPWidth, clearPendingRHPWidth};
