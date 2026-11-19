import {act, render, renderHook, screen} from '@testing-library/react-native';

import type DatePicker from '@components/DatePicker';
import type {FormProviderProps} from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import PatriotActLink from '@components/PatriotActLink';

import useLocalize from '@hooks/useLocalize';

import * as FormActions from '@userActions/FormActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import DateOfBirthStep from '@src/pages/EnablePayments/Wallet/PersonalInfo/substeps/DateOfBirthStep';
import type {WalletAdditionalDetailsRefactor} from '@src/types/onyx/WalletAdditionalDetails';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockWalletFormProps: FormProviderProps<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> | undefined;

// Keep the real shared DOB validator and submit hooks while avoiding FormProvider input registration and DatePicker interaction.
jest.mock('@components/Form/FormProvider', () => {
    function MockFormProvider(props: FormProviderProps<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>) {
        mockWalletFormProps = props;
        return typeof props.children === 'function' ? null : props.children;
    }
    return MockFormProvider;
});
jest.mock('@components/Form/InputWrapper', () => jest.fn(() => null));
jest.mock('@components/PatriotActLink', () => jest.fn(() => null));
jest.mock('@userActions/FormActions', () => ({
    setDraftValues: jest.fn<ReturnType<typeof FormActions.setDraftValues>, Parameters<typeof FormActions.setDraftValues>>(() => Promise.resolve()),
}));

function renderWalletDOB(isEditing = false, onNext: (data?: unknown) => void = jest.fn()) {
    return render(
        <LocaleContextProvider>
            <DateOfBirthStep
                isEditing={isEditing}
                onNext={onNext}
                onMove={jest.fn()}
            />
        </LocaleContextProvider>,
    );
}

describe('Wallet DateOfBirthStep', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(() => {
        mockWalletFormProps = undefined;
        jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick']});
        jest.setSystemTime(new Date('2026-10-15T12:00:00Z'));
    });
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it.each([false, true])('preserves wallet form and input configuration in editing mode %s', async (isEditing) => {
        // Given the wallet stores a previously supplied date of birth.
        await act(async () => {
            await Onyx.set(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, createMock<WalletAdditionalDetailsRefactor>({dob: '1990-03-14'}));
        });
        // When the actual wallet wrapper and shared DOB component render.
        const {result: localize} = renderHook(() => useLocalize(), {wrapper: LocaleContextProvider});
        renderWalletDOB(isEditing);
        await waitForBatchedUpdatesWithAct();
        // Then the wallet form retains its field, saved default, date limits, and editing-controlled draft behavior.
        expect(mockWalletFormProps).toBeDefined();
        expect(mockWalletFormProps?.formID).toBe(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS);
        expect(mockWalletFormProps?.submitButtonText).toBe(localize.current.translate(isEditing ? 'common.confirm' : 'common.next'));
        expect(screen.getByText(localize.current.translate('personalInfoStep.whatsYourDOB'))).toBeOnTheScreen();
        expect(InputWrapper).toHaveBeenCalled();
        const inputProps = jest.mocked(InputWrapper<typeof DatePicker, 'string'>).mock.calls.at(-1)?.[0];
        expect(inputProps).toBeDefined();
        expect(inputProps?.inputID).toBe('dob');
        expect(inputProps?.defaultValue).toBe('1990-03-14');
        expect(inputProps?.shouldSaveDraft).toBe(!isEditing);
        expect(inputProps?.forwardedFSClass).toBe(CONST.FULLSTORY.CLASS.MASK);
        expect(inputProps?.minDate).toEqual(new Date('1876-10-15T12:00:00Z'));
        expect(inputProps?.maxDate).toEqual(new Date('2008-10-15T12:00:00Z'));
        expect(PatriotActLink).toHaveBeenCalled();
    });

    it('uses an empty default when no wallet DOB is saved', async () => {
        // Given a wallet without saved personal details.
        // When its real DOB step renders.
        renderWalletDOB();
        await waitForBatchedUpdatesWithAct();
        // Then the input starts empty rather than inventing a date.
        expect(InputWrapper).toHaveBeenCalled();
        const inputProps = jest.mocked(InputWrapper<typeof DatePicker, 'string'>).mock.calls.at(-1)?.[0];
        expect(inputProps).toBeDefined();
        expect(inputProps?.defaultValue).toBe('');
    });

    it.each([
        {scenario: 'empty', dob: '', errorKey: 'common.error.fieldRequired'},
        {scenario: 'adult', dob: '1990-03-14', errorKey: undefined},
        {scenario: 'future', dob: '2027-01-01', errorKey: 'bankAccount.error.dob'},
        {scenario: 'invalid', dob: 'not-a-date', errorKey: 'bankAccount.error.dob'},
        {scenario: 'over maximum age', dob: '1870-01-01', errorKey: 'bankAccount.error.dob'},
        {scenario: 'under minimum age', dob: '2015-01-01', errorKey: 'bankAccount.error.age'},
    ] as const)('executes the shared validator for $scenario DOB', async ({dob, errorKey}) => {
        // Given a fixed clock keeps every age branch deterministic.
        const {result: localize} = renderHook(() => useLocalize(), {wrapper: LocaleContextProvider});
        renderWalletDOB();
        await waitForBatchedUpdatesWithAct();
        const formProps = mockWalletFormProps;
        expect(formProps).toBeDefined();
        expect(formProps?.validate).toBeDefined();
        if (!formProps?.validate) {
            throw new Error('The wallet DOB form must supply its shared validator');
        }
        const values = createMock<FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>>({dob});
        // When the validator produced by the real shared component receives wallet form values.
        const errors = formProps.validate(values, localize.current.translate);
        // Then only the DOB field is required and the corresponding age or date branch is preserved.
        expect(errors).toEqual(errorKey ? {dob: localize.current.translate(errorKey)} : {});
    });

    it.each([true, false])('submits through the real wallet hooks in editing mode %s', async (isEditing) => {
        // Given the complete form may contain fields from other wallet steps.
        const onNext = jest.fn<void, [data?: unknown]>();
        const values = createMock<FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>>({dob: '1990-03-14', legalFirstName: 'Unrelated field'});
        renderWalletDOB(isEditing, onNext);
        await waitForBatchedUpdatesWithAct();
        const formProps = mockWalletFormProps;
        expect(formProps).toBeDefined();
        if (!formProps) {
            throw new Error('The wallet DOB form must supply its submit callback');
        }
        // When the component-produced callback runs the actual wallet and shared submit hooks.
        await act(async () => {
            formProps.onSubmit(values);
        });
        // Then editing selects only DOB, while the normal Next flow leaves draft saving to the input framework.
        expect(onNext).toHaveBeenCalledTimes(1);
        if (isEditing) {
            expect(FormActions.setDraftValues).toHaveBeenCalledTimes(1);
            expect(FormActions.setDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS, {dob: values.dob});
            expect(onNext).toHaveBeenCalledWith({dob: values.dob});
        } else {
            expect(FormActions.setDraftValues).not.toHaveBeenCalled();
            expect(onNext).toHaveBeenCalledWith();
        }
    });
});
