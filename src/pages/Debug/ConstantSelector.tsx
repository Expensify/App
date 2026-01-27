import {useRoute} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useEffect} from 'react';
import type {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type ConstantSelectorProps = {
    /** Form error text. e.g when no constant is selected */
    errorText?: string;

    /** Callback called when the constant changes. */
    onInputChange?: (value?: string) => void;

    /** Current selected constant  */
    value?: string;

    /** Name of the field */
    name: string;

    /** inputID used by the Form component */
    // eslint-disable-next-line react/no-unused-prop-types
    inputID: string;

    /** Type of debug form - required to access constant field options for a specific form */
    formType: ValueOf<typeof CONST.DEBUG.FORMS>;

    policyID?: string;

    // The ref is required by InputWrapper, even though it's not used in this component yet.
    ref: ForwardedRef<View>;
};

function ConstantSelector(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    {formType, policyID, errorText = '', name, value, onInputChange, ref}: ConstantSelectorProps,
) {
    const fieldValue = (useRoute().params as Record<string, string> | undefined)?.[name];

    useEffect(() => {
        // If no constant is selected from the URL, exit the effect early to avoid further processing.
        if (!fieldValue && fieldValue !== '') {
            return;
        }

        // If a constant is selected, invoke `onInputChange` to update the form and clear any validation errors related to the constant selection.
        if (onInputChange) {
            onInputChange(fieldValue);
        }

        // Clears the `constant` parameter from the URL to ensure the component constant is driven by the parent component rather than URL parameters.
        // This helps prevent issues where the component might not update correctly if the country is controlled by both the parent and the URL.
        Navigation.setParams({[name]: undefined});
    }, [fieldValue, name, onInputChange]);

    return (
        <MenuItemWithTopDescription
            title={value}
            description={name}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={errorText}
            onPress={() => {
                Navigation.navigate(ROUTES.DETAILS_CONSTANT_PICKER_PAGE.getRoute(formType, name, value, policyID, Navigation.getActiveRoute()));
            }}
            shouldShowRightIcon
        />
    );
}

export default ConstantSelector;
