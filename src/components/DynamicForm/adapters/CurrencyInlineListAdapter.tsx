import CurrencySelectionList from '@components/CurrencySelectionList';
import FormHelpMessage from '@components/FormHelpMessage';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {ComponentRef, Ref} from 'react';

import React from 'react';
import {View} from 'react-native';

type CurrencyInlineListAdapterProps = ForwardedFSClassProps & {
    /** Currency code */
    value?: string;

    /** Called with the picked currency code */
    onInputChange?: (value: string) => void;

    /** Validation error shown under the list */
    errorText?: string;

    /** Lets FormProvider scroll to the field when the user asks to fix the errors */
    ref?: Ref<ComponentRef<typeof View>>;
};

/** The searchable currency list shown as the page itself, for a currency field that is alone on its page */
function CurrencyInlineListAdapter({value, onInputChange = () => {}, errorText = '', forwardedFSClass, ref}: CurrencyInlineListAdapterProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <View
            ref={ref}
            fsClass={forwardedFSClass}
        >
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
        </View>
    );
}

export default CurrencyInlineListAdapter;
