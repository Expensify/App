import React, {useRef, useState, useTransition} from 'react';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {SearchAutocompleteListProps} from '@components/Search/SearchAutocompleteList';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';
import useIsFocusedUntilTransitionEnd from '@hooks/useIsFocusedUntilTransitionEnd';
import {endSpan} from '@libs/telemetry/activeSpans';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';

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
    const [, startTransition] = useTransition();
    const hasEndedPageVisibleSpan = useRef(false);

    // Run the transition after the skeleton is mounted; end the "page visible" span once
    const renderComponent = () => {
        if (!hasEndedPageVisibleSpan.current) {
            hasEndedPageVisibleSpan.current = true;
            endSpan(CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE);
        }
        startTransition(() => setShouldRender(true));
    };

    if (!shouldRender || !isFocusedUntilTransitionEnd) {
        return (
            <OptionsListSkeletonView
                fixedNumItems={4}
                shouldStyleAsTable
                onLayout={renderComponent}
                speed={CONST.TIMING.SKELETON_ANIMATION_SPEED}
                reasonAttributes={{context: 'DeferredSearchAutocompleteList'} satisfies SkeletonSpanReasonAttributes}
            />
        );
    }

    return <SearchAutocompleteList {...props} />;
}

DeferredAutocompleteList.displayName = 'DeferredSearchAutocompleteList';

export default DeferredAutocompleteList;
