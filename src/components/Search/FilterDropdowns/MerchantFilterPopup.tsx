/**
 * Edits the Merchant filter value and match type from its search filter chip.
 */
import MerchantMatchTypeSelector from '@components/Search/FilterComponents/MerchantMatchTypeSelector';
import NegatableFilter from '@components/Search/FilterComponents/NegatableFilter';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import TextInput from '@components/TextInput';

import useThemeStyles from '@hooks/useThemeStyles';

import {getFilterFormValues} from '@libs/SearchQueryUtils';
import {getFilterNegatableValue} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {MerchantMatchType, SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {PopoverComponentProps} from './FilterPopupButton';

import BasePopup from './BasePopup';

type MerchantFilterPopupProps = {
    /** The Merchant filter key. */
    baseFilterKey: typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT;
    /** The current search filter form values. */
    values: Partial<SearchAdvancedFiltersForm> | undefined;
    /** The translated filter label. */
    label: string;
    /** Closes the filter popup. */
    closeOverlay: PopoverComponentProps['closeOverlay'];
    /** Applies the updated Merchant filter values. */
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
};

function MerchantFilterPopup({baseFilterKey, values, label, updateFilterForm, closeOverlay}: MerchantFilterPopupProps) {
    const styles = useThemeStyles();

    const {isNegated: initialIsNegated, value: initialValue} = getFilterNegatableValue(baseFilterKey, values);
    const [isNegated, setIsNegated] = useState(initialIsNegated);
    const [value, setValue] = useState(initialValue);
    const shouldShowMerchantMatchType = !isNegated;
    const [merchantOperator, setMerchantOperator] = useState<MerchantMatchType>(values?.[FILTER_KEYS.MERCHANT_OPERATOR] ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);

    const error = useTextFilterValidation(baseFilterKey, value);
    const filterInput = (
        <TextInput
            placeholder={label}
            value={value}
            errorText={error}
            hasError={!!error}
            onChangeText={setValue}
            accessibilityLabel={label}
            role={CONST.ROLE.PRESENTATION}
            containerStyles={shouldShowMerchantMatchType ? [styles.ph5, styles.mb5] : [styles.ph5]}
        />
    );

    const applyChanges = () => {
        if (error) {
            return;
        }
        updateFilterForm({
            ...getFilterFormValues(baseFilterKey, value, isNegated),
            [FILTER_KEYS.MERCHANT_OPERATOR]: isNegated ? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO : merchantOperator,
        });
        closeOverlay();
    };

    return (
        <BasePopup
            label={label}
            onApply={applyChanges}
            applySentryLabel={`Search-FilterPopupApply-${baseFilterKey}`}
        >
            <NegatableFilter
                baseFilterKey={baseFilterKey}
                isNegated={isNegated}
                onNegationChange={setIsNegated}
            >
                {shouldShowMerchantMatchType ? (
                    <View>
                        {filterInput}
                        <MerchantMatchTypeSelector
                            value={merchantOperator}
                            onChange={setMerchantOperator}
                        />
                    </View>
                ) : (
                    filterInput
                )}
            </NegatableFilter>
        </BasePopup>
    );
}

export default MerchantFilterPopup;
