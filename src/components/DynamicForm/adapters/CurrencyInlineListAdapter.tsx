import CurrencySelectionList from '@components/CurrencySelectionList';
import FormHelpMessage from '@components/FormHelpMessage';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type CurrencyInlineListAdapterProps = {
    /** Currency code */
    value?: string;

    /** Called with the picked currency code */
    onInputChange?: (value: string) => void;

    /** Validation error shown under the list */
    errorText?: string;
};

/** The searchable currency list shown as the page itself, for a currency field that is alone on its page */
function CurrencyInlineListAdapter({value, onInputChange = () => {}, errorText = ''}: CurrencyInlineListAdapterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            <CurrencySelectionList
                searchInputLabel={translate('common.currency')}
                initiallySelectedCurrencyCode={value === '' ? undefined : value}
                onSelect={(item) => onInputChange(item.currencyCode)}
            />
            {!!errorText && (
                <View style={styles.ph5}>
                    <FormHelpMessage message={errorText} />
                </View>
            )}
        </>
    );
}

export default CurrencyInlineListAdapter;
