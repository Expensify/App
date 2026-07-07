import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';

import React from 'react';

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
