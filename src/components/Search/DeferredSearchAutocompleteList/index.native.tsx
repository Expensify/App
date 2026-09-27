import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {SearchAutocompleteListProps} from '@components/Search/SearchAutocompleteList';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';

import useIsFocusedUntilTransitionEnd from '@hooks/useIsFocusedUntilTransitionEnd';

import {endSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import React, {useRef, useState} from 'react';

/**
 * This component acts as a wrapper for a SearchAutocompleteList, waiting for the navigation to be ready and deferring it,
 * so that the base UI can render before the list is loaded.
 * This enables the SearchRouterPage to open smoothly with a placeholder and load the list in the meantime.
 */
function DeferredAutocompleteList(props: SearchAutocompleteListProps) {
    // On native it stays mounted behind when a chat is opened from it.
    // Unmount the heavy list once this screen loses focus (kept mounted through the closing transition so it doesn't blank mid-navigation).
    const isFocusedUntilTransitionEnd = useIsFocusedUntilTransitionEnd();
    const [hasLayout, setHasLayout] = useState(false);
    const hasEndedPageVisibleSpan = useRef(false);

    const markLayoutComplete = () => {
        if (!hasEndedPageVisibleSpan.current) {
            hasEndedPageVisibleSpan.current = true;
            endSpan(CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE);
        }
        setHasLayout(true);
    };

    // Mount the real list as soon as the skeleton has laid out, overlapping its render with the
    // native-stack push animation instead of waiting for the transition to end. The push runs on the
    // UI thread, so rendering the list on the JS thread during it does not stutter the slide, and the
    // list's onLayout (which ends the ManualOpenSearchRouter span) now fires while the animation is
    // still finishing rather than ~150ms after it. Affordable because the option-list build is cheap
    // after the caching/deferral in #95378 and #95683.
    if (!hasLayout || !isFocusedUntilTransitionEnd) {
        return (
            <OptionsListSkeletonView
                fixedNumItems={4}
                shouldStyleAsTable
                onLayout={markLayoutComplete}
                speed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
                // At this speed the shimmer's first sweep starts 750ms in, and the list replaces this placeholder
                // well before that, so it paints flat either way.
                shouldAnimate={false}
            />
        );
    }

    return <SearchAutocompleteList {...props} />;
}

DeferredAutocompleteList.displayName = 'DeferredSearchAutocompleteList';

export default DeferredAutocompleteList;
