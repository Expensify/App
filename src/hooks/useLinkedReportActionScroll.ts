import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useActionListContext} from '@pages/inbox/ActionListContext';

import CONST from '@src/CONST';

import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef, useState} from 'react';
import {Platform} from 'react-native';

import useReportScrollManager from './useReportScrollManager';

type LinkedReportActionScrollParams = {
    listID: string;
    linkedReportActionID: string | undefined;
    targetIndex: number;
    isLastAction: boolean;
};

/** Keeps a linked action positioned as its measured layout settles, until the reader takes over scrolling. */
function useLinkedReportActionScroll({listID, linkedReportActionID, targetIndex, isLastAction}: LinkedReportActionScrollParams) {
    const isFocused = useIsFocused();
    const {getListRef} = useActionListContext();
    const reportScrollManager = useReportScrollManager();
    const [readyListID, setReadyListID] = useState<string>();
    const [measurementVersion, setMeasurementVersion] = useState(0);
    const shouldPositionRef = useRef(false);
    const wasLastActionRef = useRef(false);
    const cancelPositionRef = useRef<(() => void) | undefined>(undefined);

    const stopPositioning = () => {
        shouldPositionRef.current = false;
        cancelPositionRef.current?.();
    };

    useEffect(() => {
        shouldPositionRef.current = isFocused && !!linkedReportActionID;
        wasLastActionRef.current = false;
        return () => {
            shouldPositionRef.current = false;
            cancelPositionRef.current?.();
        };
    }, [isFocused, linkedReportActionID, listID]);

    const positionLinkedAction = useEffectEvent(() => {
        if (!shouldPositionRef.current || targetIndex < 0) {
            return;
        }
        // Once a reply follows a linked final action, normal live-tail following owns the viewport.
        if (wasLastActionRef.current && !isLastAction) {
            shouldPositionRef.current = false;
            return;
        }
        wasLastActionRef.current = isLastAction;
        reportScrollManager.scrollToIndex(
            targetIndex,
            isLastAction ? {animated: false, viewPosition: 1} : {animated: false, viewPosition: 0, viewOffset: CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET},
        );
    });

    useEffect(() => {
        if (!isFocused || !linkedReportActionID || readyListID !== listID || targetIndex < 0 || !shouldPositionRef.current) {
            return;
        }

        let frame: number | undefined;
        // Row size notifications precede LegendList's position recalculation. Wait for that layout
        // and the navigation transition before using the measured target position.
        const transition = TransitionTracker.runAfterTransitions({
            callback: () => {
                frame = requestAnimationFrame(positionLinkedAction);
            },
        });
        const cancel = () => {
            transition.cancel();
            if (frame !== undefined) {
                cancelAnimationFrame(frame);
            }
        };
        cancelPositionRef.current = cancel;
        return cancel;
    }, [isFocused, linkedReportActionID, listID, readyListID, targetIndex, isLastAction, measurementVersion]);

    const stopPositioningFromWebInput = useEffectEvent(stopPositioning);
    useEffect(() => {
        if (Platform.OS !== 'web' || readyListID !== listID) {
            return;
        }
        const scrollElement = getListRef()?.current?.getScrollableNode?.();
        if (!(scrollElement instanceof HTMLElement)) {
            return;
        }
        const onScrollKey = (event: KeyboardEvent) => {
            if (!['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
                return;
            }
            stopPositioningFromWebInput();
        };
        scrollElement.addEventListener('wheel', stopPositioningFromWebInput, {passive: true});
        scrollElement.addEventListener('pointerdown', stopPositioningFromWebInput, {passive: true});
        scrollElement.addEventListener('keydown', onScrollKey);
        return () => {
            scrollElement.removeEventListener('wheel', stopPositioningFromWebInput);
            scrollElement.removeEventListener('pointerdown', stopPositioningFromWebInput);
            scrollElement.removeEventListener('keydown', onScrollKey);
        };
    }, [getListRef, listID, readyListID]);

    const onReady = () => setReadyListID(listID);
    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!shouldPositionRef.current || readyListID !== listID || !linkedReportActionID || isLastAction) {
            return;
        }
        const position = getListRef()?.current?.getState?.()?.positionByKey(linkedReportActionID);
        if (position === undefined) {
            return;
        }
        const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
        const targetOffset = Math.max(0, Math.min(position - CONST.REPORT.ACTIONS.LINKED_MESSAGE_OFFSET, contentSize.height - layoutMeasurement.height));
        // Native anchoring can commit after the row-size correction. Check the resulting viewport
        // as well, so that late adjustment cannot move a successfully positioned link out of view.
        if (Math.abs(targetOffset - contentOffset.y) > 1) {
            setMeasurementVersion((version) => version + 1);
        }
    };
    const onItemSizeChanged = ({index, size, previous}: {index: number; size: number; previous: number}) => {
        if (!shouldPositionRef.current || readyListID !== listID || index > targetIndex || size === previous) {
            return;
        }
        setMeasurementVersion((version) => version + 1);
    };

    return {onReady, onItemSizeChanged, onScroll, stopPositioning};
}

export default useLinkedReportActionScroll;
