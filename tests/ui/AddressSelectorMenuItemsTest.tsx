/** Guards form refs, placeholder typography, and error composition on address selector rows. */
import {fireEvent, render, screen} from '@testing-library/react-native';

import CountrySelector from '@components/CountrySelector';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import StateSelector from '@components/StateSelector';

import Navigation from '@libs/Navigation/Navigation';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';
import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {createRef} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useGeographicalStateAndCountryFromRoute', () => () => ({}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), setParams: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => (route: string) => route);
jest.mock('@userActions/Session', () => ({callIfAuthenticated: jest.fn((callback: () => void) => callback)}));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
}));

const cases = [
    ['Country', CountrySelector, CONST.SENTRY_LABEL.COUNTRY_SELECTOR.OPEN],
    ['State', StateSelector, CONST.SENTRY_LABEL.STATE_SELECTOR.OPEN],
] as const;

describe('Composable address selectors', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        await waitForBatchedUpdates();
    });

    it.each(cases)('%s uses a normal placeholder when empty and a field name/value when filled', (_name, Component) => {
        // Given an empty address field whose description style is now owned by the placeholder leaf.
        const {rerender} = render(
            <LocaleContextProvider>
                <Component inputID="address" value="" />
            </LocaleContextProvider>,
        );
        expect(screen.UNSAFE_getAllByType(MenuItem.FieldNamePlaceholder)).toHaveLength(1);
        expect(screen.UNSAFE_queryByType(MenuItem.FieldValue)).toBeNull();

        // When a valid code is selected (CA is both a country and a state code).
        rerender(
            <LocaleContextProvider>
                <Component inputID="address" value="CA" />
            </LocaleContextProvider>,
        );

        // Then the supporting field name and translated value replace the empty placeholder.
        expect(screen.UNSAFE_queryByType(MenuItem.FieldNamePlaceholder)).toBeNull();
        expect(screen.UNSAFE_getAllByType(MenuItem.FieldName)).toHaveLength(1);
        expect(screen.UNSAFE_getAllByType(MenuItem.FieldValue)).toHaveLength(1);
    });

    it.each(cases)('%s retains the form root ref, Sentry label, and authenticated picker handler', (_name, Component, sentryLabel) => {
        // Given a form ref needed by validation scroll/focus.
        const ref = createRef<ComponentRef<typeof View>>();
        render(
            <LocaleContextProvider>
                <Component ref={ref} inputID="address" />
            </LocaleContextProvider>,
        );

        // When the user presses the selector row.
        fireEvent.press(screen.getByRole('button'), {nativeEvent: {}});

        // Then the ref still reaches the focusable root and the gated handler opens the picker.
        expect(screen.UNSAFE_getByType(MenuItem.Root).props.ref).toBe(ref);
        expect(ref.current).not.toBeNull();
        expect(typeof ref.current?.focus).toBe('function');
        expect(screen.UNSAFE_getByType(MenuItem.Root).props.sentryLabel).toBe(sentryLabel);
        expect(callIfAuthenticated).toHaveBeenCalledWith(expect.any(Function), {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });

    it.each(cases)('%s renders error help and a red dot alongside the chevron', (_name, Component) => {
        // Given a form validation error.
        const errorText = 'Required field';

        // When the invalid field is rendered.
        render(
            <LocaleContextProvider>
                <Component inputID="address" errorText={errorText} />
            </LocaleContextProvider>,
        );

        // Then the existing error message, red indicator, and navigation affordance are retained.
        expect(screen.UNSAFE_getByType(MenuItem.HelpText).props.isError).toBe(true);
        expect(screen.UNSAFE_getByType(MenuItem.HelpText).props.message).toBe(errorText);
        expect(screen.UNSAFE_getByType(MenuItem.BrickRoadIndicator).props.status).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        expect(screen.UNSAFE_getAllByType(MenuItem.Chevron)).toHaveLength(1);
    });

    it.each(cases)('%s does not navigate when authentication blocks the press', (_name, Component) => {
        // Given an authentication gate that replaces the requested picker action.
        render(
            <LocaleContextProvider>
                <Component inputID="address" />
            </LocaleContextProvider>,
        );
        const showSignIn = jest.fn();
        jest.mocked(callIfAuthenticated).mockReturnValueOnce(showSignIn);

        // When the selector is pressed.
        fireEvent.press(screen.getByRole('button'), {nativeEvent: {}});

        // Then only the gate's replacement runs; picker navigation is not attempted.
        expect(showSignIn).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('keeps State wrapper spacing on the root and honors a custom label', () => {
        // Given a caller-provided margin and state label.
        const wrapperStyle = {marginTop: 12};

        // When the state selector is rendered.
        render(
            <LocaleContextProvider>
                <StateSelector label="State / Province" wrapperStyle={wrapperStyle} />
            </LocaleContextProvider>,
        );

        // Then spacing remains on the pressable root and the caller label is preserved.
        expect(screen.UNSAFE_getByType(MenuItem.Root).props.style).toBe(wrapperStyle);
        expect(screen.getByText('State / Province')).toBeOnTheScreen();
    });
});
