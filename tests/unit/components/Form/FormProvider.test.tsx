import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import FormContext from '@components/Form/FormContext';
import type {FormProviderProps} from '@components/Form/FormProvider';
import FormProvider from '@components/Form/FormProvider';
import type {FormRef, FormWrapperRef} from '@components/Form/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';

import * as FormActions from '@libs/actions/FormActions';
import type * as FormActionsModule from '@libs/actions/FormActions';
import {setHasRadio} from '@libs/NetworkState';

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

describe('FormProvider', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
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

    describe('onSubmitWhenOffline', () => {
        afterEach(() => {
            act(() => setHasRadio(true));
        });

        function renderOfflineForm(validate: FormProviderProps<typeof FORM_ID>['validate']) {
            const onSubmit = jest.fn();
            const onSubmitWhenOffline = jest.fn<void, [() => void, unknown]>();
            render(
                <FormProvider
                    formID={FORM_ID as FormProviderProps<typeof FORM_ID>['formID']}
                    submitButtonText="Submit"
                    validate={validate}
                    onSubmit={onSubmit}
                    onSubmitWhenOffline={onSubmitWhenOffline}
                >
                    <RegisteredInput />
                </FormProvider>,
            );
            return {onSubmit, onSubmitWhenOffline};
        }

        it('shows the errors of an invalid form offline instead of handing the press over', async () => {
            // Given an offline device on a form whose field fails its check, and a handler that would explain the connection
            act(() => setHasRadio(false));
            const {onSubmit, onSubmitWhenOffline} = renderOfflineForm(() => ({name: 'Required'}));
            await waitForBatchedUpdatesWithAct();

            // When the user presses submit
            fireEvent.press(screen.getByTestId('mock-submit-button'));
            await waitForBatchedUpdatesWithAct();

            // Then neither the handler nor the submit runs, since the check needs no connection and the user can fix the field now
            expect(onSubmitWhenOffline).not.toHaveBeenCalled();
            expect(onSubmit).not.toHaveBeenCalled();
        });

        it('hands a valid form offline to the handler, with a retry and the values, instead of submitting', async () => {
            // Given an offline device on a form that passes its checks
            act(() => setHasRadio(false));
            const {onSubmit, onSubmitWhenOffline} = renderOfflineForm(() => ({}));
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByTestId('mock-input-name'));

            // When the user presses submit
            fireEvent.press(screen.getByTestId('mock-submit-button'));
            await waitForBatchedUpdatesWithAct();

            // Then the handler gets a retry and the checked values, and nothing is submitted while offline
            expect(onSubmitWhenOffline).toHaveBeenCalledTimes(1);
            expect(onSubmitWhenOffline).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({name: 'value'}));
            expect(onSubmit).not.toHaveBeenCalled();
        });

        it('submits through the retry once the connection is back', async () => {
            // Given a valid form whose offline press was handed to the handler
            act(() => setHasRadio(false));
            const {onSubmit, onSubmitWhenOffline} = renderOfflineForm(() => ({}));
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByTestId('mock-submit-button'));
            await waitForBatchedUpdatesWithAct();
            const retry = onSubmitWhenOffline.mock.lastCall?.[0];

            // When the connection returns and the handler retries right away, within the press debounce
            act(() => setHasRadio(true));
            act(() => retry?.());
            await waitForBatchedUpdatesWithAct();

            // Then the form submits once, as a press online does
            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmitWhenOffline).toHaveBeenCalledTimes(1);
        });
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
