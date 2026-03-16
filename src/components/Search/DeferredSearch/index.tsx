import React, {useEffect, useMemo, useState} from 'react';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import Search from '..';
import type {SearchProps} from '..';

/**
 * Wrapper that defers mounting Search until the skeleton has painted.
 * Search is expensive to mount (many hooks, Onyx subscriptions, heavy memos).
 * Showing a skeleton first and using startTransition to prepare Search in the
 * background keeps navigation responsive even under heavy CPU load.
 */
function DeferredSearch(props: SearchProps) {
    const {queryJSON, contentContainerStyle} = props;
    const queryHash = queryJSON?.hash;

    const [preparedHash, setPreparedHash] = useState<number | undefined>(undefined);
    const [, startTransition] = React.useTransition();

    useEffect(() => {
        if (queryHash === undefined || preparedHash === queryHash) {
            return;
        }
        startTransition(() => setPreparedHash(queryHash));
    }, [queryHash, preparedHash, startTransition]);

    const isSearchReady = preparedHash === queryHash;
    const skeletonReasonAttributes = useMemo(() => ({context: 'DeferredSearch'}), []);

    if (!isSearchReady) {
        return (
            <SearchRowSkeleton
                shouldAnimate
                containerStyle={contentContainerStyle}
                reasonAttributes={skeletonReasonAttributes}
            />
        );
    }

    return (
        <Search
            key={queryHash}
            // eslint-disable-next-line react/jsx-props-no-spreading -- Transparent wrapper that forwards all props to Search
            {...props}
        />
    );
}

DeferredSearch.displayName = 'DeferredSearch';

export default DeferredSearch;
