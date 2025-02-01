import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

function SearchInputSelectionWrapper(props: SearchAutocompleteInputProps, ref: ForwardedRef<BaseTextInputRef>) {
    return (
        <SearchAutocompleteInput
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            selection={undefined}
        />
    );
}

SearchInputSelectionWrapper.displayName = 'SearchInputSelectionWrapper';

export default forwardRef(SearchInputSelectionWrapper);
