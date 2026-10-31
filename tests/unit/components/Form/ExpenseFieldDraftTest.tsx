import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import FormContext from '@components/Form/FormContext';
import type {FormProviderProps} from '@components/Form/FormProvider';
import FormProvider from '@components/Form/FormProvider';

import useExpenseFieldDraft from '@hooks/useExpenseFieldDraft';

import ONYXKEYS from '@src/ONYXKEYS';
import DESCRIPTION_INPUT_IDS from '@src/types/form/MoneyRequestDescriptionForm';
import MERCHANT_INPUT_IDS from '@src/types/form/MoneyRequestMerchantForm';

import type {ReactNode} from 'react';
import type * as ReactNative from 'react-native';

import React, {useContext} from 'react';
import {TextInput} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Form/FormWrapper', () => {
    const {Button, View} = jest.requireActual<typeof ReactNative>('react-native');
    return {
        __esModule: true,
        default: ({children, onSubmit}: {children: ReactNode; onSubmit: () => void}) => (
            <View>
                {children}
                <Button
                    title="Save"
                    testID="save-draft"
                    onPress={onSubmit}
                />
            </View>
        ),
    };
});
jest.mock('@hooks/useIsFocusedRef', () => jest.fn(() => ({current: true})));

type ExpenseFormID = typeof ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM | typeof ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM;
type ExpenseInputID = typeof MERCHANT_INPUT_IDS.MONEY_REQUEST_MERCHANT | typeof DESCRIPTION_INPUT_IDS.MONEY_REQUEST_COMMENT;

type RegisteredFieldProps = {
    inputID: ExpenseInputID;
    value: string;
    updateDraft: (value: string) => void;
};

function RegisteredField({inputID, value, updateDraft}: RegisteredFieldProps) {
    const {registerInput} = useContext(FormContext);
    const input = registerInput(inputID, false, {
        valueType: 'string',
        value,
        onValueChange: (nextValue) => {
            if (typeof nextValue !== 'string') {
                return;
            }
            updateDraft(nextValue);
        },
    });
    return (
        <TextInput
            testID="expense-field"
            value={String(input.value ?? '')}
            onChangeText={(text) => input.onInputChange?.(text, inputID)}
        />
    );
}

type ExpenseEditorProps = {
    formID: ExpenseFormID;
    inputID: ExpenseInputID;
    transactionID: string;
    storedValue: string;
    shouldShowForm: boolean;
    onSubmit: FormProviderProps<ExpenseFormID>['onSubmit'];
};

function ExpenseEditor({formID, inputID, transactionID, storedValue, shouldShowForm, onSubmit}: ExpenseEditorProps) {
    const [value, updateDraft] = useExpenseFieldDraft(transactionID, storedValue);
    // StepScreenWrapper removes the nested form when it temporarily renders Not Here.
    if (!shouldShowForm) {
        return null;
    }
    return (
        <FormProvider
            formID={formID}
            onSubmit={onSubmit}
            validate={() => ({})}
            submitButtonText="Save"
            enabledWhenOffline
            shouldShowLoadingImmediatelyOnPress={false}
        >
            <RegisteredField
                inputID={inputID}
                value={value}
                updateDraft={updateDraft}
            />
        </FormProvider>
    );
}

describe('expense field drafts during reconciliation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        {field: 'Merchant', formID: ONYXKEYS.FORMS.MONEY_REQUEST_MERCHANT_FORM, inputID: MERCHANT_INPUT_IDS.MONEY_REQUEST_MERCHANT},
        {field: 'Description', formID: ONYXKEYS.FORMS.MONEY_REQUEST_DESCRIPTION_FORM, inputID: DESCRIPTION_INPUT_IDS.MONEY_REQUEST_COMMENT},
    ])('retains and saves unsaved $field after the nested form remounts', async ({formID, inputID}) => {
        // Given an expense editor with unsaved input before its report/thread finishes synchronizing
        const onSubmit = jest.fn();
        const props = {formID, inputID, transactionID: 'expense-a', storedValue: '', shouldShowForm: true, onSubmit};
        const {rerender} = render(<ExpenseEditor {...props} />);
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByTestId('expense-field'), 'Unsaved edit');

        // When reconciliation briefly removes the form, and the scan changes the persisted field
        rerender(
            <ExpenseEditor
                {...props}
                shouldShowForm={false}
                storedValue="Scanned value"
            />,
        );
        expect(screen.queryByTestId('expense-field')).toBeNull();
        rerender(
            <ExpenseEditor
                {...props}
                storedValue="Scanned value"
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the remounted form restores the user's text and submits it, not the scan value or an empty string
        expect(screen.getByTestId('expense-field')).toHaveProp('value', 'Unsaved edit');
        fireEvent.press(screen.getByTestId('save-draft'));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({[inputID]: 'Unsaved edit'}));
    });
});
