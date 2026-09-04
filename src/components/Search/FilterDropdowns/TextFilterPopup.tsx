import MerchantMatchTypeSelector from '@components/Search/FilterComponents/MerchantMatchTypeSelector';
import NegatableFilter from '@components/Search/FilterComponents/NegatableFilter';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import type {ReportFieldTextKey, SearchTextFilterKeys} from '@components/Search/types';
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

type TextFilterPopupProps = {
    baseFilterKey: Exclude<SearchTextFilterKeys, typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT | ReportFieldTextKey>;
    values: Partial<SearchAdvancedFiltersForm> | undefined;
    label: string;
    closeOverlay: PopoverComponentProps['closeOverlay'];
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
};

function TextFilterPopup({baseFilterKey, values, label, updateFilterForm, closeOverlay}: TextFilterPopupProps) {
    const styles = useThemeStyles();

    const {isNegated: initialIsNegated, value: initialValue} = getFilterNegatableValue(baseFilterKey, values);
    const [isNegated, setIsNegated] = useState(initialIsNegated);
    const [value, setValue] = useState(initialValue);
    const isMerchantFilter = baseFilterKey === FILTER_KEYS.MERCHANT;
    const shouldShowMerchantMatchType = isMerchantFilter && !isNegated;
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
            ...(isMerchantFilter && {
                [FILTER_KEYS.MERCHANT_OPERATOR]: shouldShowMerchantMatchType ? merchantOperator : CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            }),
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

export default TextFilterPopup;
