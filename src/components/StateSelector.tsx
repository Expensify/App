import useGeographicalStateAndCountryFromRoute from '@hooks/useGeographicalStateAndCountryFromRoute';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {authTokenTypeSelector} from '@src/selectors/Session';

import type {ComponentRef, ForwardedRef} from 'react';
import type {View} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useEffect, useRef} from 'react';

import type {MenuItemProps} from './MenuItem';

import MenuItem from './MenuItem';
import MenuItemField from './MenuItem/presets/MenuItemField';

type State = keyof typeof COMMON_CONST.STATES;

type StateSelectorProps = ForwardedFSClassProps & {
    /** Form error text. e.g when no state is selected */
    errorText?: string;

    value?: State | '';

    /** Callback to call when the input changes */
    onInputChange?: (value: string) => void;

    label?: string;
    wrapperStyle?: MenuItemProps['wrapperStyle'];

    /** Callback to call when the picker modal is dismissed */
    onBlur?: () => void;

    ref?: ForwardedRef<ComponentRef<typeof View>>;
};

function StateSelector({errorText, onBlur, value: stateCode, label, onInputChange, wrapperStyle, forwardedFSClass, ref}: StateSelectorProps) {
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
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

    return (
        <MenuItem.Root
            sentryLabel={CONST.SENTRY_LABEL.STATE_SELECTOR.OPEN}
            ref={ref}
            onPress={() => {
                callIfAuthenticated(() => {
                    didOpenStateSelector.current = true;
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADDRESS_STATE.getRoute(stateCode, label)));
                }, session)();
            }}
            style={wrapperStyle}
        >
            <MenuItemField.Row
                name={label || translate('common.state')}
                value={title}
                forwardedFSClass={forwardedFSClass}
            >
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

export default StateSelector;

export type {State};
