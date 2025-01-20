import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useThemeStyles from '@hooks/useThemeStyles';

function SearchInputSelectionWrapper(props: SearchAutocompleteInputProps, ref: ForwardedRef<BaseTextInputRef>) {
    const styles = useThemeStyles();
    return (
        <SearchAutocompleteInput
            inputStyle={[styles.pl3, styles.pr3]}
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            selection={undefined}
        />
    );
}

SearchInputSelectionWrapper.displayName = 'SearchInputSelectionWrapper';

export default forwardRef(SearchInputSelectionWrapper);
