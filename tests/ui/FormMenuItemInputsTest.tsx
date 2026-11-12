/** Guards refs and validation decorations on the composable form picker rows. */
import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import TimeModalPicker from '@components/TimeModalPicker';

import Navigation from '@libs/Navigation/Navigation';

import InitialListValueSelector from '@pages/workspace/reports/InitialListValueSelector';
import TypeSelector from '@pages/workspace/reports/TypeSelector';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {createRef} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/Modal', () => () => null);
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@userActions/Session', () => ({callIfAuthenticated: jest.fn((callback: () => void) => callback)}));

const cases = [
    ['Type', TypeSelector, CONST.SENTRY_LABEL.WORKSPACE.REPORT_FIELDS.CREATE_TYPE],
    ['Initial value', InitialListValueSelector, CONST.SENTRY_LABEL.WORKSPACE.REPORT_FIELDS.CREATE_INITIAL_VALUE],
    ['Time', TimeModalPicker, CONST.SENTRY_LABEL.TIME_MODAL_PICKER.OPEN],
] as const;

describe('Composable form picker rows', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        await waitForBatchedUpdates();
    });

    it.each(cases)('%s keeps its form ref on the focusable root and its existing Sentry label', (_name, Component, sentryLabel) => {
        // Given a form field ref that error handling needs to focus.
        const ref = createRef<ComponentRef<typeof View>>();

        // When the picker row is mounted through its real composable root.
        render(
            <LocaleContextProvider>
                <Component
                    ref={ref}
                    label="Field"
                    route={ROUTES.HOME}
                />
            </LocaleContextProvider>,
        );

        // Then form error handling can reach the host's focus method, not a non-forwarding preset.
        expect(screen.UNSAFE_getByType(MenuItem.Root).props.ref).toBe(ref);
        expect(ref.current).not.toBeNull();
        expect(typeof ref.current?.focus).toBe('function');
        expect(screen.UNSAFE_getByType(MenuItem.Root).props.sentryLabel).toBe(sentryLabel);
        expect(callIfAuthenticated).toHaveBeenCalledWith(expect.any(Function), {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
    });

    it.each(cases)('%s composes error help and a red dot without removing the chevron', (_name, Component) => {
        // Given a form picker with a validation error.
        const ref = createRef<ComponentRef<typeof View>>();

        // When the row is rendered in its invalid state.
        render(
            <LocaleContextProvider>
                <Component
                    ref={ref}
                    label="Field"
                    route={ROUTES.HOME}
                    errorText="Required field"
                />
            </LocaleContextProvider>,
        );

        // Then the root owns both the error line and the navigable field row.
        expect(screen.UNSAFE_getByType(MenuItem.BrickRoadIndicator).props.status).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        expect(screen.UNSAFE_getByType(MenuItem.HelpText).props.isError).toBe(true);
        expect(screen.UNSAFE_getByType(MenuItem.HelpText).props.message).toBe('Required field');
        expect(screen.UNSAFE_getAllByType(MenuItem.Chevron)).toHaveLength(1);
        expect(screen.UNSAFE_queryByType(MenuItem.RightLabel)).toBeNull();
    });

    describe.each(cases.slice(0, 2))('%s required label', (_name, Component) => {
        it.each([
            ['', '', true],
            ['', 'Required field', false],
            ['text', '', false],
            ['text', 'Required field', false],
        ] as const)('value=%s error=%s shows Required=%s', (value, errorText, shouldShowRequired) => {
            // Given each combination of an empty/populated value and a validation error.
            const ref = createRef<ComponentRef<typeof View>>();

            // When the report field selector is rendered with its legacy right label.
            render(
                <LocaleContextProvider>
                    <Component
                        ref={ref}
                        label="Field"
                        route={ROUTES.HOME}
                        value={value}
                        errorText={errorText}
                        rightLabel="Required"
                    />
                </LocaleContextProvider>,
            );

            // Then Required only appears before a value or error takes its place.
            expect(screen.UNSAFE_queryAllByType(MenuItem.RightLabel)).toHaveLength(shouldShowRequired ? 1 : 0);
        });

        it('opens the existing picker route through the authenticated handler', () => {
            // Given a report field selector with its existing navigation route.
            const ref = createRef<ComponentRef<typeof View>>();
            render(
                <LocaleContextProvider>
                    <Component
                        ref={ref}
                        label="Field"
                        route={ROUTES.HOME}
                    />
                </LocaleContextProvider>,
            );

            // When the user presses the row with a native event.
            fireEvent.press(screen.getByRole('button'), {nativeEvent: {}});

            // Then navigation still goes to the supplied route.
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.HOME);
        });
    });
});
