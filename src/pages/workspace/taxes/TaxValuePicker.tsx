import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';

import {getTaxValueWithPercentage} from '@libs/actions/TaxRate';
import Navigation from '@libs/Navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {GestureResponderEvent} from 'react-native';

import React, {useEffect} from 'react';

type TaxValuePickerProps = {
    /** ID of the policy the new tax rate belongs to. */
    policyID: string;

    /** Current tax rate value (without the percent sign). */
    value?: string;

    /** Form validation error message. */
    errorText?: string;

    /** Label displayed on the right side of the menu item (e.g. "required"). */
    rightLabel?: string;

    /** Callback to call when the input changes. */
    onInputChange?: (value: string | undefined) => void;

    onPress?: (event: GestureResponderEvent | KeyboardEvent) => void;
};

function TaxValuePicker({policyID, value, errorText, rightLabel, onInputChange, onPress}: TaxValuePickerProps) {
    const {translate} = useLocalize();
    const previousValue = usePrevious(value);

    useEffect(() => {
        if (previousValue === value) {
            return;
        }
        onInputChange?.(value);
    }, [previousValue, value, onInputChange]);

    const handlePress = (event: GestureResponderEvent | KeyboardEvent) => {
        onPress?.(event);
        Navigation.navigate(ROUTES.WORKSPACE_TAX_CREATE_VALUE.getRoute(policyID));
    };

    return (
        <MenuItem.Root onPress={callFunctionIfActionIsAllowed(handlePress)}>
            <MenuItemField.Row
                name={translate('workspace.taxes.value')}
                value={value ? getTaxValueWithPercentage(value) : ''}
            >
                {!!rightLabel && <MenuItem.RightLabel>{rightLabel}</MenuItem.RightLabel>}
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
    );
}

export default TaxValuePicker;
