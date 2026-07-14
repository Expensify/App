import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import type {ReportFieldTextKey, SearchTextFilterKeys} from '@components/Search/types';
import TextInput from '@components/TextInput';

import useThemeStyles from '@hooks/useThemeStyles';

import {getFilterFormValues} from '@libs/SearchQueryUtils';
import {getFilterNegatableValue} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';

import React, {useState} from 'react';

import type {PopoverComponentProps} from './FilterPopupButton';

import NegatableFilter from '../FilterComponents/NegatableFilter';
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

    const error = useTextFilterValidation(baseFilterKey, value);

    const applyChanges = () => {
        if (error) {
            return;
        }
        updateFilterForm(getFilterFormValues(baseFilterKey, value, isNegated));
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
                <TextInput
                    placeholder={label}
                    value={value}
                    errorText={error}
                    hasError={!!error}
                    onChangeText={setValue}
                    accessibilityLabel={label}
                    role={CONST.ROLE.PRESENTATION}
                    containerStyles={[styles.ph5]}
                />
            </NegatableFilter>
        </BasePopup>
    );
}

export default TextFilterPopup;
