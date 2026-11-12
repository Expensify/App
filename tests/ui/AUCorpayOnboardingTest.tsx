import {act, render, screen, waitFor} from '@testing-library/react-native';

import CheckboxWithLabel from '@components/CheckboxWithLabel';
import type {CheckboxWithLabelProps} from '@components/CheckboxWithLabel';
import DatePicker from '@components/DatePicker';
import FormWrapper from '@components/Form/FormWrapper';
import PushRowWithModal from '@components/PushRowWithModal';
import TextInput from '@components/TextInput';

import OwnerDeclarations from '@pages/ReimbursementAccount/NonUSD/BeneficialOwnerInfo/OwnerDeclarations';
import AUPaymentsAndFunding from '@pages/ReimbursementAccount/NonUSD/BusinessInfo/subSteps/AUPaymentsAndFunding';
import AURegistration from '@pages/ReimbursementAccount/NonUSD/BusinessInfo/subSteps/AURegistration';
import BusinessActivities from '@pages/ReimbursementAccount/NonUSD/BusinessInfo/subSteps/BusinessActivities';
import {BUSINESS_ACTIVITY_FIELDS, getBusinessActivityAnswers} from '@pages/ReimbursementAccount/NonUSD/utils/getBusinessActivityAnswers';

import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/Form/FormWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/CheckboxWithLabel', () => {
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return jest.fn(({label}: CheckboxWithLabelProps) => <View testID={`checkbox-${label}`} />);
});
jest.mock('@components/DatePicker', () => jest.fn(() => null));
jest.mock('@components/PushRowWithModal', () => jest.fn(() => null));
jest.mock('@components/TextInput', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, preferredLocale: 'en'}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useIsFocusedRef', () => () => ({current: true}));
jest.mock('@src/utils/keyboard', () => ({__esModule: true, default: {dismiss: () => Promise.resolve()}}));

const {NUMBER_OF_MONTHLY_TRANSACTION} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const stepProps = {onNext: jest.fn(), onMove: jest.fn(), isEditing: false};

