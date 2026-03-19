import React from 'react';
import SearchAutocompleteInput from '@components/Search/NewSearchAutocompleteInput';
import NewSearchAutoCompleteInput from '@components/Search/NewSearchAutocompleteInput';
import type {NewSearchAutoCompleteInputProps} from '@components/Search/NewSearchAutocompleteInput';
import shouldRevampSearchActionsBar from '@libs/shouldRevampSearchActionsBar';

function SearchInputSelectionWrapper({selection, ref, ...props}: NewSearchAutoCompleteInputProps) {
    const InputComponent = shouldRevampSearchActionsBar() ? NewSearchAutoCompleteInput : SearchAutocompleteInput;
    return (
        <InputComponent
            selection={selection}
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default SearchInputSelectionWrapper;
