import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import FormContext from '@components/Form/FormContext';
import type {FormProviderProps} from '@components/Form/FormProvider';
import FormProvider from '@components/Form/FormProvider';
import type {FormRef, FormWrapperRef} from '@components/Form/types';
import {InputBlurContextProvider, useInputBlurState} from '@components/InputBlurContext';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';

import useIsFocusedRef from '@hooks/useIsFocusedRef';

import * as FormActions from '@libs/actions/FormActions';
import type * as FormActionsModule from '@libs/actions/FormActions';
import * as Browser from '@libs/Browser';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import Visibility from '@libs/Visibility';

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

type MockFormWrapperProps = {
    ref?: React.Ref<FormWrapperRef>;
    children?: React.ReactNode;
    onSubmit: () => void;
    isLoading?: boolean;
    isAlertVisible?: boolean;
    serverErrorFields?: ErrorFields | null;
    serverErrorMessage?: string;
};

const mockScrollTo = jest.fn();
const mockFormWrapper = jest.fn(({children, onSubmit, isLoading, ref}: MockFormWrapperProps) => {
    React.useImperativeHandle(ref, () => ({scrollTo: mockScrollTo, scrollToEnd: jest.fn()}));
    return (
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
    );
});

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

function RegisteredInput({inputID = 'name' as keyof Form}: {inputID?: keyof Form}) {
    const {registerInput} = React.useContext(FormContext);
    const inputProps = registerInput(inputID, false, {});

    return (
        <PressableWithFeedback
            testID={`mock-input-${inputID}`}
            onPress={() => inputProps.onInputChange?.('value', inputID)}
            accessibilityRole="button"
            accessibilityLabel={`Change ${inputID}`}
            sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
        >
            <Text>{`Change ${inputID}`}</Text>
        </PressableWithFeedback>
    );
}

type RegisteredBlurInputRef = {
    blur: () => void;
};

function RegisteredBlurInput({ref}: {ref: React.Ref<RegisteredBlurInputRef>}) {
    const {registerInput} = React.useContext(FormContext);
    const inputBlur = registerInput('name', false, {}).onBlur;
    React.useImperativeHandle(ref, () => ({
        blur: () => {
            if (!inputBlur) {
                return;
            }
            Reflect.apply(inputBlur, undefined, []);
        },
    }));
    return null;
}

function InputBlurStateObserver() {
    const {isBlurred} = useInputBlurState();
    return <Text testID="mock-input-blur-state">{String(isBlurred)}</Text>;
}

function renderBlurForm() {
    const inputRef = React.createRef<RegisteredBlurInputRef>();
    const result = render(
        <InputBlurContextProvider>
            <FormProvider
                formID={FORM_ID}
                submitButtonText="Submit"
                onSubmit={jest.fn()}
            >
                <RegisteredBlurInput ref={inputRef} />
            </FormProvider>
            <InputBlurStateObserver />
        </InputBlurContextProvider>,
    );
    return {...result, blur: () => inputRef.current?.blur()};
}

