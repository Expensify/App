import type {ForwardedRef} from 'react';
import React, {forwardRef, startTransition, useEffect, useState} from 'react';
import {View} from 'react-native';
import SearchAutocompleteInput from '@components/Search/SearchAutocompleteInput';
import type {SearchAutocompleteInputProps} from '@components/Search/SearchAutocompleteInput';
import Text from '@components/Text';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function SearchInputSelectionWrapper(props: SearchAutocompleteInputProps, ref: ForwardedRef<BaseTextInputRef>) {
    const [delayFirstRender, setDelayFirstRender] = useState(true);
    const styles = useThemeStyles();

    const {translate} = useLocalize();

    useEffect(() => {
        startTransition(() => {
            setDelayFirstRender(false);
        });
    }, []);

    if (delayFirstRender) {
        return (
            <View style={[{flex: 1}, styles.searchRouterTextInputContainer, styles.searchAutocompleteInputResults, styles.br2, styles.justifyContentCenter]}>
                <Text style={[styles.textSupporting, {marginLeft: 4.5}, styles.lineHeightUndefined]}>{translate('search.searchPlaceholder')}</Text>
            </View>
        );
    }

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
// true false
