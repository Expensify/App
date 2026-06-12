import type {FlashListProps} from '@shopify/flash-list';
import {useEffect, useRef, useState} from 'react';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useWindowDimensions from '@hooks/useWindowDimensions';

/** Minimum possible height of a single list item. Used to overestimate how many items are needed to fill half of the viewport below the target item. */
const MIN_ITEM_HEIGHT = 36;

/** Vertical position of the target item within the viewport (0 = start, 0.5 = center, 1 = end), see FlashList's scrollToIndex. */
const CENTER_VIEW_POSITION = 0.5;

type FlashListScrollKeyProps<T> = {
    /** The array of items to render in the list. */
    data: T[];

    /** Function that extracts a unique key for each item in the list. */
    keyExtractor: (item: T, index: number) => string;

    /** Key of the item to initially scroll to when the list first renders. */
    initialScrollKey: string | null | undefined;

    /** Callback invoked when the user scrolls close to the start of the list. */
    onStartReached: FlashListProps<T>['onStartReached'];

    /** Whether the list should handle `maintainVisibleContentPosition` */
    shouldMaintainVisibleContentPosition?: boolean;
};

export default function useFlashListScrollKey<T>({data, keyExtractor, initialScrollKey, onStartReached, shouldMaintainVisibleContentPosition}: FlashListScrollKeyProps<T>) {
    const [isInitialRender, setIsInitialRender] = useState(!!initialScrollKey);
    const [hasLinkingSettled, setHasLinkingSettled] = useState(!initialScrollKey);
    // Whether this mount started as a deep-link. A key that appears later (e.g. marking a message
    // unread) must not engage the initial-scroll machinery, which only works around the first layout.
    const [isLinkingFlow] = useState(!!initialScrollKey);
    const reportScrollManager = useReportScrollManager();
    const {windowHeight} = useWindowDimensions();
    const hasAppliedCenteringCorrection = useRef(false);
    // Swallows onStartReached calls induced by the corrective centering scroll, which can land the
    // viewport inside the onStartReached threshold zone and would fire a spurious newer-page load.
    // Scroll-triggered calls outside that brief window are unaffected.
    const isSuppressingOnStartReached = useRef(false);

    // Two-frame handoff for deep-link:
    // RAF 1: switch from sliced data to the full array — FlashList's default MVCP pins the
    //        linked item through the data swap.
    // RAF 2: pinning has happened, disable MVCP so it doesn't cause later jumps.
    useEffect(() => {
        if (!isInitialRender) {
            return;
        }

        // Without an anchor on this frame, we are not doing the deep-link slice handoff; clear the flag so a key that
        // appears later (e.g. marking a message unread) cannot reuse the "first paint" slice path.
        if (!initialScrollKey) {
            // If the initial scroll key gets unset, we need to disable the initial render flag,
            // otherwise the list will not render..
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsInitialRender(false);
            return;
        }

        requestAnimationFrame(() => {
            setIsInitialRender(false);
            requestAnimationFrame(() => setHasLinkingSettled(true));
        });
    }, [isInitialRender, initialScrollKey]);

    // Once the sliced→full data handoff has settled, apply a final corrective scroll. The
    // initialScrollIndex pass centers the target using partially estimated layouts; by now the
    // items around it are measured, so scrollToIndex with viewPosition lands exactly.
    useEffect(() => {
        if (!hasLinkingSettled || !initialScrollKey || hasAppliedCenteringCorrection.current) {
            return;
        }
        hasAppliedCenteringCorrection.current = true;
        const targetIndex = data.findIndex((item, index) => keyExtractor(item, index) === initialScrollKey);
        if (targetIndex <= 0) {
            return;
        }
        isSuppressingOnStartReached.current = true;
        reportScrollManager.ref?.current?.scrollToIndex({index: targetIndex, viewPosition: CENTER_VIEW_POSITION, animated: false});
        // Lift the suppression once the corrective scroll has been committed.
        requestAnimationFrame(() => {
            isSuppressingOnStartReached.current = false;
        });
    }, [hasLinkingSettled, initialScrollKey, data, keyExtractor, reportScrollManager]);

    const maintainVisibleContentPosition: FlashListProps<T>['maintainVisibleContentPosition'] = {disabled: !shouldMaintainVisibleContentPosition && hasLinkingSettled};

    // Checks the suppression flag at call time, so only calls landing inside the corrective-scroll
    // window are swallowed.
    const onStartReachedGated: FlashListProps<T>['onStartReached'] = () => {
        if (isSuppressingOnStartReached.current) {
            return;
        }
        onStartReached?.();
    };

    const targetIndex = isLinkingFlow && initialScrollKey ? data.findIndex((item, index) => keyExtractor(item, index) === initialScrollKey) : -1;
    if (targetIndex <= 0) {
        return {displayedData: data, onStartReached: onStartReachedGated, maintainVisibleContentPosition, initialScrollIndex: undefined, initialScrollIndexParams: undefined};
    }

    // Keep targeting the item for the whole linking flow: FlashList re-applies the initial scroll
    // on every commit for a short window after the first layout (and ignores the prop afterwards),
    // so it can re-center the target when nearby items resize (e.g. expense previews swapping from
    // their loading to loaded state). The index must also stay correct across the sliced→full data swap.
    const initialScrollIndexParams = {viewPosition: CENTER_VIEW_POSITION};

    if (!isInitialRender) {
        return {displayedData: data, onStartReached: onStartReachedGated, maintainVisibleContentPosition, initialScrollIndex: targetIndex, initialScrollIndexParams};
    }

    // On the first render, slice the data so that the target item is rendered together with enough
    // newer items below it to fill the bottom half of the viewport even in the worst case (every
    // item at its minimum height), allowing the first paint to show the target item centered.
    const itemsBelowTarget = Math.ceil(Math.ceil(windowHeight / MIN_ITEM_HEIGHT) / 2);
    const sliceStart = Math.max(0, targetIndex - itemsBelowTarget);
    return {
        displayedData: data.slice(sliceStart),
        onStartReached: () => {},
        maintainVisibleContentPosition,
        initialScrollIndex: targetIndex - sliceStart,
        initialScrollIndexParams,
    };
}
