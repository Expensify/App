import {useRoute} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useEffect} from 'react';
import type {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type DateTimeSelectorProps = {
    /** Form error text. e.g when no datetime is selected */
    errorText?: string;

    /** Callback called when the datetime changes. */
    onInputChange?: (value?: string) => void;

    /** Current datetime */
    value?: string;

    /** Name of the field */
    name: string;

    /** inputID used by the Form component */
    // eslint-disable-next-line react/no-unused-prop-types
    inputID: string;

    // The ref is required by InputWrapper, even though it's not used in this component yet.
    ref?: ForwardedRef<View>;
};

function DateTimeSelector(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    {errorText = '', name, value, onInputChange, ref}: DateTimeSelectorProps,
) {
    const fieldValue = (useRoute().params as Record<string, string> | undefined)?.[name];

    useEffect(() => {
        // If no datetime is present in the URL, exit the effect early to avoid further processing.
        if (!fieldValue) {
            return;
        }

        // If datetime is present, invoke `onInputChange` to update the form and clear any validation errors related to the constant selection.
        if (onInputChange) {
            onInputChange(fieldValue);
        }

        // Clears the `datetime` parameter from the URL to ensure the component datetime is driven by the parent component rather than URL parameters.
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
                Navigation.navigate(ROUTES.DETAILS_DATE_TIME_PICKER_PAGE.getRoute(name, value, Navigation.getActiveRoute()));
            }}
            shouldShowRightIcon
        />
    );
}

export default DateTimeSelector;