describe('FormProvider', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(useIsFocusedRef).mockReturnValue({current: true});
        await act(async () => {
            await Onyx.set(FORM_ID, null);
            await Onyx.set(`${FORM_ID}Draft`, null);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it.each([undefined, true, false])('forwards shouldDelayScroll=%s to the form wrapper', async (shouldDelayScroll) => {
        // Given a form with an imperative handle exposed to its caller
        const ref = React.createRef<FormRef>();
        render(
            <FormProvider
                ref={ref}
                formID={FORM_ID}
                submitButtonText="Submit"
                onSubmit={jest.fn()}
            >
                {null}
            </FormProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // When a caller scrolls with or without a keyboard transition delay
        act(() => ref.current?.scrollTo(420, shouldDelayScroll));

        // Then the wrapper receives the caller's timing choice unchanged
        expect(mockScrollTo).toHaveBeenCalledWith(420, shouldDelayScroll);
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

    it('ignores a delayed Safari blur after focus moves to another input', async () => {
        // Given a focused form whose input blur update is deferred until transitions finish
        let applyBlur: (() => void | Promise<void>) | undefined;
        jest.spyOn(Browser, 'isSafari').mockReturnValue(true);
        jest.spyOn(Visibility, 'isVisible').mockReturnValue(false);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the presence of another focused input matters to this test
        jest.spyOn(ComposerFocusManager, 'getActiveInput').mockReturnValue({} as ReturnType<typeof ComposerFocusManager.getActiveInput>);
        jest.spyOn(TransitionTracker, 'runAfterTransitions').mockImplementation(({callback}) => {
            applyBlur = callback;
            return {cancel: jest.fn()};
        });
        const {blur} = renderBlurForm();
        await waitForBatchedUpdatesWithAct();

        // When the old input's delayed callback runs after another input owns focus
        act(() => {
            blur();
            applyBlur?.();
        });

        // Then the shared blur state remains unchanged so the focused input keeps its keyboard-sized layout
        expect(screen.getByTestId('mock-input-blur-state')).toHaveTextContent('false');
    });

    it('ignores a delayed Safari blur after the form screen loses focus', async () => {
        // Given an active form that schedules its Safari blur update before navigation
        const isFocusedRef = {current: true};
        let applyBlur: (() => void | Promise<void>) | undefined;
        jest.mocked(useIsFocusedRef).mockReturnValue(isFocusedRef);
        jest.spyOn(Browser, 'isSafari').mockReturnValue(true);
        jest.spyOn(Visibility, 'isVisible').mockReturnValue(false);
        jest.spyOn(ComposerFocusManager, 'getActiveInput').mockReturnValue(null);
        jest.spyOn(TransitionTracker, 'runAfterTransitions').mockImplementation(({callback}) => {
            applyBlur = callback;
            return {cancel: jest.fn()};
        });
        const {blur} = renderBlurForm();
        await waitForBatchedUpdatesWithAct();

        // When navigation makes that form inactive before its delayed callback runs
        act(() => {
            blur();
            isFocusedRef.current = false;
            applyBlur?.();
        });

        // Then the inactive form cannot alter the shared blur state used by the destination screen
        expect(screen.getByTestId('mock-input-blur-state')).toHaveTextContent('false');
    });

    it('applies a delayed Safari blur when the current screen has no focused input', async () => {
        // Given a focused Safari form with no input taking over focus
        let applyBlur: (() => void | Promise<void>) | undefined;
        jest.spyOn(Browser, 'isSafari').mockReturnValue(true);
        jest.spyOn(Visibility, 'isVisible').mockReturnValue(false);
        jest.spyOn(ComposerFocusManager, 'getActiveInput').mockReturnValue(null);
        jest.spyOn(TransitionTracker, 'runAfterTransitions').mockImplementation(({callback}) => {
            applyBlur = callback;
            return {cancel: jest.fn()};
        });
        const {blur} = renderBlurForm();
        await waitForBatchedUpdatesWithAct();

        // When the input genuinely blurs and the delayed callback runs
        act(() => {
            blur();
            applyBlur?.();
        });

        // Then the original Safari blur behavior is preserved for button and navigation interactions
        expect(screen.getByTestId('mock-input-blur-state')).toHaveTextContent('true');
    });

    it('does not schedule shared blur handling outside Safari', async () => {
        // Given a form running outside Safari
        jest.spyOn(Browser, 'isSafari').mockReturnValue(false);
        jest.spyOn(Visibility, 'isVisible').mockReturnValue(false);
        const runAfterTransitions = jest.spyOn(TransitionTracker, 'runAfterTransitions');
        const {blur} = renderBlurForm();
        await waitForBatchedUpdatesWithAct();

        // When an input blurs
        act(blur);

        // Then the Safari-specific shared state flow remains disabled
        expect(runAfterTransitions).not.toHaveBeenCalled();
        expect(screen.getByTestId('mock-input-blur-state')).toHaveTextContent('false');
    });
});
