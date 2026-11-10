import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import FormContext from '@components/Form/FormContext';
import type {FormProviderProps} from '@components/Form/FormProvider';
import FormProvider from '@components/Form/FormProvider';
import type {FormWrapperRef} from '@components/Form/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';

import * as FormActions from '@libs/actions/FormActions';
import type * as FormActionsModule from '@libs/actions/FormActions';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Form} from '@src/types/form';
import type {ErrorFields} from '@src/types/onyx/OnyxCommon';

import type {FocusEvent, Ref} from 'react';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

const olderErrorKey = '1719999999999';
const latestErrorKey = '1720000000000';

type MockFormWrapperProps = {
    children?: React.ReactNode;
    onSubmit: () => void;
    isLoading?: boolean;
    isAlertVisible?: boolean;
    serverErrorFields?: ErrorFields | null;
    serverErrorMessage?: string;
    ref?: Ref<FormWrapperRef>;
};

const mockCancelScrollTo = jest.fn();

function MockFormWrapperContent({children, onSubmit, isLoading, ref}: Pick<MockFormWrapperProps, 'children' | 'onSubmit' | 'isLoading' | 'ref'>) {
    React.useImperativeHandle(ref, () => ({
        scrollToEnd: jest.fn(),
        scrollTo: jest.fn(),
        cancelScrollTo: mockCancelScrollTo,
    }));

    return (
        <View>
            <Text testID="mock-loading-state">{String(isLoading)}</Text>
            <PressableWithFeedback
                testID="mock-submit-button"
                onPress={onSubmit}
                accessibilityRole="button"
                accessibilityLabel="Submit"
            >
                <Text>Submit</Text>
            </PressableWithFeedback>
            {children}
        </View>
    );
}

const mockFormWrapper = jest.fn((props: MockFormWrapperProps) => MockFormWrapperContent(props));

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
        >
            <Text>{`Change ${inputID}`}</Text>
        </PressableWithFeedback>
    );
}

function BlurringInput() {
    const {registerInput} = React.useContext(FormContext);
    const inputProps = registerInput('name', false, {});

    return (
        <PressableWithFeedback
            testID="mock-blur-name"
            // The registered onBlur only reads the event's nativeEvent
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above
            onPress={() => inputProps.onBlur?.({nativeEvent: {}} as FocusEvent)}
            accessibilityRole="button"
            accessibilityLabel="Blur name"
        >
            <Text>Blur name</Text>
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

    it('cancels the keyboard scroll when an input blurs', async () => {
        // Given a form whose input may have asked the wrapper to scroll with the keyboard on focus
        render(
            <FormProvider
                formID={FORM_ID as FormProviderProps<typeof FORM_ID>['formID']}
                submitButtonText="Submit"
                validate={() => ({})}
                onSubmit={jest.fn()}
            >
                <BlurringInput />
            </FormProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the input blurs, for example because the user moves to another input
        fireEvent.press(screen.getByTestId('mock-blur-name'));

        // Then the scroll is cancelled, so it can't pull the content back to the input that blurred
        expect(mockCancelScrollTo).toHaveBeenCalledTimes(1);
    });
});
