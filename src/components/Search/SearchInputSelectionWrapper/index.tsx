import React, {useEffect, useState} from 'react';
import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';
import SearchInputSelectionSkeleton from '@components/Skeletons/SearchInputSelectionSkeleton';

let isAutocompleteInputInitialized = false;

function SearchInputSelectionWrapper({selection, ref, ...props}: SearchAutocompleteInputProps) {
    const [showSkeleton, setShowSkeleton] = useState(!isAutocompleteInputInitialized);

    useEffect(() => {
        if (isAutocompleteInputInitialized) {
            return;
        }
        isAutocompleteInputInitialized = true;
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
            selection={selection}
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default SearchInputSelectionWrapper;
