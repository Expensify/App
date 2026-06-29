import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {SearchAutocompleteListProps} from '@components/Search/SearchAutocompleteList';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';

import useIsFocusedUntilTransitionEnd from '@hooks/useIsFocusedUntilTransitionEnd';

import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {endSpan} from '@libs/telemetry/activeSpans';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import CONST from '@src/CONST';

import React, {useEffect, useRef, useState} from 'react';

/**
 * This component acts as a wrapper for a SearchAutocompleteList, waiting for the navigation to be ready and deferring it,
 * so that the base UI can render before the list is loaded.
 * This enables the SearchRouterPage to open smoothly with a placeholder and load the list in the meantime.
 */
function DeferredAutocompleteList(props: SearchAutocompleteListProps) {
    // On native it stays mounted behind when a chat is opened from it.
    // Unmount the heavy list once this screen loses focus (kept mounted through the closing transition so it doesn't blank mid-navigation).
    const isFocusedUntilTransitionEnd = useIsFocusedUntilTransitionEnd();
    const [shouldRender, setShouldRender] = useState(false);
    const [hasLayout, setHasLayout] = useState(false);
    const hasEndedPageVisibleSpan = useRef(false);

    const handleLayout = () => {
        if (!hasEndedPageVisibleSpan.current) {
            hasEndedPageVisibleSpan.current = true;
            endSpan(CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE);
        }
        setHasLayout(true);
    };

    // Wait for the slide-in animation to finish before rendering the list. Using startTransition would put the render
    // on React's low-priority lane, causing Onyx storms during open to restart it 2-3x and recompute heavy memos.
    // runAfterTransitions queues a single blocking render after the navigation animation completes.
    useEffect(() => {
        if (!hasLayout) {
            return;
        }
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => setShouldRender(true),
        });
        return () => handle.cancel();
    }, [hasLayout]);

    if (!shouldRender || !isFocusedUntilTransitionEnd) {
        return (
            <OptionsListSkeletonView
                fixedNumItems={4}
                shouldStyleAsTable
                onLayout={handleLayout}
                speed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
                reasonAttributes={{context: 'DeferredSearchAutocompleteList'} satisfies SkeletonSpanReasonAttributes}
            />
        );
    }

    return <SearchAutocompleteList {...props} />;
}

DeferredAutocompleteList.displayName = 'DeferredSearchAutocompleteList';

export default DeferredAutocompleteList;
