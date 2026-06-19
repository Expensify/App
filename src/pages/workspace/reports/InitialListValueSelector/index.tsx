import type {ForwardedRef} from 'react';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useOnyx from '@hooks/useOnyx';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type InitialListValueSelectorProps = Pick<MenuItemBaseProps, 'label' | 'rightLabel' | 'errorText'> & {
    /** Currently selected value */
    value?: string;

    /** Function to call when the user selects a value */
    onInputChange?: (value: string) => void;

    /** Reference to the outer element */
    ref: ForwardedRef<View>;
};

function InitialListValueSelector({value = '', label = '', rightLabel, errorText = '', onInputChange, ref}: InitialListValueSelectorProps) {
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);
    const draftInitialValue = formDraft?.initialValue ?? '';

    useEffect(() => {
        const currentValueIndex = Object.values(formDraft?.listValues ?? {}).findIndex((listValue) => listValue === value);
        const isCurrentValueDisabled = formDraft?.disabledListValues?.[currentValueIndex] ?? true;

        if (isCurrentValueDisabled && value !== '') {
            onInputChange?.('');
        }
    }, [formDraft?.disabledListValues, formDraft?.listValues, onInputChange, value]);

    // The value is selected on a separate dynamic route which writes directly to the form draft. Sync that draft
    // value back into the form here so the form's value updates and any existing validation error is cleared.
    useEffect(() => {
        if (draftInitialValue === value) {
            return;
        }
        onInputChange?.(draftInitialValue);
    }, [draftInitialValue, value, onInputChange]);

    return (
        <View>
            <MenuItemWithTopDescription
                ref={ref}
                shouldShowRightIcon
                title={value}
                description={label}
                rightLabel={rightLabel}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_REPORT_FIELDS_INITIAL_LIST_VALUE.path))}
            />
        </View>
    );
}

export default InitialListValueSelector;
