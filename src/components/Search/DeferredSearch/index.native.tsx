import React, {useEffect, useMemo, useState} from 'react';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import Search from '..';
import type {SearchProps} from '..';

/**
 * Wrapper that defers mounting Search by one frame when the query hash changes.
 * Search is expensive to mount (many hooks, Onyx subscriptions, memos). When key={hash}
 * changes, React remounts it and can show a blank frame. This shows a lightweight
 * skeleton for one frame first so the transition is skeleton -> Search (no blank gap).
 */
function DeferredSearch(props: SearchProps) {
    const {queryJSON, contentContainerStyle} = props;
    const queryHash = queryJSON?.hash;

    const [preparedHash, setPreparedHash] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (queryHash === undefined || preparedHash === queryHash) {
            return;
        }
        const id = requestAnimationFrame(() => {
            setPreparedHash(queryHash);
        });
        return () => cancelAnimationFrame(id);
    }, [queryHash, preparedHash]);

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
