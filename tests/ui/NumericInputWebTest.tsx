import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useNumericPressSelection from '@components/NumericEditingController/hooks/useNumericPressSelection/index.web';
import NumericInput from '@components/NumericInput';
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

function renderWithProviders(children: React.ReactNode) {
    return render(<ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>);
}

type WebPressSelectionTestProps = {
    /** Input whose caret the hook reads on press */
    inputRef: {current: BaseTextInputRef | null};

    /** Receives the caret offsets read on press */
    handleSelectionChange: (selectionStart: number, selectionEnd: number) => void;

    /** Caller press handler */
    onPress: BaseTextInputProps['onPress'];
};

function WebPressSelectionTest({inputRef, handleSelectionChange, onPress}: WebPressSelectionTestProps) {
    const handlePress = useNumericPressSelection({inputRef, handleSelectionChange, onPress});

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

/** Renders the press-selection hook against an `inputRef` holding the given element. */
function renderPressSelection(inputRef: {current: BaseTextInputRef | null}, onPress: jest.Mock, handleSelectionChange: jest.Mock) {
    renderWithProviders(
        <WebPressSelectionTest
            inputRef={inputRef}
            handleSelectionChange={handleSelectionChange}
            onPress={onPress}
        />,
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
});
