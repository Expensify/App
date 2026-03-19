import React, {useEffect, useState} from 'react';
import SearchAutocompleteInput from '@components/Search/NewSearchAutocompleteInput';
import NewSearchAutoCompleteInput from '@components/Search/NewSearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';
import SearchInputSelectionSkeleton from '@components/Skeletons/SearchInputSelectionSkeleton';
import shouldRevampSearchActionsBar from '@libs/shouldRevampSearchActionsBar';

// Native-only: SearchAutocompleteInput initialization is slow on the very first mount.
// Once initialized, subsequent mounts are fast, so we only show the skeleton once per app session.
let isAutocompleteInputInitialized = false;

function SearchInputSelectionWrapper({ref, ...props}: SearchAutocompleteInputProps) {
    const [showSkeleton, setShowSkeleton] = useState(!isAutocompleteInputInitialized);

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

    const InputComponent = shouldRevampSearchActionsBar() ? NewSearchAutoCompleteInput : SearchAutocompleteInput;
    return (
        <InputComponent
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            selection={undefined}
        />
    );
}

export default SearchInputSelectionWrapper;
