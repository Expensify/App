import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
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
};

function TaxValuePicker({policyID, value, errorText, rightLabel}: TaxValuePickerProps) {
    const {translate} = useLocalize();

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon
            title={value ? getTaxValueWithPercentage(value) : ''}
            description={translate('workspace.taxes.value')}
            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAX_CREATE_VALUE.getRoute(policyID))}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            rightLabel={rightLabel}
            errorText={errorText}
        />
    );
}

export default TaxValuePicker;
