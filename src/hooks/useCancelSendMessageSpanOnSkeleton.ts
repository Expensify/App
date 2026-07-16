import {cancelSpanByInstance} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import * as Sentry from '@sentry/react-native';
import {useEffect} from 'react';

/** Identifies which report-actions skeleton cancelled a send-message span (stamped as canceled_by_skeleton). */
type SkeletonName = ValueOf<typeof CONST.TELEMETRY.CANCELED_BY_SKELETON>;

/**
 * Call from a component that is mounted exactly while a report-actions skeleton is on screen. A message sent
 * while the skeleton shows can't render, so its send-message span would never end. This cancels any such span
 * for `reportID` (matched by `report_id`, since the span id uses a random report-action id) and tags it with
 * `skeletonName` so Sentry shows which skeleton caused it.
 */
function useCancelSendMessageSpanOnSkeleton(reportID: string | undefined, skeletonName: SkeletonName) {
    useEffect(() => {
        if (!reportID) {
            return;
        }
        const client = Sentry.getClient();
        if (!client) {
            return;
        }
        // `client.on` returns an unsubscribe function, used as the effect cleanup.
        return client.on('spanStart', (span) => {
            const {op, data} = Sentry.spanToJSON(span);
            if (op !== CONST.TELEMETRY.SPAN_SEND_MESSAGE || data[CONST.TELEMETRY.ATTRIBUTE_REPORT_ID] !== reportID) {
                return;
            }
            // Defer so activeSpans has registered the span (set right after the `startInactiveSpan` that emits this).
            queueMicrotask(() => cancelSpanByInstance(span, {[CONST.TELEMETRY.ATTRIBUTE_CANCELED_BY_SKELETON]: skeletonName}));
        });
    }, [reportID, skeletonName]);
}

export default useCancelSendMessageSpanOnSkeleton;
export type {SkeletonName};
