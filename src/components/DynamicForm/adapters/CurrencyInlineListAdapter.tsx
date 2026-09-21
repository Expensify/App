import CurrencySelectionList from '@components/CurrencySelectionList';
import FormHelpMessage from '@components/FormHelpMessage';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type CurrencyInlineListAdapterProps = {
    /** Chosen currency code supplied by the FormProvider */
    value?: string;

    /** Callback to update the currency in the FormProvider */
    onInputChange?: (value: string) => void;

    errorText?: string;
};

/** The searchable currency list shown as the page itself, for a currency field that is the only field on its page */
function CurrencyInlineListAdapter({value, onInputChange = () => {}, errorText = ''}: CurrencyInlineListAdapterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
            <CurrencySelectionList
                searchInputLabel={translate('common.currency')}
                initiallySelectedCurrencyCode={value || undefined}
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
