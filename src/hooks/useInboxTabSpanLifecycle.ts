import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import {cancelSpan, endSpan, getSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';

/**
 * Manages the ManualNavigateToInboxTab span lifecycle for the inbox sidebar.
 *
 * Three signals are handled:
 * - onLayout fires on first mount: ends the span (normal path).
 * - useFocusEffect fires on re-focus when react-freeze has cached the layout: ends the span (warm path).
 *   The blur cleanup cancels any orphaned span when the user navigates away before layout completes.
 * - useEffect unmount cleanup cancels the span only if layout never completed AND the active span
 *   is the same one that was present when this instance mounted (avoids canceling a span started
 *   by a subsequent tab click).
 *
 * Returns `onLayout` to be attached to the sidebar container View.
 */
function useInboxTabSpanLifecycle(): () => void {
    const hasHadFirstLayout = useRef(false);
    const spanOnMount = useRef(getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB));

    const onLayout = useCallback(() => {
        hasHadFirstLayout.current = true;
        endSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
        spanOnMount.current = undefined;
    }, []);

    // Focus: ends span on re-visits (react-freeze cached layout, onLayout won't fire again).
    // Blur cleanup: cancels orphaned span when user navigates away before onLayout fires.
    useFocusEffect(
        useCallback(() => {
            if (hasHadFirstLayout.current) {
                endSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
            }
            return () => cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
        }, []),
    );

    // Unmount: cancel only if layout never completed AND the active span is
    // the same one that existed when this instance mounted (avoids canceling
    // a newer span started by a subsequent tab click).
    useEffect(
        () => () => {
            if (hasHadFirstLayout.current) {
                return;
            }
            const activeSpan = getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
            if (activeSpan !== spanOnMount.current) {
                return;
            }
            cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
        },
        [],
    );

    return onLayout;
}

export default useInboxTabSpanLifecycle;
