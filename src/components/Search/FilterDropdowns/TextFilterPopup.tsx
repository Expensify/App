import useTextFilterValidation from '@components/Search/hooks/useTextFilterValidation';
import type {SearchTextFilterKeys} from '@components/Search/types';
import TextInput from '@components/TextInput';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form/SearchAdvancedFiltersForm';

import React, {useState} from 'react';

import type {PopoverComponentProps} from './FilterPopupButton';

import BasePopup from './BasePopup';

type TextFilterPopupProps = {
    filterKey: SearchTextFilterKeys;
    value: string | undefined;
    label: string;
    closeOverlay: PopoverComponentProps['closeOverlay'];
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
};

function TextFilterPopup({filterKey, value: initialValue, label, updateFilterForm, closeOverlay}: TextFilterPopupProps) {
    const styles = useThemeStyles();
    const [value, setValue] = useState(initialValue);

    const error = useTextFilterValidation(filterKey, value);

    const applyChanges = () => {
        if (error) {
            return;
        }
        updateFilterForm({[filterKey]: value} as Partial<SearchAdvancedFiltersForm>);
        closeOverlay();
    };

    return (
        <BasePopup
            label={label}
            onApply={applyChanges}
            applySentryLabel={`Search-FilterPopupApply-${filterKey}`}
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
        </BasePopup>
    );
}

export default TextFilterPopup;
