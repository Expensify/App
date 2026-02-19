import React, {Suspense} from 'react';
import Deferred from '@components/Deferred';
import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';
import SearchInputSelectionSkeleton from '@components/Skeletons/SearchInputSelectionSkeleton';

function SearchInputSelectionWrapper({ref, ...props}: SearchAutocompleteInputProps) {
    return (
        <Suspense fallback={<SearchInputSelectionSkeleton />}>
            <Deferred>
                <SearchAutocompleteInput
                    ref={ref}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    selection={undefined}
                />
            </Deferred>
        </Suspense>
    );
}

export default SearchInputSelectionWrapper;
