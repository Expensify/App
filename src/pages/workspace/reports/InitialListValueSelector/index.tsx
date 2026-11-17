import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {authTokenTypeSelector} from '@src/selectors/Session';

import type {ComponentRef, ForwardedRef} from 'react';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

type InitialListValueSelectorProps = Pick<MenuItemBaseProps, 'label' | 'rightLabel' | 'errorText'> & {
    value?: string;

    /** Function to call when the user selects a value */
    onInputChange?: (value: string) => void;

    /** Route to the initial value picker */
    route: Route;

    /** Reference to the outer element */
    ref: ForwardedRef<ComponentRef<typeof View>>;
};

function InitialListValueSelector({value = '', label = '', rightLabel, errorText = '', onInputChange, route, ref}: InitialListValueSelectorProps) {
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
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
            <MenuItem.Root
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.REPORT_FIELDS.CREATE_INITIAL_VALUE}
                ref={ref}
                onPress={callIfAuthenticated(() => Navigation.navigate(route), session)}
            >
                <MenuItemField.Row
                    name={label}
                    value={value}
                >
                    {!value && !errorText && !!rightLabel && <MenuItem.RightLabel>{rightLabel}</MenuItem.RightLabel>}
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    <MenuItem.Chevron />
                </MenuItemField.Row>
                {!!errorText && (
                    <MenuItem.HelpText
                        isError
                        message={errorText}
                    />
                )}
            </MenuItem.Root>
        </View>
    );
}

export default InitialListValueSelector;
