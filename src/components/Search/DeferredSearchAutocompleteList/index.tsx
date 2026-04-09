import React, {useCallback, useRef} from 'react';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {SearchAutocompleteListProps} from '@components/Search/SearchAutocompleteList';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';
import {endSpan} from '@libs/telemetry/activeSpans';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';

function DeferredAutocompleteList(props: SearchAutocompleteListProps) {
    const [shouldRender, setShouldRender] = React.useState(false);
    const [, startTransition] = React.useTransition();
    const hasEndedPageVisibleSpan = useRef(false);

    const renderComponent = useCallback(() => {
        if (!hasEndedPageVisibleSpan.current) {
            hasEndedPageVisibleSpan.current = true;
            endSpan(CONST.TELEMETRY.SPAN_SEARCH_PAGE_VISIBLE);
        }
        startTransition(() => setShouldRender(true));
    }, []);

    if (!shouldRender) {
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

    // eslint-disable-next-line react/jsx-props-no-spreading -- This is a transparent wrapper that forwards all props to SearchAutocompleteList
    return <SearchAutocompleteList {...props} />;
}

DeferredAutocompleteList.displayName = 'DeferredSearchAutocompleteList';

export default DeferredAutocompleteList;
