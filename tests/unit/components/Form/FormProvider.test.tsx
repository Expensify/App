import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import FormContext from '@components/Form/FormContext';
import type {FormProviderProps} from '@components/Form/FormProvider';
import FormProvider from '@components/Form/FormProvider';
import type {InputComponentBaseProps} from '@components/Form/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';

import * as FormActions from '@libs/actions/FormActions';
import type * as FormActionsModule from '@libs/actions/FormActions';
import {isSafari} from '@libs/Browser';
import type * as BrowserModule from '@libs/Browser';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Form} from '@src/types/form';
import type {ErrorFields} from '@src/types/onyx/OnyxCommon';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

const olderErrorKey = '1719999999999';
const latestErrorKey = '1720000000000';

const mockIsSafari = jest.mocked(isSafari);
const mockGetActiveInput = jest.fn<unknown, []>(() => null);
const mockSetIsBlurred = jest.fn();
const mockCancelBlurTransition = jest.fn();
const mockRunAfterTransitions = jest.fn<{cancel: () => void}, [{callback: () => void}]>(() => ({cancel: mockCancelBlurTransition}));

jest.mock('@libs/Browser', () => ({
    ...jest.requireActual<typeof BrowserModule>('@libs/Browser'),
    isSafari: jest.fn(() => false),
}));
jest.mock('@libs/ComposerFocusManager', () => ({
    __esModule: true,
    default: {getActiveInput: () => mockGetActiveInput()},
}));
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {runAfterTransitions: (options: {callback: () => void}) => mockRunAfterTransitions(options)},
}));
jest.mock('@components/InputBlurContext', () => ({
    useInputBlurActions: () => ({setIsBlurred: mockSetIsBlurred}),
}));

type MockFormWrapperProps = {
    children?: React.ReactNode;
    onSubmit: () => void;
    isLoading?: boolean;
    isAlertVisible?: boolean;
    serverErrorFields?: ErrorFields | null;
    serverErrorMessage?: string;
};

const mockFormWrapper = jest.fn(({children, onSubmit, isLoading}: MockFormWrapperProps) => (
    <View>
        <Text testID="mock-loading-state">{String(isLoading)}</Text>
        <PressableWithFeedback
            testID="mock-submit-button"
            onPress={onSubmit}
            accessibilityRole="button"
            accessibilityLabel="Submit"
            sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
        >
            <Text>Submit</Text>
        </PressableWithFeedback>
        {children}
    </View>
));

jest.mock('@components/Form/FormWrapper', () => ({
    __esModule: true,
    default: (props: MockFormWrapperProps) => mockFormWrapper(props),
}));

jest.mock('@libs/actions/FormActions', () => {
    const actual = jest.requireActual<typeof FormActionsModule>('@libs/actions/FormActions');

    return {
        __esModule: true,
        ...actual,
        clearErrors: jest.fn(actual.clearErrors),
        clearErrorFields: jest.fn(actual.clearErrorFields),
    };
});

jest.mock('@hooks/useIsFocusedRef', () => jest.fn(() => ({current: true})));
jest.mock('@hooks/usePressLoading', () =>
    jest.fn(({isLoading = false}: {isLoading?: boolean} = {}) => ({
        isLoading,
        startWithLoading: async (runAfterPaint: () => void) => {
            runAfterPaint();
        },
    })),
);

jest.mock('@src/utils/keyboard', () => ({
    dismiss: jest.fn(() => Promise.resolve()),
    dismissKeyboardAndExecute: jest.fn((callback: () => void) => callback()),
}));

const FORM_ID = ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM;

// Expose the form's blur handler to fireEvent without converting it to a native Pressable event.
function BlurTarget({children}: React.PropsWithChildren<Pick<InputComponentBaseProps, 'onBlur'>>) {
    return children;
}

function RegisteredInput({inputID = 'name' as keyof Form}: {inputID?: keyof Form}) {
    const {registerInput} = React.useContext(FormContext);
    const inputProps = registerInput(inputID, false, {});

    return (
        <BlurTarget onBlur={inputProps.onBlur}>
            <PressableWithFeedback
                testID={`mock-input-${inputID}`}
                onPress={() => inputProps.onInputChange?.('value', inputID)}
                accessibilityRole="button"
                accessibilityLabel={`Change ${inputID}`}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            >
                <Text>{`Change ${inputID}`}</Text>
            </PressableWithFeedback>
        </BlurTarget>
    );
}

