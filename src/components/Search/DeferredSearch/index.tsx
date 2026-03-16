/**
 * Web renders Search directly; no deferral needed. See index.native.tsx for the native wrapper.
 * We still wrap it to apply key={hash} which was moved here from the call site.
 */
import React from 'react';
import Search from '..';
import type {SearchProps} from '..';

function DeferredSearch(props: SearchProps) {
    return (
        <Search
            key={props.queryJSON.hash}
            // eslint-disable-next-line react/jsx-props-no-spreading -- Transparent wrapper that forwards all props to Search
            {...props}
        />
    );
}

DeferredSearch.displayName = 'DeferredSearch';

export default DeferredSearch;
