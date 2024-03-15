import React, {useState} from 'react';
import type {EdgeInsets} from 'react-native-safe-area-context';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {TaxRate, TaxRatesWithDefault} from '@src/types/onyx';
import SelectionList from './SelectionList';
import RadioListItem from './SelectionList/RadioListItem';
import type {ListItem} from './SelectionList/types';

type TaxPickerProps = {
    /** Collection of tax rates attached to a policy */
    taxRates?: TaxRatesWithDefault;

    /** The selected tax rate of an expense */
    selectedTaxRate?: string;

    /**
     * Safe area insets required for reflecting the portion of the view,
     * that is not covered by navigation bars, tab bars, toolbars, and other ancestor views.
     */
    insets?: EdgeInsets;

    /** Callback to fire when a tax is pressed */
    onSubmit: (tax: ListItem) => void;
};

function TaxPicker({selectedTaxRate = '', taxRates, insets, onSubmit}: TaxPickerProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    if (!taxRates) {
        return;
    }

    const taxRatesCount = TransactionUtils.getEnabledTaxRateCount(taxRates?.taxes);
    const isTaxRatesCountBelowThreshold = taxRatesCount < CONST.TAX_RATES_LIST_THRESHOLD;

    const getModifiedName = (data: TaxRate, code: string) => `${data.name} (${data.value})${selectedTaxRate === code ? ` • ${translate('common.default')}` : ''}`;

    const shouldShowTextInput = !isTaxRatesCountBelowThreshold;

    const section = Object.entries(taxRates.taxes ?? {}).map(([key, item]) => ({text: getModifiedName(item, key), keyForList: key}));
    const selectedOptionKey = section.find((taxRate) => taxRate.keyForList === selectedTaxRate)?.keyForList;

    return (
        <SelectionList
            ListItem={RadioListItem}
            onSelectRow={onSubmit}
            initiallyFocusedOptionKey={selectedOptionKey ?? ''}
            sections={[{data: section}]}
            containerStyle={{paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            isRowMultilineSupported
            textInputValue={searchValue}
            onChangeText={setSearchValue}
        />
    );
}

TaxPicker.displayName = 'TaxPicker';

export default TaxPicker;
