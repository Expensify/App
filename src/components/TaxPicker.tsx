import React, {useMemo, useState} from 'react';
import type {EdgeInsets} from 'react-native-safe-area-context';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {TaxRatesWithDefault} from '@src/types/onyx';
import OptionsSelector from './OptionsSelector';

type TaxPickerProps = {
    /** Collection of tax rates attached to a policy */
    taxRates: TaxRatesWithDefault;

    /** The selected tax rate of an expense */
    selectedTaxRate?: string;

    /**
     * Safe area insets required for reflecting the portion of the view,
     * that is not covered by navigation bars, tab bars, toolbars, and other ancestor views.
     */
    insets?: EdgeInsets;

    /** Callback to fire when a tax is pressed */
    onSubmit: () => void;
};

function TaxPicker({selectedTaxRate = '', taxRates, insets, onSubmit}: TaxPickerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const taxRatesCount = TransactionUtils.getEnabledTaxRateCount(taxRates.taxes);
    const isTaxRatesCountBelowThreshold = taxRatesCount < CONST.TAX_RATES_LIST_THRESHOLD;

    const shouldShowTextInput = !isTaxRatesCountBelowThreshold;

    const selectedOptions = useMemo(() => {
        if (!selectedTaxRate) {
            return [];
        }

        return [
            {
                name: selectedTaxRate,
                enabled: true,
                accountID: null,
            },
        ];
    }, [selectedTaxRate]);

    const sections = useMemo(() => {
        const {taxRatesOptions} = OptionsListUtils.getFilteredOptions({}, {}, [], searchValue, selectedOptions, [], false, false, false, {}, [], false, {}, [], false, false, true, taxRates);
        return taxRatesOptions;
    }, [taxRates, searchValue, selectedOptions]);

    const selectedOptionKey = sections?.[0]?.data?.find((taxRate) => taxRate.searchText === selectedTaxRate)?.keyForList;

    return (
        <OptionsSelector
            // @ts-expect-error TODO: Remove this once OptionsSelector (https://github.com/Expensify/App/issues/25125) is migrated to TypeScript.
            contentContainerStyles={[{paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom}]}
            optionHoveredStyle={styles.hoveredComponentBG}
            sectionHeaderStyle={styles.mt5}
            sections={sections}
            selectedOptions={selectedOptions}
            value={searchValue}
            // Focus the first option when searching
            focusedIndex={0}
            initiallyFocusedOptionKey={selectedOptionKey}
            textInputLabel={translate('common.search')}
            boldStyle
            highlightSelectedOptions
            isRowMultilineSupported
            shouldShowTextInput={shouldShowTextInput}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
        />
    );
}

TaxPicker.displayName = 'TaxPicker';

export default TaxPicker;