describe('AU Corpay onboarding', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {});
    });

    it('saves all nine unchecked activities as explicit negative answers', async () => {
        // Given a business that does not perform any listed activity.
        render(<BusinessActivities {...stepProps} />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getAllByTestId(/^checkbox-/)).toHaveLength(9);

        // When the user continues without ticking any checkbox.
        act(() => jest.mocked(FormWrapper).mock.lastCall?.[0].onSubmit());
        await waitFor(() => expect(stepProps.onNext).toHaveBeenCalled());

        // Then the draft and final payload include false for every activity, rather than omitting untouched answers.
        const draft = await Onyx.get(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
        const answers = getBusinessActivityAnswers(draft, undefined);
        expect(Object.keys(answers)).toHaveLength(9);
        expect(Object.values(answers)).toEqual(Array.from({length: 9}, () => false));
    });

    it('resumes string-backed draft checkboxes and saves edits only when confirmed', async () => {
        // Given a saved positive answer and a draft negative answer for the same activity.
        const {inputID, label} = BUSINESS_ACTIVITY_FIELDS[0];
        await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {corpay: {[inputID]: true}}});
        await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {[inputID]: 'false'});
        render(
            <BusinessActivities
                {...stepProps}
                isEditing
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // When the user ticks the resumed checkbox while editing.
        const checkbox = jest.mocked(CheckboxWithLabel).mock.calls.findLast(([props]) => props.label === label)?.[0];
        expect(checkbox?.value).toBe(false);
        act(() => checkbox?.onInputChange?.(true));

        // Then the existing draft is untouched until Confirm, which persists the new string-backed answer.
        expect((await Onyx.get(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT))?.[inputID]).toBe('false');
        act(() => jest.mocked(FormWrapper).mock.lastCall?.[0].onSubmit());
        await waitFor(() => expect(stepProps.onNext).toHaveBeenCalled());
        expect((await Onyx.get(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT))?.[inputID]).toBe('true');
    });

    it('saves an unanswered draft activity as false when its checkbox is left unchecked', async () => {
        // Given a resumed application whose draft has an empty answer instead of a missing key.
        const {inputID} = BUSINESS_ACTIVITY_FIELDS[0];
        await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {[inputID]: ''});
        render(<BusinessActivities {...stepProps} />);
        await waitForBatchedUpdatesWithAct();

        // When the user accepts the unchecked activities without toggling them.
        act(() => jest.mocked(FormWrapper).mock.lastCall?.[0].onSubmit());
        await waitFor(() => expect(stepProps.onNext).toHaveBeenCalled());

        // Then the empty answer becomes an explicit false, matching the visible checkbox and backend requirements.
        const draft = await Onyx.get(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
        const answers = getBusinessActivityAnswers(draft, undefined);
        expect(answers[inputID]).toBe(false);
        expect(Object.keys(answers)).toHaveLength(9);
    });

    it('keeps the registration name label active and aligns the date field with the form', async () => {
        // Given the AU registration step with empty fields.
        render(<AURegistration {...stepProps} />);
        await waitForBatchedUpdatesWithAct();

        // When the form renders its registered name and incorporation date.
        const name = jest.mocked(TextInput).mock.lastCall?.[0];
        const date = jest.mocked(DatePicker).mock.lastCall?.[0];

        // Then the empty name still has a label, and the date has explicit spacing inside the shared horizontal inset.
        expect(name?.forceActiveLabel).toBe(true);
        expect(name?.label).toBe('businessInfoStep.registeredTradeName');
        expect(date?.wrapperStyle).toEqual(expect.objectContaining({marginTop: 20}));
        expect(jest.mocked(FormWrapper).mock.lastCall?.[0].style).toContainEqual(expect.objectContaining({marginHorizontal: 20}));
    });

    it('puts the labeled monthly transaction input before payment pickers', async () => {
        // Given the three Corpay payment picklists.
        await Onyx.set(ONYXKEYS.CORPAY_ONBOARDING_FIELDS, {
            company: [],
            beneficialOwnerFields: [],
            companyDirectorFields: [],
            director: [],
            owner: [],
            picklists: {
                SourceOfFunds: [{id: 'Business', name: 'Business', stringValue: 'Business'}],
                ExpectedFrequencyOfTransactions: [{id: 'Monthly', name: 'Monthly', stringValue: 'Monthly'}],
                ClientIntendsToUseCorpayAccountTo: [{id: 'Both', name: 'Both', stringValue: 'Both'}],
            },
        });

        // When the payment form renders.
        render(<AUPaymentsAndFunding {...stepProps} />);
        await waitForBatchedUpdatesWithAct();

        // Then the number field retains its visible label and precedes the source-of-funds row.
        const input = jest.mocked(TextInput).mock.lastCall?.[0];
        expect(input?.inputID).toBe(NUMBER_OF_MONTHLY_TRANSACTION);
        expect(input?.forceActiveLabel).toBe(true);
        expect(jest.mocked(TextInput).mock.invocationCallOrder[0]).toBeLessThan(jest.mocked(PushRowWithModal).mock.invocationCallOrder[0] ?? 0);
    });

    it('shows the full PEP question and makes both yes/no pickers non-searchable', async () => {
        // Given the owner declaration form.
        render(<OwnerDeclarations onSubmit={jest.fn()} />);
        await waitForBatchedUpdatesWithAct();

        // When both owner questions render.
        const rows = jest.mocked(PushRowWithModal).mock.calls.map(([props]) => props);
        const pep = rows.findLast((props) => props.description === 'ownershipInfoStep.isPoliticallyExposed');

        // Then the long PEP question wraps, and neither two-option picker requests search.
        expect(pep?.numberOfLinesDescription).toBe(0);
        expect(rows.every((props) => props.searchInputTitle === undefined)).toBe(true);
    });
});
