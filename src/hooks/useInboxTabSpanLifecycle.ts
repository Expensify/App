import {cancelSpan, endSpanWithAttributes, getSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import {useFocusEffect} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

/**
 * Manages the ManualNavigateToInboxTab span lifecycle for the inbox sidebar.
 *
 * Three signals are handled:
 * - onLayout ends the span, reporting cold on the first layout and warm on any later one. It fires again on
 *   web when the tab is re-visited, so it cannot assume it is running on a fresh mount.
 * - useFocusEffect ends the span as warm on re-focus, which is the only signal available on native because
 *   react-freeze keeps the cached layout and onLayout does not fire again there.
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

    // Both end paths derive `is_warm` from this ref rather than hardcoding a value, so the reported result does
    // not depend on which of them happens to fire first. That ordering is platform specific: on web the blurred
    // tab pane is given `display: none`, and because onLayout is driven by ResizeObserver, returning to the tab
    // re-fires it on a screen that was never unmounted, while on native react-freeze keeps the layout so only
    // the focus path runs. The ref survives both, which is why it is the only trustworthy signal here.
    const onLayout = () => {
        const isRepeatLayout = hasHadFirstLayout.current;
        hasHadFirstLayout.current = true;
        endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: isRepeatLayout});
        spanOnMount.current = undefined;
    };

    // Focus: ends span on re-visits (react-freeze cached layout, onLayout won't fire again).
    // Blur cleanup: cancels orphaned span when user navigates away before onLayout fires.
    useFocusEffect(() => {
        if (hasHadFirstLayout.current) {
            endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: true});
        }
        return () => cancelSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB);
    });

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
