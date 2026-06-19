import React, {useEffect} from 'react';
import type {GestureResponderEvent} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import {getTaxValueWithPercentage} from '@libs/actions/TaxRate';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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

    /** Callback to call when the component is pressed. */
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
        <MenuItemWithTopDescription
            shouldShowRightIcon
            title={value ? getTaxValueWithPercentage(value) : ''}
            description={translate('workspace.taxes.value')}
            onPress={handlePress}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            rightLabel={rightLabel}
            errorText={errorText}
        />
    );
}

export default TaxValuePicker;
