import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import type {NumericEditingRef} from '@components/NumericEditingController';
import NumericInput from '@components/NumericInput';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import CONST from '@src/CONST';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

type NumericInputProps = React.ComponentProps<typeof NumericInput>;

const INPUT_TEST_ID = 'numeric-text-input';
const CONTAINER_TEST_ID = 'numeric-input-container';
const SYMBOL_ACCESSIBILITY_LABEL = 'Select a symbol or currency';

function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

/** Builds the mouse event the web container handler expects, with `target.id` set to the pressed view's id. */
function getMouseDownEvent(targetId: string) {
    const target = document.createElement('div');
    target.id = targetId;

    return {nativeEvent: {target}, preventDefault: jest.fn()};
}

function getContainerViewId(testID: string) {
    const container = screen.getByTestId(testID);
    if (typeof container.props.id !== 'string') {
        throw new Error(`Numeric input container id was not assigned for ${testID}`);
    }

    return container.props.id;
}

describe('NumericInput', () => {
    const onInputChange = jest.fn();

    const renderNumericInput = (props: Partial<NumericInputProps> = {}, children?: React.ReactNode) =>
        renderWithProviders(
            <NumericInput
                onInputChange={onInputChange}
                decimals={2}
                {...props}
            >
                {children ?? (
                    <>
                        <NumericInput.Symbol>$</NumericInput.Symbol>
                        <NumericInput.TextInput testID={INPUT_TEST_ID} />
                    </>
                )}
            </NumericInput>,
        );

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('symbol primitive', () => {
        it('renders its children as the symbol beside the input', () => {
            renderNumericInput({value: '12'}, <NumericInput.Symbol>km</NumericInput.Symbol>);

            expect(screen.getByText('km')).toBeOnTheScreen();
        });

        it('renders no button when the symbol is not pressable', () => {
            renderNumericInput({value: '12'}, <NumericInput.Symbol>$</NumericInput.Symbol>);

            expect(screen.getByText('$')).toBeOnTheScreen();
            expect(screen.queryAllByRole(CONST.ROLE.BUTTON, {name: SYMBOL_ACCESSIBILITY_LABEL})).toHaveLength(0);
        });

        it('calls onSymbolButtonPress when the pressable symbol is pressed', () => {
            const onSymbolButtonPress = jest.fn();
            renderNumericInput(
                {value: '12'},
                <NumericInput.Symbol
                    isSymbolPressable
                    onSymbolButtonPress={onSymbolButtonPress}
                >
                    $
                </NumericInput.Symbol>,
            );

            fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: SYMBOL_ACCESSIBILITY_LABEL}));

            expect(onSymbolButtonPress).toHaveBeenCalledTimes(1);
        });
    });

    describe('container primitive', () => {
        const renderContainerComposition = (inputRef?: React.Ref<BaseTextInputRef>) =>
            renderNumericInput(
                {value: '12'},
                <NumericInput.Container testID={CONTAINER_TEST_ID}>
                    <NumericInput.TextInput
                        testID={INPUT_TEST_ID}
                        ref={inputRef}
                    />
                    <NumericInput.Symbol>%</NumericInput.Symbol>
                </NumericInput.Container>,
            );

        it('focuses the input and collapses the selection when its own empty area is pressed', () => {
            // Given a container composition with a range selection on the input
            const inputRef = React.createRef<BaseTextInputRef>();
            renderContainerComposition(inputRef);

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {
                nativeEvent: {selection: {start: 0, end: 2}},
            });
            expect(input.props.selection).toEqual({start: 0, end: 2});

            const inputElement = inputRef.current;
            if (!inputElement) {
                throw new Error('Numeric input ref was not assigned');
            }
            const focus = jest.spyOn(inputElement, 'focus');

            // When the container's own empty area is pressed
            const event = getMouseDownEvent(getContainerViewId(CONTAINER_TEST_ID));
            fireEvent(screen.getByTestId(CONTAINER_TEST_ID), 'mouseDown', event);

            // Then the browser blur is prevented, the input is focused, and the selection collapses onto its end
            expect(event.preventDefault).toHaveBeenCalledTimes(1);
            expect(focus).toHaveBeenCalledTimes(1);
            expect(input.props.selection).toEqual({start: 2, end: 2});
            focus.mockRestore();
        });

        it('ignores a press that originates from a nested view instead of its own empty area', () => {
            // Given a container composition with a range selection on the input
            const inputRef = React.createRef<BaseTextInputRef>();
            renderContainerComposition(inputRef);

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {
                nativeEvent: {selection: {start: 0, end: 2}},
            });

            const inputElement = inputRef.current;
            if (!inputElement) {
                throw new Error('Numeric input ref was not assigned');
            }
            const focus = jest.spyOn(inputElement, 'focus');

            // When the press bubbles up from a nested view, which owns the caret placement itself
            const event = getMouseDownEvent('some-nested-view-id');
            fireEvent(screen.getByTestId(CONTAINER_TEST_ID), 'mouseDown', event);

            // Then the container leaves the press and the selection alone
            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(focus).not.toHaveBeenCalled();
            expect(input.props.selection).toEqual({start: 0, end: 2});
            focus.mockRestore();
        });

        it('assigns a distinct target id to each mounted container', () => {
            renderWithProviders(
                <>
                    <NumericInput
                        onInputChange={onInputChange}
                        value="12"
                    >
                        <NumericInput.Container testID={`${CONTAINER_TEST_ID}-one`}>
                            <NumericInput.TextInput />
                        </NumericInput.Container>
                    </NumericInput>
                    <NumericInput
                        onInputChange={onInputChange}
                        value="34"
                    >
                        <NumericInput.Container testID={`${CONTAINER_TEST_ID}-two`}>
                            <NumericInput.TextInput />
                        </NumericInput.Container>
                    </NumericInput>
                </>,
            );

            expect(getContainerViewId(`${CONTAINER_TEST_ID}-one`)).not.toBe(getContainerViewId(`${CONTAINER_TEST_ID}-two`));
        });
    });

    describe('text input primitive', () => {
        it('commits a valid edit through the root and displays it', () => {
            // Given a composition with two accepted decimal places and value "12"
            renderNumericInput({value: '12'});

            // When the user appends a decimal fraction
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '12.5');

            // Then the root is notified and the input displays the committed value
            expect(onInputChange).toHaveBeenLastCalledWith('12.5');
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12.5');
        });

        it('moves the caret to the end of the value after an edit', () => {
            // Given a composition with value "12" and the caret at the end
            renderNumericInput({value: '12'});

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {
                nativeEvent: {selection: {start: 2, end: 2}},
            });

            // When a digit is appended
            fireEvent.changeText(input, '123');

            // Then the caret follows the appended digit
            expect(input.props.selection).toEqual({start: 3, end: 3});
        });

        it('normalizes spaces and comma separators before committing', () => {
            // Given an empty composition with two accepted decimal places
            renderNumericInput({value: ''});

            // When a value with spaces and a comma separator is pasted
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '1 2,5');

            // Then the canonical value is committed
            expect(onInputChange).toHaveBeenLastCalledWith('12.5');
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12.5');
        });

        it('rejects an edit that exceeds the accepted number of decimals', () => {
            // Given a composition with two accepted decimal places and value "1.23"
            renderNumericInput({value: '1.23'});

            // When the user types a third decimal place
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '1.234');

            // Then the edit is rejected and the displayed value is unchanged
            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('1.23');
        });

        it('rejects an edit with more integer digits than the root maxLength allows', () => {
            // Given a composition limited to two integer digits and value "12"
            renderNumericInput({value: '12', maxLength: 2});

            // When the user types a third integer digit
            fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '123');

            // Then the edit is rejected and the displayed value is unchanged
            expect(onInputChange).not.toHaveBeenCalled();
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('12');
        });
    });

    describe('root imperative API', () => {
        it('reads and replaces the value without notifying onInputChange', () => {
            // Given a composition holding value "12" and a root ref
            const numericInputRef = React.createRef<NumericEditingRef>();
            renderNumericInput({value: '12', numericInputRef});

            expect(numericInputRef.current?.getNumber()).toBe('12');

            // When the value is replaced imperatively
            act(() => {
                numericInputRef.current?.updateNumber('7.5');
            });

            // Then the new value is displayed with the caret at its end, and the root is not notified
            expect(numericInputRef.current?.getNumber()).toBe('7.5');
            expect(screen.getByTestId(INPUT_TEST_ID)).toHaveDisplayValue('7.5');
            expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 3, end: 3});
            expect(onInputChange).not.toHaveBeenCalled();
        });

        it('collapses the selection onto its end when clearSelection is called', () => {
            // Given a composition with a range selection on the input
            const numericInputRef = React.createRef<NumericEditingRef>();
            renderNumericInput({value: '1234', numericInputRef});

            const input = screen.getByTestId(INPUT_TEST_ID);
            fireEvent(input, 'selectionChange', {
                nativeEvent: {selection: {start: 1, end: 3}},
            });
            expect(input.props.selection).toEqual({start: 1, end: 3});

            // When the selection is cleared imperatively
            act(() => {
                numericInputRef.current?.clearSelection();
            });

            // Then the selection collapses onto its end
            expect(input.props.selection).toEqual({start: 3, end: 3});
        });
    });
});
