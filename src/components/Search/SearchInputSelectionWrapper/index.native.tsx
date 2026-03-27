import React, {useEffect, useState} from 'react';
import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';
import SearchInputSelectionSkeleton from '@components/Skeletons/SearchInputSelectionSkeleton';

// Native-only: SearchAutocompleteInput initialization is slow on the very first mount.
// Once initialized, subsequent mounts are fast, so we only show the skeleton once per app session.
let isAutocompleteInputInitialized = false;

function SearchInputSelectionWrapper({ref, skipSkeleton, ...props}: SearchAutocompleteInputProps & {skipSkeleton?: boolean}) {
    const [showSkeleton, setShowSkeleton] = useState(!skipSkeleton && !isAutocompleteInputInitialized);

    useEffect(() => {
        if (isAutocompleteInputInitialized) {
            return;
        }
        isAutocompleteInputInitialized = true;
        // Single-frame delay: let the skeleton paint once, then swap in the real input.
        // rAF fires on the next frame giving the JS thread just enough breathing room for layout.
        const id = requestAnimationFrame(() => {
            setShowSkeleton(false);
        });
        return () => cancelAnimationFrame(id);
    }, []);

    if (showSkeleton) {
        return <SearchInputSelectionSkeleton reasonAttributes={{context: 'SearchInputSelectionWrapper'}} />;
    }

    return (
        <SearchAutocompleteInput
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            selection={undefined}
        />
    );
}

export default SearchInputSelectionWrapper;
