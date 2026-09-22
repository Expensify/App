import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericInput from '@components/NumericInput';
import {NumericInputActionsContext, NumericInputStateContext} from '@components/NumericInput/context';
import useNumericPressSelection from '@components/NumericInput/hooks/useNumericPressSelection/index.web';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type ShouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually/types';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

jest.mock('@libs/shouldIgnoreSelectionWhenUpdatedManually', () => ({
    ...jest.requireActual<{default: ShouldIgnoreSelectionWhenUpdatedManually}>('@libs/shouldIgnoreSelectionWhenUpdatedManually'),
    __esModule: true,
    default: false,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

const INPUT_TEST_ID = 'numeric-input-web-test-input';
const PRESSABLE_TEST_ID = 'numeric-input-web-test-pressable';
const CONTAINER_TEST_ID = 'numeric-input-web-test-container';

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

function WebPressSelectionTest({onPress}: {onPress: BaseTextInputProps['onPress']}) {
    const handlePress = useNumericPressSelection(onPress);

    return (
        <TextInput
            accessibilityLabel="Update selection"
            onPress={handlePress}
            testID={PRESSABLE_TEST_ID}
        />
    );
}

/** Builds the root `inputRef`. A real render hands back a test renderer instance, so only an element built here reaches the caret sync. */
function getCaretInputRef(selectionStart: number, selectionEnd: number): {current: BaseTextInputRef | null} {
    const inputElement = document.createElement('input');
    inputElement.value = '12345';
    inputElement.selectionStart = selectionStart;
    inputElement.selectionEnd = selectionEnd;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- partial stub; the caret sync reads only the selection, not the native methods `BaseTextInputRef` intersects in
    return {current: inputElement as BaseTextInputRef};
}

/** Renders the press-selection hook against a root state whose `inputRef` holds the given element. */
function renderPressSelection(inputRef: {current: BaseTextInputRef | null}, onPress: jest.Mock, handleSelectionChange: jest.Mock) {
    renderWithProviders(
        <NumericInputStateContext.Provider
            value={{
                value: '12345',
                formattedNumber: '12345',
                selection: {start: 5, end: 5},
                isNegative: false,
                allowNegative: false,
                inputRef,
            }}
        >
            <NumericInputActionsContext.Provider
                value={{
                    setNumber: jest.fn(),
                    clearSelection: jest.fn(),
                    toggleSign: jest.fn(),
                    clearSign: jest.fn(),
                    handleSelectionChange,
                    handleKeyPress: jest.fn(),
                    focusInput: jest.fn(),
                }}
            >
                <WebPressSelectionTest onPress={onPress} />
            </NumericInputActionsContext.Provider>
        </NumericInputStateContext.Provider>,
    );
}

describe('NumericInput web behavior', () => {
    it('syncs the root selection with the browser caret when pressed', () => {
        const onPress = jest.fn();
        const handleSelectionChange = jest.fn();
        renderPressSelection(getCaretInputRef(2, 4), onPress, handleSelectionChange);

        fireEvent.press(screen.getByTestId(PRESSABLE_TEST_ID));

        expect(handleSelectionChange).toHaveBeenCalledWith(2, 4);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('leaves the root selection alone when the ref does not hold a form element exposing the caret', () => {
        const onPress = jest.fn();
        const handleSelectionChange = jest.fn();

        renderPressSelection({current: null}, onPress, handleSelectionChange);

        fireEvent.press(screen.getByTestId(PRESSABLE_TEST_ID));

        expect(handleSelectionChange).not.toHaveBeenCalled();
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('applies a selection event after a manual value update, because the browser does not echo a stale one', () => {
        renderWithProviders(
            <NumericInput value="12">
                <NumericInput.TextInput testID={INPUT_TEST_ID} />
            </NumericInput>,
        );

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent.changeText(input, '13');
        fireEvent(input, 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});

        expect(input.props.selection).toEqual({start: 0, end: 0});
    });

    describe('container primitive', () => {
        const renderContainerComposition = (inputRef?: React.Ref<BaseTextInputRef>) =>
            renderWithProviders(
                <NumericInput value="12">
                    <NumericInput.Container testID={CONTAINER_TEST_ID}>
                        <NumericInput.TextInput
                            testID={INPUT_TEST_ID}
                            ref={inputRef}
                        />
                        <NumericInput.Symbol>%</NumericInput.Symbol>
                    </NumericInput.Container>
                </NumericInput>,
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

        it('assigns a distinct target id to each mounted container, so a press only refocuses its own input', () => {
            renderWithProviders(
                <>
                    <NumericInput value="12">
                        <NumericInput.Container testID={`${CONTAINER_TEST_ID}-one`}>
                            <NumericInput.TextInput />
                        </NumericInput.Container>
                    </NumericInput>
                    <NumericInput value="34">
                        <NumericInput.Container testID={`${CONTAINER_TEST_ID}-two`}>
                            <NumericInput.TextInput />
                        </NumericInput.Container>
                    </NumericInput>
                </>,
            );

            expect(getContainerViewId(`${CONTAINER_TEST_ID}-one`)).not.toBe(getContainerViewId(`${CONTAINER_TEST_ID}-two`));
        });
    });
});
