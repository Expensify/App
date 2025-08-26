import type {ForwardedRef} from 'react';
import React, {forwardRef, Suspense} from 'react';
import Deferred from '@components/Deferred';
import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';
import SearchInputSelectionSkeleton from '@components/Skeletons/SearchInputSelectionSkeleton';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

function SearchInputSelectionWrapper(props: SearchAutocompleteInputProps, ref: ForwardedRef<BaseTextInputRef>) {
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

SearchInputSelectionWrapper.displayName = 'SearchInputSelectionWrapper';

export default forwardRef(SearchInputSelectionWrapper);
