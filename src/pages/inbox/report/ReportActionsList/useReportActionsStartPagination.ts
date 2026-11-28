/** Keeps newer chat pagination moving when FlashList retains its start callback after a page arrives. */
import useNetwork from '@hooks/useNetwork';

import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import type {ActionListRef} from '@pages/inbox/ActionListTypes';

import type {RefObject} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';

const START_REACHED_THRESHOLD = 0.75;

type UseReportActionsStartPaginationParams = {
    listID: string;
    listRef: RefObject<ActionListRef | null>;
    newestFetchedReportActionID: string | undefined;
    hasNewerActions: boolean;
    isLoadingNewerReportActions: boolean | undefined;
    loadNewerChats: (force?: boolean) => void;
};

function useReportActionsStartPagination({
    listID,
    listRef,
    newestFetchedReportActionID,
    hasNewerActions,
    isLoadingNewerReportActions,
    loadNewerChats,
}: UseReportActionsStartPaginationParams) {
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const lastRequestRef = useRef<{listID: string; cursor: string | undefined} | undefined>(undefined);
    const transitionRef = useRef<ReturnType<typeof TransitionTracker.runAfterTransitions> | undefined>(undefined);
    const transitionFrameRef = useRef<number | undefined>(undefined);

    const requestNewerPage = () => {
        if (!hasNewerActions || isLoadingNewerReportActions || isOffline || !isFocused) {
            return;
        }

        const list = listRef.current;
        // FlashList's measurement accessors throw before it has a layout manager.
        if (!list?.getLayout?.(0)) {
            return;
        }
        const viewportHeight = list.getWindowSize?.().height;
        const offset = list.getAbsoluteLastScrollOffset?.();
        if (!viewportHeight || offset === undefined || offset > START_REACHED_THRESHOLD * viewportHeight) {
            return;
        }

        if (lastRequestRef.current?.listID === listID && lastRequestRef.current.cursor === newestFetchedReportActionID) {
            return;
        }

        // Both the edge callback and the post-response recheck consume the same fetched cursor.
        // Visible rows can change through Pusher or edits without making pagination progress.
        lastRequestRef.current = {listID, cursor: newestFetchedReportActionID};
        loadNewerChats(false);
    };

    const loadNewerChatsAtStart = () => {
        if (!isSearchTopmostFullScreenRoute()) {
            requestNewerPage();
            return;
        }
        transitionRef.current?.cancel();
        if (transitionFrameRef.current !== undefined) {
            cancelAnimationFrame(transitionFrameRef.current);
            transitionFrameRef.current = undefined;
        }
        transitionRef.current = TransitionTracker.runAfterTransitions({
            callback: () => {
                transitionRef.current = undefined;
                transitionFrameRef.current = requestAnimationFrame(() => {
                    transitionFrameRef.current = undefined;
                    requestNewerPage();
                });
            },
        });
    };

    const recheckNewerPage = useEffectEvent(() => {
        if (!newestFetchedReportActionID) {
            return;
        }
        loadNewerChatsAtStart();
    });

    useEffect(() => {
        // Read the list after the response has committed and FlashList has corrected its viewport.
        const frame = requestAnimationFrame(recheckNewerPage);
        return () => {
            cancelAnimationFrame(frame);
            transitionRef.current?.cancel();
            transitionRef.current = undefined;
            if (transitionFrameRef.current !== undefined) {
                cancelAnimationFrame(transitionFrameRef.current);
                transitionFrameRef.current = undefined;
            }
        };
    }, [listID, newestFetchedReportActionID, hasNewerActions, isLoadingNewerReportActions, isOffline, isFocused]);

    const trackStartReachedThreshold = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const {contentOffset, layoutMeasurement} = event.nativeEvent;
        if (layoutMeasurement.height > 0 && contentOffset.y > START_REACHED_THRESHOLD * layoutMeasurement.height) {
            // A real exit permits a deliberate retry of a failed cursor on the next entry.
            lastRequestRef.current = undefined;
        }
    };

    return {loadNewerChatsAtStart, trackStartReachedThreshold, onStartReachedThreshold: START_REACHED_THRESHOLD};
}

export default useReportActionsStartPagination;
