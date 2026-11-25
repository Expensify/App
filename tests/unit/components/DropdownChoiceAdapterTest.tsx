import {act, fireEvent, render, renderHook, screen} from '@testing-library/react-native';

import DropdownChoiceAdapter from '@components/FormDropdownField/DropdownChoiceAdapter';
import type {DropdownChoiceAdapterProps} from '@components/FormDropdownField/DropdownChoiceAdapter';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ValuePickerPopover from '@components/ValuePicker/ValuePickerPopover';
import type {ValuePickerPopoverProps} from '@components/ValuePicker/ValuePickerPopover';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ComponentRef, ComponentType} from 'react';

import React, {createRef} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@components/ValuePicker/ValuePickerPopover', () =>
    jest.fn(({isVisible}: ValuePickerPopoverProps) => {
        const {Text: MockText} = jest.requireActual<{Text: ComponentType<{children: string}>}>('react-native');
        return isVisible ? <MockText>Options list</MockText> : null;
    }),
);
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: false, shouldUseNarrowLayout: false})));
jest.mock('@hooks/useWindowDimensions', () => jest.fn(() => ({windowWidth: 1280, windowHeight: 800})));

const LABEL = 'Account type';
const ITEMS = [
    {value: 'CHECKING', label: 'Checking'},
    {value: 'SAVINGS', label: 'Savings'},
];
const ERROR_TEXT = 'This field is required';

const pressRow = () => fireEvent.press(screen.getByLabelText(LABEL, {exact: false}), {nativeEvent: {}});
const lastPopoverProps = () => jest.mocked(ValuePickerPopover).mock.lastCall?.[0];

describe('DropdownChoiceAdapter', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(ValuePickerPopover).mockClear();
        jest.spyOn<ComponentRef<typeof View>, 'measureInWindow'>(View.prototype, 'measureInWindow').mockImplementation((callback) => callback(16, 100, 300, 60));
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const renderAdapter = (props: Partial<DropdownChoiceAdapterProps> = {}) =>
        render(
            <LocaleContextProvider>
                <DropdownChoiceAdapter
                    items={ITEMS}
                    label={LABEL}
                    title={LABEL}
                    sentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD}
                    backButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_BACK}
                    {...props}
                />
            </LocaleContextProvider>,
        );

    it('shows the picked option in the row and opens the list under it', () => {
        // Given a field that already holds an answer
        renderAdapter({value: 'SAVINGS'});

        // When the user presses the row
        act(() => pressRow());

        // Then the row shows the option's label and the list opens in place
        expect(screen.getByText('Savings')).toBeOnTheScreen();
        expect(screen.getByText('Options list')).toBeOnTheScreen();
    });

    it('commits a newly picked option', () => {
        // Given a field holding one option
        const onInputChange = jest.fn();
        renderAdapter({value: 'CHECKING', onInputChange});
        act(() => pressRow());

        // When the user picks another
        act(() => lastPopoverProps()?.onItemSelected?.({value: 'SAVINGS', text: 'Savings', keyForList: 'SAVINGS'}));

        // Then the form gets the new key
        expect(onInputChange).toHaveBeenCalledWith('SAVINGS');
    });

    it('validates a list closed without a pick, but not one closed by a pick', () => {
        // Given a field with no answer
        const onBlur = jest.fn();
        renderAdapter({onBlur});

        // When the user picks an option, which closes the list
        act(() => pressRow());
        act(() => {
            lastPopoverProps()?.onItemSelected?.({value: 'SAVINGS', text: 'Savings', keyForList: 'SAVINGS'});
            lastPopoverProps()?.onClose();
        });

        // Then the field is not marked touched, so a state the country clears later does not show its required error at once
        expect(onBlur).not.toHaveBeenCalled();

        // When the user opens the list again and dismisses it without a pick
        act(() => pressRow());
        act(() => lastPopoverProps()?.onClose());

        // Then the field is validated, since the user left it without an answer
        expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('clears the input it resets after a new pick', () => {
        // Given an address country whose pick clears the state, since the old state does not belong to the new country
        const onInputChange = jest.fn();
        renderAdapter({value: 'CHECKING', onInputChange, stateInputIDToReset: 'address.state'});
        act(() => pressRow());

        // When the user picks another option
        act(() => lastPopoverProps()?.onItemSelected?.({value: 'SAVINGS', text: 'Savings', keyForList: 'SAVINGS'}));

        // Then the form gets the new key and an empty state
        expect(onInputChange).toHaveBeenNthCalledWith(1, 'SAVINGS');
        expect(onInputChange).toHaveBeenNthCalledWith(2, '', 'address.state');
    });

    it('does not report a change when the option the field already holds is picked again', () => {
        // Given a field holding one option
        const onInputChange = jest.fn();
        renderAdapter({value: 'CHECKING', onInputChange});
        act(() => pressRow());

        // When the user picks that option again
        act(() => lastPopoverProps()?.onItemSelected?.({value: 'CHECKING', text: 'Checking', keyForList: 'CHECKING'}));

        // Then nothing changes, so a field that asks the server for new requirements does not ask again for nothing
        expect(onInputChange).not.toHaveBeenCalled();
    });

    it('keeps a disabled row closed', () => {
        // Given a row disabled while the form waits on the server
        renderAdapter({disabled: true});

        // When the user presses it
        act(() => pressRow());

        // Then no list opens
        expect(screen.queryByText('Options list')).toBeNull();
    });

    it('marks the row red and reads the error with its name', async () => {
        const {result} = renderHook(() => useThemeStyles());

        // Given a field with a validation error
        renderAdapter({errorText: ERROR_TEXT});

        // When the row is read out
        const row = await screen.findByLabelText(ERROR_TEXT, {exact: false});

        // Then the error is part of its name, as it was on the push row, and the border turns red like a text input's
        expect(screen.getByText(ERROR_TEXT)).toBeOnTheScreen();
        expect(row).toHaveStyle(result.current.borderColorDanger);
    });

    it('masks the options of a masked field', () => {
        // Given a field masked in session recordings
        renderAdapter({forwardedFSClass: CONST.FULLSTORY.CLASS.MASK});

        // When the list opens, outside the row's masked view
        act(() => pressRow());

        // Then the list is masked too
        expect(lastPopoverProps()?.forwardedFSClass).toBe(CONST.FULLSTORY.CLASS.MASK);
    });

    it('hands FormProvider the row, so the form can focus it to fix an error', () => {
        // Given a form that keeps a ref to each input
        const ref = createRef<ComponentRef<typeof View>>();

        // When the field renders
        renderAdapter({ref});

        // Then the ref points at the row
        expect(ref.current).not.toBeNull();
    });
});
