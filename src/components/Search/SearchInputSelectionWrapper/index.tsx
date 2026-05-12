import React from 'react';
import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';

function SearchInputSelectionWrapper({selection, ref, skipSkeleton: _skipSkeleton, ...props}: SearchAutocompleteInputProps & {skipSkeleton?: boolean}) {
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
