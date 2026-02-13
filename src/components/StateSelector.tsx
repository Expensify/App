import {useIsFocused} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useEffect, useRef} from 'react';
import type {ForwardedRef} from 'react';
import type {View} from 'react-native';
import useGeographicalStateAndCountryFromRoute from '@hooks/useGeographicalStateAndCountryFromRoute';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {MenuItemProps} from './MenuItem';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';

type State = keyof typeof COMMON_CONST.STATES;

type StateSelectorProps = {
    /** Form error text. e.g when no state is selected */
    errorText?: string;

    /** Current selected state  */
    value?: State | '';

    /** Callback to call when the input changes */
    onInputChange?: (value: string) => void;

    /** Label to display on field */
    label?: string;

    /** Any additional styles to apply */
    wrapperStyle?: MenuItemProps['wrapperStyle'];

    /** Callback to call when the picker modal is dismissed */
    onBlur?: () => void;

    /** object to get route details from */
    stateSelectorRoute?: typeof ROUTES.SETTINGS_ADDRESS_STATE | typeof ROUTES.MONEY_REQUEST_STATE_SELECTOR;

    /** Reference to the outer element */
    ref?: ForwardedRef<View>;
};

function StateSelector({errorText, onBlur, value: stateCode, label, onInputChange, wrapperStyle, stateSelectorRoute = ROUTES.SETTINGS_ADDRESS_STATE, ref}: StateSelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {state: stateFromUrl} = useGeographicalStateAndCountryFromRoute();

    const didOpenStateSelector = useRef(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        // Check if the state selector was opened and no value was selected, triggering onBlur to display an error
        if (isFocused && didOpenStateSelector.current) {
            didOpenStateSelector.current = false;
            if (!stateFromUrl) {
                onBlur?.();
            }
        }

        // If no state is selected from the URL, exit the effect early to avoid further processing.
        if (!stateFromUrl) {
            return;
        }

        // If a state is selected, invoke `onInputChange` to update the form and clear any validation errors related to the state selection.
        if (onInputChange) {
            onInputChange(stateFromUrl);
        }

        // Clears the `state` parameter from the URL to ensure the component state is driven by the parent component rather than URL parameters.
        // This helps prevent issues where the component might not update correctly if the state is controlled by both the parent and the URL.
        Navigation.setParams({state: undefined});

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateFromUrl, onBlur, isFocused]);

    const title = stateCode && stateCode in COMMON_CONST.STATES ? translate(`allStates.${stateCode}.stateName`) : '';
    const descStyle = title.length === 0 ? styles.textNormal : null;

    return (
        <MenuItemWithTopDescription
            descriptionTextStyle={descStyle}
            ref={ref}
            shouldShowRightIcon
            title={title}
            // Label can be an empty string
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            description={label || translate('common.state')}
            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={errorText}
            onPress={() => {
                const activeRoute = Navigation.getActiveRoute();
                didOpenStateSelector.current = true;
                Navigation.navigate(stateSelectorRoute.getRoute(stateCode, activeRoute, label));
            }}
            wrapperStyle={wrapperStyle}
        />
    );
}

export default StateSelector;

export type {State};
