/** Guards form feedback and picker behavior while replacing legacy field rows. */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import MenuItemFieldInput from '@components/MenuItemFieldInput';
import TextPicker from '@components/TextPicker';
import TextSelectorModal from '@components/TextPicker/TextSelectorModal';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {createRef} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/TextPicker/TextSelectorModal', () => jest.fn(() => null));
jest.mock('@userActions/Session', () => ({callIfAuthenticated: jest.fn((callback: () => void) => callback)}));

describe('Composable form field migration', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        await waitForBatchedUpdates();
    });

    it('displays the formatted plan without exposing its wire value, and keeps the focus ref and navigation', () => {
        // Given a form field whose stored plan differs from its displayed name.
        const ref = createRef<ComponentRef<typeof View>>();
        const onPress = jest.fn();
        render(
            <LocaleContextProvider>
                <MenuItemFieldInput
                    ref={ref}
                    name="Plan type"
                    value="corporate"
                    displayValue="Control"
                    onPress={onPress}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CONFIRMATION_FORM_PLAN_TYPE}
                />
            </LocaleContextProvider>,
        );

        // When the user opens the plan selector.
        fireEvent.press(screen.getByRole('button', {name: 'Plan type, Control'}), {nativeEvent: {}});

        // Then the wire value stays hidden, navigation is gated, and form validation can focus the row.
        expect(screen.queryByText('corporate')).toBeNull();
        expect(onPress).toHaveBeenCalledTimes(1);
        expect(callIfAuthenticated).toHaveBeenCalledWith(onPress, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        expect(screen.UNSAFE_getByType(MenuItem.Root).props.ref).toBe(ref);
        expect(typeof ref.current?.focus).toBe('function');
    });

    it('renders owner validation on the focusable row without losing its value or chevron', () => {
        // Given a form-supplied validation error on an owner field.
        render(
            <LocaleContextProvider>
                <MenuItemFieldInput
                    name="Workspace owner"
                    value="Owner"
                    errorText="Required field"
                    onPress={jest.fn()}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CONFIRMATION_FORM_OWNER}
                />
            </LocaleContextProvider>,
        );

        // When the invalid row is read by its accessible name.
        const row = screen.getByRole('button', {name: /^Workspace owner, Owner/});

        // Then it announces and renders the error alongside its existing navigation affordance.
        expect(row.props.accessibilityLabel).toContain('Your review is required');
        expect(screen.UNSAFE_getByType(MenuItem.HelpText).props.isError).toBe(true);
        expect(screen.UNSAFE_getByType(MenuItem.HelpText).props.message).toBe('Required field');
        expect(screen.UNSAFE_getByType(MenuItem.BrickRoadIndicator).props.status).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        expect(screen.UNSAFE_getAllByType(MenuItem.Chevron)).toHaveLength(1);
    });

    it.each([
        ['', '', true],
        ['', 'Required field', false],
        ['Saved name', '', false],
        ['Saved name', 'Required field', false],
    ] as const)('TextPicker value=%s error=%s shows Required=%s', (value, errorText, shouldShowRequired) => {
        // Given each empty/filled and valid/invalid state of a required text picker.
        const ref = createRef<ComponentRef<typeof View>>();

        // When the form renders the row.
        render(
            <LocaleContextProvider>
                <TextPicker
                    ref={ref}
                    inputID="name"
                    description="Name"
                    value={value}
                    errorText={errorText}
                    rightLabel="Required"
                />
            </LocaleContextProvider>,
        );

        // Then Required is replaced by a value or error, and validation still reaches the focusable host.
        expect(screen.UNSAFE_queryAllByType(MenuItem.RightLabel)).toHaveLength(shouldShowRequired ? 1 : 0);
        expect(screen.UNSAFE_queryAllByType(MenuItem.HelpText)).toHaveLength(errorText ? 1 : 0);
        expect(screen.UNSAFE_getByType(MenuItem.Root).props.ref).toBe(ref);
        expect(typeof ref.current?.focus).toBe('function');
    });

    it('opens TextPicker and commits a changed value through both existing callbacks', () => {
        // Given a text picker with saved content.
        const onInputChange = jest.fn();
        const onValueCommitted = jest.fn();
        render(
            <TextPicker
                inputID="name"
                description="Name"
                value="Old name"
                onInputChange={onInputChange}
                onValueCommitted={onValueCommitted}
            />,
        );

        // When the row is opened and its modal saves an edited value.
        fireEvent.press(screen.getByRole('button', {name: 'Name, Old name'}), {nativeEvent: {}});
        expect(screen.UNSAFE_getByType(TextSelectorModal).props.isVisible).toBe(true);
        act(() => {
            jest.mocked(TextSelectorModal).mock.calls.at(-1)?.[0].onValueSelected?.('New name');
        });

        // Then both the form's live value and commit listener receive the new content.
        expect(onInputChange).toHaveBeenCalledWith('New name');
        expect(onValueCommitted).toHaveBeenCalledWith('New name');
    });

    it('does not open a disabled TextPicker', () => {
        // Given a disabled picker that must not open.
        render(
            <TextPicker
                inputID="name"
                description="Name"
                disabled
            />,
        );

        // When a press is attempted on its root.
        fireEvent.press(screen.UNSAFE_getByType(MenuItem.Root), {nativeEvent: {}});

        // Then the modal stays closed and disabled pickers have no chevron.
        expect(screen.UNSAFE_getByType(TextSelectorModal).props.isVisible).toBe(false);
        expect(screen.UNSAFE_queryAllByType(MenuItem.Chevron)).toHaveLength(0);
    });

    it('preserves multiline metadata typography and row spacing', () => {
        // Given the custom typography used by the SAML metadata picker.
        const titleStyle = {fontFamily: 'monospace'};
        const descriptionTextStyle = {paddingBottom: 4};
        const wrapperStyle = {marginBottom: 12};

        // When the metadata row is rendered with its two-line preview.
        render(
            <TextPicker
                inputID="metadata"
                description="Metadata"
                value="Long metadata"
                titleStyle={titleStyle}
                descriptionTextStyle={descriptionTextStyle}
                wrapperStyle={wrapperStyle}
                numberOfLinesTitle={2}
            />,
        );

        // Then the text leaves and root preserve the caller's appearance overrides.
        expect(screen.getByText('Long metadata')).toHaveStyle(titleStyle);
        expect(screen.getByText('Long metadata').props.numberOfLines).toBe(2);
        expect(screen.getByText('Metadata')).toHaveStyle(descriptionTextStyle);
        expect(screen.UNSAFE_getByType(MenuItem.Root).props.style).toBe(wrapperStyle);
    });
});
