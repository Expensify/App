/** Guards typography, form refs, navigation and read-only behavior in the smaller field-row migrations. */
import {fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import CurrencySelector from '@components/CurrencySelector';
import CustomUnitDefaultCategorySelector from '@components/CustomUnitDefaultCategorySelector';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';

import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CarTripDetails from '@pages/Travel/CarTripDetails';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Reservation} from '@src/types/onyx/Transaction';

import type * as ReactNavigation from '@react-navigation/native';
import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {createRef} from 'react';
import {View as NativeView} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => (route: string) => route);
jest.mock('@userActions/Session', () => ({callIfAuthenticated: jest.fn((callback: () => void) => callback)}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencySymbol: () => '$'})}));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
}));

describe('Small composable field rows', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        await waitForBatchedUpdates();
    });

    it.each([
        ['', false],
        ['USD', false],
        ['USD', true],
    ] as const)('keeps currency label styling for value=%s and symbol=%s', (value, shouldShowCurrencySymbol) => {
        // Given empty labels use placeholder typography, while filled code-only labels intentionally use normal text size
        const ref = createRef<ComponentRef<typeof View>>();
        const {result} = renderHook(() => useThemeStyles());

        // When the currency form input is rendered in each supported display state
        render(
            <LocaleContextProvider>
                <CurrencySelector
                    inputID="currency"
                    ref={ref}
                    value={value}
                    label="Payment currency"
                    shouldShowCurrencySymbol={shouldShowCurrencySymbol}
                />
            </LocaleContextProvider>,
        );

        // Then the label preserves its deliberate size and the selected currency is unchanged
        if (!value) {
            expect(screen.UNSAFE_getAllByType(MenuItem.FieldNamePlaceholder)).toHaveLength(1);
            expect(screen.UNSAFE_queryByType(MenuItem.FieldValue)).toBeNull();
        } else {
            expect(screen.getByText('Payment currency')).toHaveStyle(shouldShowCurrencySymbol ? result.current.textLabelSupporting : result.current.textNormal);
            expect(screen.getByText(shouldShowCurrencySymbol ? 'USD - $' : 'USD')).toBeOnTheScreen();
        }
    });

    it.each([false, true])('keeps the form ref, validation and currency route, with workspace confirmation=%s', (useWorkspaceConfirmationCurrencySelector) => {
        // Given validation needs the actual focusable row and can show an error alongside its chevron
        const ref = createRef<ComponentRef<typeof View>>();
        const onInputChange = jest.fn();
        render(
            <LocaleContextProvider>
                <CurrencySelector
                    inputID="currency"
                    ref={ref}
                    value="USD"
                    errorText="Required currency"
                    onInputChange={onInputChange}
                    useWorkspaceConfirmationCurrencySelector={useWorkspaceConfirmationCurrencySelector}
                />
            </LocaleContextProvider>,
        );

        // When the currency input is pressed
        fireEvent.press(screen.getByRole('button'), {nativeEvent: {}});

        // Then its ref, error decoration, authentication gate, change callback and destination survive the migration
        expect(ref.current).not.toBeNull();
        expect(typeof ref.current?.focus).toBe('function');
        expect(screen.UNSAFE_getByType(MenuItem.Root).props.ref).toBe(ref);
        expect(screen.UNSAFE_getByType(MenuItem.Root).props.sentryLabel).toBe(CONST.SENTRY_LABEL.CURRENCY_SELECTOR.OPEN);
        expect(screen.UNSAFE_getByType(MenuItem.HelpText).props.message).toBe('Required currency');
        expect(screen.UNSAFE_getAllByType(MenuItem.BrickRoadIndicator)).toHaveLength(1);
        expect(screen.UNSAFE_getAllByType(MenuItem.Chevron)).toHaveLength(1);
        expect(callIfAuthenticated).toHaveBeenCalledWith(expect.any(Function), {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        expect(onInputChange).toHaveBeenCalledWith('USD');
        expect(Navigation.navigate).toHaveBeenCalledWith(
            useWorkspaceConfirmationCurrencySelector ? DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION_CURRENCY.path : DYNAMIC_ROUTES.PAYMENT_CARD_CURRENCY_SELECTOR.path,
        );
    });

    it.each([false, true])('keeps category row interaction and opacity, with interactive=%s', (interactive) => {
        // Given a category field can be editable or fully opaque and read-only
        const {result} = renderHook(() => useThemeStyles());
        render(
            <LocaleContextProvider>
                <CustomUnitDefaultCategorySelector
                    defaultValue="Travel &amp; meals"
                    label="Default category"
                    wrapperStyle={result.current.mt3}
                    customUnitID="unit"
                    interactive={interactive}
                />
            </LocaleContextProvider>,
        );

        // When inspecting or activating its composed root
        const root = screen.UNSAFE_getByType(MenuItem.Root);
        if (interactive) {
            fireEvent.press(screen.getByRole('button'), {nativeEvent: {}});
        }

        // Then category decoding, spacing and navigation follow the existing permission rule without disabled dimming
        expect(screen.getByText('Travel & meals')).toBeOnTheScreen();
        expect(root.props.style).toBe(result.current.mt3);
        expect(root.props.isDisabled).not.toBe(true);
        expect(screen.UNSAFE_queryAllByType(MenuItem.Chevron)).toHaveLength(interactive ? 1 : 0);
        expect(Navigation.navigate).toHaveBeenCalledTimes(interactive ? 1 : 0);
        if (!interactive) {
            expect(root.props.onPress).toBeUndefined();
            expect(screen.queryByRole('button')).toBeNull();
        }
    });

    it('keeps car pickup/drop-off headings, locations and read-only rows', () => {
        // Given a car booking whose two date headings have separate supporting locations
        const reservation: Reservation = {
            type: CONST.RESERVATION_TYPE.CAR,
            start: {date: '2026-12-01T10:00:00Z', location: 'Pickup terminal'},
            end: {date: '2026-12-03T12:00:00Z', location: 'Return terminal'},
        };
        const {result} = renderHook(() => useThemeStyles());

        // When the read-only car details render
        render(
            <LocaleContextProvider>
                <CarTripDetails
                    reservation={reservation}
                    personalDetails={undefined}
                />
            </LocaleContextProvider>,
        );

        // Then both date values preserve headline typography, labels keep normal size and helpers stay outside the rows
        const values = screen.UNSAFE_getAllByType(MenuItem.FieldValue);
        expect(values).toHaveLength(2);
        expect(values.every((value) => value.props.numberOfLines === 0)).toBe(true);
        for (const value of values) {
            expect(value.props.style).toEqual([result.current.textLarge, result.current.textHeadlineH2]);
        }
        for (const content of screen.UNSAFE_getAllByType(MenuItem.Content)) {
            const group: unknown = content.props.children;
            if (!React.isValidElement(group)) {
                throw new Error('Expected one group without spacing between the label and heading');
            }
            expect(group.type).toBe(NativeView);
        }
        expect(screen.getByText('Pickup terminal')).toHaveStyle([result.current.mutedNormalTextLabel, result.current.pb3, result.current.mtn2]);
        expect(screen.getByText('Return terminal')).toBeOnTheScreen();
        expect(screen.UNSAFE_queryAllByType(MenuItem.Chevron)).toHaveLength(0);
        expect(screen.queryByRole('button')).toBeNull();
        expect(screen.UNSAFE_getAllByType(MenuItem.FieldName).every((name) => name.props.style === result.current.textNormal)).toBe(true);
    });
});
