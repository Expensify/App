import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {ForwardedRef} from 'react';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

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

    // The value is selected on a separate dynamic route which writes directly to the form draft. FormProvider
    // already syncs that draft write into the form's value, but it never re-runs validation, so the "Initial value"
    // required error lingers. We can't detect the change by comparing the draft against `value` (they're already in
    // sync by the time this runs), so we track the previous draft value and push it through onInputChange whenever it
    // changes. onInputChange triggers the form's onValidate, which clears the stale error.
    const previousDraftInitialValue = useRef(draftInitialValue);
    useEffect(() => {
        if (draftInitialValue === previousDraftInitialValue.current) {
            return;
        }
        previousDraftInitialValue.current = draftInitialValue;
        onInputChange?.(draftInitialValue);
    }, [draftInitialValue, onInputChange]);

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
