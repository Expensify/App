import React from 'react';
import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';

function SearchInputSelectionWrapper({selection, ref, skipSkeleton: _skipSkeleton, ...props}: SearchAutocompleteInputProps & {skipSkeleton?: boolean}) {
    return (
        <SearchAutocompleteInput
            selection={selection}
            ref={ref}
            {...props}
        />
    );
}

export default SearchInputSelectionWrapper;
