import {render} from '@testing-library/react-native';

import FormContext from '@components/Form/FormContext';
import type {RegisterInput} from '@components/Form/FormContext';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';

import type {SubmitBehavior} from 'react-native';

import React from 'react';

// Replace TextInput with a lightweight stand-in. Because InputWrapper builds its `textInputBasedComponents`
// Set from the same `@components/TextInput` module reference, the mock is treated as a text-based input by
// identity - which is exactly the branch we want to exercise - while rendering to nothing.
jest.mock('@components/TextInput', () => {
    function MockTextInput() {
        return null;
    }
    return {__esModule: true, default: MockTextInput};
});

jest.mock('@libs/DeviceCapabilities', () => ({
    __esModule: true,
    canUseTouchScreen: jest.fn(),
    hasHoverSupport: jest.fn(),
}));

const mockCanUseTouchScreen = jest.mocked(canUseTouchScreen);

type RegistrationInput = {
    autoGrowSingleLine?: boolean;
    autoGrowHeight?: boolean;
    multiline?: boolean;
    shouldSubmitForm?: boolean;
    submitBehavior?: SubmitBehavior;
};

type RegistrationResult = {
    /** The `shouldSubmitForm` value InputWrapper computed and passed to `registerInput` */
    shouldSubmitForm?: boolean;

    /** The `submitBehavior` InputWrapper resolved for the input */
    submitBehavior?: SubmitBehavior;
};

/**
 * Render InputWrapper with a spied `registerInput` and return the params it computed.
 * `registerInput` receives (inputID, shouldSubmitForm, inputProps), so we read the computed
 * `shouldSubmitForm` and the resolved `submitBehavior` straight off the recorded call.
 */
function renderAndCaptureRegistration({autoGrowSingleLine, autoGrowHeight, multiline, shouldSubmitForm, submitBehavior}: RegistrationInput): RegistrationResult {
    const registerInput: jest.MockedFunction<RegisterInput> = jest.fn((_inputID, _shouldSubmitForm, inputProps) => inputProps);
    const contextValue = {
        registerInput,
        getErrorAnnouncementKey: () => 0,
        getFallbackAnnouncementMessage: () => '',
    };

    render(
        <FormContext.Provider value={contextValue}>
            <InputWrapper
                InputComponent={TextInput}
                inputID="testInput"
                autoGrowSingleLine={autoGrowSingleLine}
                autoGrowHeight={autoGrowHeight}
                multiline={multiline}
                shouldSubmitForm={shouldSubmitForm}
                submitBehavior={submitBehavior}
            />
        </FormContext.Provider>,
    );

    const call = registerInput.mock.calls.at(0);
    return {shouldSubmitForm: call?.[1], submitBehavior: call?.[2]?.submitBehavior};
}

describe('InputWrapper - shouldReallySubmitForm', () => {
    afterEach(() => {
        mockCanUseTouchScreen.mockReset();
    });

    describe('autoGrowSingleLine text input', () => {
        it('always submits the form and blurs, even on a touch device with no hardware keyboard', () => {
            mockCanUseTouchScreen.mockReturnValue(true);

            const {shouldSubmitForm, submitBehavior} = renderAndCaptureRegistration({autoGrowSingleLine: true});

            expect(shouldSubmitForm).toBe(true);
            expect(submitBehavior).toBe('blurAndSubmit');
        });

        it('always submits the form when a hardware keyboard is available', () => {
            mockCanUseTouchScreen.mockReturnValue(false);

            const {shouldSubmitForm, submitBehavior} = renderAndCaptureRegistration({autoGrowSingleLine: true});

            expect(shouldSubmitForm).toBe(true);
            expect(submitBehavior).toBe('blurAndSubmit');
        });

        it('ignores an explicit shouldSubmitForm=false and still submits', () => {
            mockCanUseTouchScreen.mockReturnValue(true);

            const {shouldSubmitForm} = renderAndCaptureRegistration({autoGrowSingleLine: true, shouldSubmitForm: false});

            expect(shouldSubmitForm).toBe(true);
        });
    });

    describe('plain single-line text input', () => {
        it('force-enables submission and forwards the provided submitBehavior', () => {
            mockCanUseTouchScreen.mockReturnValue(true);

            const {shouldSubmitForm, submitBehavior} = renderAndCaptureRegistration({submitBehavior: 'submit'});

            expect(shouldSubmitForm).toBe(true);
            // Not multiline, so submitBehavior is passed through untouched (not overridden to 'blurAndSubmit').
            expect(submitBehavior).toBe('submit');
        });
    });

    describe('multi-line text input', () => {
        it('submits when shouldSubmitForm is requested and a hardware keyboard is available', () => {
            mockCanUseTouchScreen.mockReturnValue(false);

            const {shouldSubmitForm, submitBehavior} = renderAndCaptureRegistration({multiline: true, shouldSubmitForm: true});

            expect(shouldSubmitForm).toBe(true);
            expect(submitBehavior).toBe('blurAndSubmit');
        });

        it('does not submit on a touch device even when shouldSubmitForm is requested', () => {
            mockCanUseTouchScreen.mockReturnValue(true);

            const {shouldSubmitForm} = renderAndCaptureRegistration({multiline: true, shouldSubmitForm: true});

            expect(shouldSubmitForm).toBe(false);
        });

        it('does not submit when shouldSubmitForm is not requested', () => {
            mockCanUseTouchScreen.mockReturnValue(false);

            const {shouldSubmitForm} = renderAndCaptureRegistration({multiline: true, shouldSubmitForm: false});

            expect(shouldSubmitForm).toBe(false);
        });

        it('treats autoGrowHeight as multi-line', () => {
            mockCanUseTouchScreen.mockReturnValue(true);

            const {shouldSubmitForm} = renderAndCaptureRegistration({autoGrowHeight: true, shouldSubmitForm: true});

            // On a touch device with no hardware keyboard, a multi-line input must reserve the return key for new lines.
            expect(shouldSubmitForm).toBe(false);
        });
    });
});
