/** Keeps the content at the bottom edge of the report-actions list in place when the list viewport changes height. */
import type {ActionSheetAwareScrollViewProps} from '@components/ActionSheetAwareScrollView/types';

import {renderBottomPinnedScrollView} from '@pages/inbox/report/ReportActionsList/BottomPinnedScrollView';

import {useLayoutEffect, useRef} from 'react';

import type {UseViewportBottomAnchorParams, ViewportBottomAnchor} from './types';

import useBottomPinnedScrollView from './useBottomPinnedScrollView';
import useViewportBottomScrollCorrection from './useViewportBottomScrollCorrection';

function useViewportBottomAnchor({legendListRef, listData, listID, shouldBeAlignedToTop}: UseViewportBottomAnchorParams): ViewportBottomAnchor {
    const scrollCorrection = useViewportBottomScrollCorrection({legendListRef, listData, listID});
    const pinnedScrollView = useBottomPinnedScrollView({legendListRef, listID});

    const {flushPendingViewportLayout} = pinnedScrollView;
    const {finishViewportCorrection} = scrollCorrection;
    const positionedAlignmentRef = useRef<{listID: string; shouldBeAlignedToTop: boolean} | undefined>(undefined);

    const startViewportAnchor = () => {
        positionedAlignmentRef.current = {listID, shouldBeAlignedToTop};
        if (shouldBeAlignedToTop) {
            scrollCorrection.startViewportAnchor();
        } else {
            pinnedScrollView.startViewportAnchor();
        }
    };

    // A thread can become top-aligned when its parent action loads. LegendList keeps the same list and does
    // not signal readiness again, so switch anchors at its current position before painting the new alignment.
    useLayoutEffect(() => {
        const alignment = positionedAlignmentRef.current;
        if (alignment?.listID !== listID || alignment.shouldBeAlignedToTop === shouldBeAlignedToTop) {
            return;
        }
        flushPendingViewportLayout();
        finishViewportCorrection();
        startViewportAnchor();
    }, [listID, shouldBeAlignedToTop, flushPendingViewportLayout, finishViewportCorrection, startViewportAnchor]);

    if (shouldBeAlignedToTop) {
        return {...scrollCorrection, startViewportAnchor, renderScrollComponent: renderTopAlignedScrollView};
    }

    return {
        startViewportAnchor,
        preserveViewportBottom: pinnedScrollView.preserveViewportBottom,
        renderScrollComponent: pinnedScrollView.renderScrollComponent,
        // The pinned scroll view resizes and scrolls in one native update, so no scroll event has to wait for a correction.
        deferScrollUntilViewportCorrected: () => false,
        finishViewportCorrection: () => {},
    };
}

// Keeping the same component tree preserves the native scroll offset when a thread changes alignment.
// Without a pinned height the scroll view fills its container and short threads stay at the top.
function renderTopAlignedScrollView(props: ActionSheetAwareScrollViewProps) {
    return renderBottomPinnedScrollView({...props, height: undefined, raisedBy: 0});
}

export default useViewportBottomAnchor;
