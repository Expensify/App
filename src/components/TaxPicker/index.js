import lodashGet from 'lodash/get';
import React, {useMemo, useState} from 'react';
import _ from 'underscore';
import OptionsSelector from '@components/OptionsSelector';
import useLocalize from '@hooks/useLocalize';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import {defaultProps, propTypes} from './taxPickerPropTypes';

function TaxPicker({selectedTaxRate, policyTaxRates, insets, onSubmit}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyTaxRatesCount = OptionsListUtils.getEnabledTaxRateCount(policyTaxRates.taxes);
    const isTaxRatesCountBelowThreshold = policyTaxRatesCount < CONST.TAX_RATES_LIST_THRESHOLD;

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
        const {policyTaxRatesOptions} = OptionsListUtils.getFilteredOptions(
            {}, // reports {}
            {}, // personalDetails {}
            [], // betas []
            searchValue, // searchValue string
            selectedOptions, // selectedOptions any[]
            [], // excludedLogins any[]
            false, // includeOwnedWorkspaceChats boolean
            false, // includeP2P boolean
            false, // includeCategories boolean
            {}, // categories {}
            [], // recentlyUsedCategories string[]
            false, // includeTags boolean
            {}, // tags {}
            [], // recentlyUsedTags string[]
            false, // canInviteUser boolean
            false, // includeSelectedOptions
            true, // includePolicyTaxRates boolean
            policyTaxRates, // policyTaxRates {}
        );
        return policyTaxRatesOptions;
    }, [policyTaxRates, searchValue, selectedOptions]);

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
