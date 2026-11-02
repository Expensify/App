import {shouldTextFilterGrow} from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';
import NegatableFilter from '@components/Search/FilterComponents/NegatableFilter';
import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import type {ReportFieldTextKey, SearchTextFilterKeys} from '@components/Search/types';
import TextInput from '@components/TextInput';

import useThemeStyles from '@hooks/useThemeStyles';

import {getFilterFormValues} from '@libs/SearchQueryUtils';
import {getFilterNegatableValue} from '@libs/SearchUIUtils';
import StringUtils from '@libs/StringUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';

import React, {useState} from 'react';

import type {PopoverComponentProps} from './FilterPopupButton';

import BasePopup from './BasePopup';

type TextFilterPopupProps = {
    baseFilterKey: Exclude<SearchTextFilterKeys, typeof CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT | typeof CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT | ReportFieldTextKey>;
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

    const shouldGrow = shouldTextFilterGrow(baseFilterKey);
    const normalizedValue = shouldGrow && value !== undefined ? StringUtils.lineBreaksToSpaces(value) : value;
    const error = useTextFilterValidation(baseFilterKey, normalizedValue);

    const applyChanges = () => {
        if (error) {
            return;
        }
        updateFilterForm(getFilterFormValues(baseFilterKey, normalizedValue, isNegated));
        closeOverlay();
    };

    return (
        <BasePopup
            label={label}
            onApply={applyChanges}
            applySentryLabel={`Search-FilterPopupApply-${baseFilterKey}`}
            shouldSubmitOnEnter={!shouldGrow}
        >
            <NegatableFilter
                baseFilterKey={baseFilterKey}
                isNegated={isNegated}
                onNegationChange={setIsNegated}
            >
                <TextInput
                    placeholder={label}
                    value={value}
                    errorText={error}
                    hasError={!!error}
                    onChangeText={setValue}
                    accessibilityLabel={label}
                    role={CONST.ROLE.PRESENTATION}
                    containerStyles={[styles.ph5]}
                    autoGrowHeight={shouldGrow}
                    maxAutoGrowHeight={shouldGrow ? variables.textInputAutoGrowMaxHeight : undefined}
                    submitBehavior={shouldGrow ? 'submit' : undefined}
                    onSubmitEditing={shouldGrow ? applyChanges : undefined}
                />
            </NegatableFilter>
        </BasePopup>
    );
}

export default TextFilterPopup;
