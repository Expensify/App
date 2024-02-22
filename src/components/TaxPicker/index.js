import lodashGet from 'lodash/get';
import React, {useMemo, useState} from 'react';
import _ from 'underscore';
import OptionsSelector from '@components/OptionsSelector';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import {defaultProps, propTypes} from './taxPickerPropTypes';

function TaxPicker({selectedTaxRate, taxRates, insets, onSubmit}) {
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

    const selectedOptionKey = lodashGet(_.filter(lodashGet(sections, '[0].data', []), (taxRate) => taxRate.searchText === selectedTaxRate)[0], 'keyForList');

    return (
        <OptionsSelector
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
TaxPicker.propTypes = propTypes;
TaxPicker.defaultProps = defaultProps;

export default TaxPicker;
