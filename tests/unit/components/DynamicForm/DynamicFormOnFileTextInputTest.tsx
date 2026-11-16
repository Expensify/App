import {fireEvent, render, screen} from '@testing-library/react-native';

import DynamicFormOnFileTextInput, {ON_FILE_MASK} from '@components/DynamicForm/components/DynamicFormOnFileTextInput';

import CONST from '@src/CONST';

import React from 'react';

type CapturedInputProps = {
    inputID: string;
    autoFocus?: boolean;
    defaultValue?: unknown;
};

const mockInputWrapper = jest.fn((props: CapturedInputProps) => props.inputID);

jest.mock('@components/Form/InputWrapper', () => ({
    __esModule: true,
    default: (props: CapturedInputProps) => mockInputWrapper(props),
}));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

function renderInput(defaultValue?: string) {
    mockInputWrapper.mockClear();
    render(
        <DynamicFormOnFileTextInput
            inputID="ssn"
            label="SSN"
            shouldSaveDraft={false}
            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
            defaultValue={defaultValue}
        />,
    );
}

describe('DynamicFormOnFileTextInput', () => {
    it('shows the answer the server holds as a mask the user cannot type into', () => {
        // Given an SSN the server holds, which it never sends back
        // When its input renders
        renderInput();

        // Then the mask shows as read-only text with a clear button, since a saved SSN is replaced, never edited
        expect(screen.getByDisplayValue(ON_FILE_MASK).props.readOnly).toBe(true);
        expect(screen.getByLabelText('common.clear')).toBeOnTheScreen();

        // And screen readers hear that the answer is on file rather than a row of dots
        expect(screen.getByLabelText('SSN').props.accessibilityHint).toBe('dynamicForm.onFile');

        // And the mask is not a form input, so a page saved with it sends no SSN and the server keeps the one it holds
        expect(mockInputWrapper).not.toHaveBeenCalled();
    });

    it('asks for a new answer once the user clears the mask', () => {
        // Given an SSN on file shown as a mask
        renderInput();

        // When the user presses the clear button
        fireEvent.press(screen.getByLabelText('common.clear'));

        // Then the mask gives way to an empty form input, focused for the new SSN
        expect(screen.queryByDisplayValue(ON_FILE_MASK)).toBeNull();
        const input = mockInputWrapper.mock.lastCall?.[0];
        expect(input?.inputID).toBe('ssn');
        expect(input?.autoFocus).toBe(true);
        expect(input?.defaultValue).toBeUndefined();
    });

    it('shows an SSN typed on this visit instead of the mask', () => {
        // Given an SSN the user already replaced on this visit, kept in memory
        // When the user comes back to its page
        renderInput('123456789');

        // Then the new SSN is in the input to edit as usual, not hidden behind the mask
        expect(screen.queryByDisplayValue(ON_FILE_MASK)).toBeNull();
        expect(mockInputWrapper.mock.lastCall?.[0].defaultValue).toBe('123456789');
        expect(mockInputWrapper.mock.lastCall?.[0].autoFocus).toBe(false);
    });
});
