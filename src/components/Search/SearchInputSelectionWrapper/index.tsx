import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useThemeStyles from '@hooks/useThemeStyles';

function SearchInputSelectionWrapper({selection, ...props}: SearchAutocompleteInputProps, ref: ForwardedRef<BaseTextInputRef>) {
    const styles = useThemeStyles();
    return (
        <SearchAutocompleteInput
            selection={selection}
            inputStyle={[styles.p3, styles.dFlex, styles.alignItemsCenter]}
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

SearchInputSelectionWrapper.displayName = 'SearchInputSelectionWrapper';

export default forwardRef(SearchInputSelectionWrapper);