describe('FormProvider', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsSafari.mockReturnValue(false);
        mockGetActiveInput.mockReturnValue(null);
        await act(async () => {
            await Onyx.set(FORM_ID, null);
            await Onyx.set(`${FORM_ID}Draft`, null);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('keeps the keyboard height constraint when an input is focused before the delayed Safari blur runs', async () => {
        // Given Safari delays a field's blur update until transitions finish.
        mockIsSafari.mockReturnValue(true);
        render(
            <FormProvider
                formID={FORM_ID}
                submitButtonText="Submit"
                onSubmit={jest.fn()}
            >
                <RegisteredInput />
            </FormProvider>,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent(screen.UNSAFE_getByType(BlurTarget), 'blur');
        expect(mockRunAfterTransitions).toHaveBeenCalledTimes(1);

        // When text entry resumes before the pending callback, its original blur is no longer current.
        mockGetActiveInput.mockReturnValue({});
        act(() => mockRunAfterTransitions.mock.calls[0]?.[0].callback());

        // Then the screen must not expand behind the still-open keyboard.
        expect(mockGetActiveInput).toHaveBeenCalledTimes(1);
        expect(mockSetIsBlurred).not.toHaveBeenCalled();
    });

    it('preserves the delayed Safari blur update when no text input remains focused', async () => {
        // Given a Safari form still needs its existing blur workaround when text entry ends.
        mockIsSafari.mockReturnValue(true);
        render(
            <FormProvider
                formID={FORM_ID}
                submitButtonText="Submit"
                onSubmit={jest.fn()}
            >
                <RegisteredInput />
            </FormProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the field blurs and no input takes focus before the transition callback.
        fireEvent(screen.UNSAFE_getByType(BlurTarget), 'blur');
        expect(mockSetIsBlurred).not.toHaveBeenCalled();
        act(() => mockRunAfterTransitions.mock.calls[0]?.[0].callback());

        // Then the existing height-release behavior still runs after the transition.
        expect(mockSetIsBlurred).toHaveBeenCalledWith(true);
    });

    it('does not run Safari blur handling on other platforms', async () => {
        // Given non-Safari browsers and native platforms do not use this workaround.
        render(
            <FormProvider
                formID={FORM_ID}
                submitButtonText="Submit"
                onSubmit={jest.fn()}
            >
                <RegisteredInput />
            </FormProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // When an input loses focus on those platforms.
        fireEvent(screen.UNSAFE_getByType(BlurTarget), 'blur');

        // Then their keyboard handling is untouched.
        expect(mockRunAfterTransitions).not.toHaveBeenCalled();
        expect(mockGetActiveInput).not.toHaveBeenCalled();
        expect(mockSetIsBlurred).not.toHaveBeenCalled();
    });

    it('submits once for a valid form and forwards loading state from formState', async () => {
        const onSubmit = jest.fn();

        render(
            <FormProvider
                formID={FORM_ID as FormProviderProps<typeof FORM_ID>['formID']}
                submitButtonText="Submit"
                validate={() => ({})}
                onSubmit={onSubmit}
            >
                {null}
            </FormProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('mock-submit-button'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledTimes(1);
        });

        await act(async () => {
            await Onyx.merge(FORM_ID, {isLoading: true});
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('mock-loading-state')).toHaveTextContent('true');

        fireEvent.press(screen.getByTestId('mock-submit-button'));

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('skips clearing server errors when validation runs without server errors or error fields', async () => {
        render(
            <FormProvider
                formID={FORM_ID as FormProviderProps<typeof FORM_ID>['formID']}
                submitButtonText="Submit"
                validate={() => ({})}
                onSubmit={jest.fn()}
                shouldValidateOnChange
            >
                <RegisteredInput />
            </FormProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('mock-input-name'));

        expect(FormActions.clearErrors).not.toHaveBeenCalled();
        expect(FormActions.clearErrorFields).not.toHaveBeenCalled();
    });

    it('clears server errors and error fields when validation runs and they exist', async () => {
        render(
            <FormProvider
                formID={FORM_ID as FormProviderProps<typeof FORM_ID>['formID']}
                submitButtonText="Submit"
                validate={() => ({})}
                onSubmit={jest.fn()}
                shouldValidateOnChange
            >
                <RegisteredInput />
            </FormProvider>,
        );

        await act(async () => {
            await Onyx.merge(FORM_ID, {
                errors: {[latestErrorKey]: 'Server error'},
                errorFields: {name: {server: 'Server field error'}},
            });
        });
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('mock-input-name'));

        await waitFor(() => {
            expect(FormActions.clearErrors).toHaveBeenCalledWith(FORM_ID);
            expect(FormActions.clearErrorFields).toHaveBeenCalledWith(FORM_ID);
        });
    });

    it('forwards alert visibility, server error fields, and the latest server error message from formState', async () => {
        const serverErrorFields = {name: {server: 'Server field error'}};

        render(
            <FormProvider
                formID={FORM_ID as FormProviderProps<typeof FORM_ID>['formID']}
                submitButtonText="Submit"
                validate={() => ({})}
                onSubmit={jest.fn()}
            >
                {null}
            </FormProvider>,
        );

        await act(async () => {
            await Onyx.merge(FORM_ID, {
                errors: {
                    [olderErrorKey]: 'Older server error',
                    [latestErrorKey]: 'Latest server error',
                },
                errorFields: serverErrorFields,
            });
        });
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            const lastCallProps = mockFormWrapper.mock.calls.at(-1)?.[0];

            expect(lastCallProps?.isAlertVisible).toBe(true);
            expect(lastCallProps?.serverErrorFields).toEqual(serverErrorFields);
            expect(lastCallProps?.serverErrorMessage).toBe('Latest server error');
        });
    });
});
