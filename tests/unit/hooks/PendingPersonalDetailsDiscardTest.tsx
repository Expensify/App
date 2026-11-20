import {act, renderHook} from '@testing-library/react-native';

import useFlowDiscardChangesConfirmation from '@hooks/useFlowDiscardChangesConfirmation';
import usePersonalBankAccountDiscardConfirmation from '@hooks/usePersonalBankAccountDiscardConfirmation';
import usePrivatePersonalDetailsDiscardConfirmation from '@hooks/usePrivatePersonalDetailsDiscardConfirmation';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useFlowDiscardChangesConfirmation', () => jest.fn(() => ({suppressDiscardPrompt: jest.fn()})));

function isDirty() {
    return jest.mocked(useFlowDiscardChangesConfirmation).mock.lastCall?.[0].getHasUnsavedChanges();
}

describe('Pending private and bank details', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
        await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
            legalFirstName: 'Jane',
            legalLastName: 'Doe',
            addresses: [{street: 'Main St', state: 'California', country: 'US', current: true}],
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('ignores equivalent state names and reverted private edits', async () => {
        // Given a partial draft equivalent to the saved fields
        await Onyx.set(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT, {legalFirstName: 'Jane', state: 'CA'});
        renderHook(() => usePrivatePersonalDetailsDiscardConfirmation());
        await waitForBatchedUpdatesWithAct();
        // When compared with initialized normalized values
        const dirty = isDirty();
        // Then neither partial drafting nor normalization causes a warning
        expect(dirty).toBe(false);
    });

    it('protects private edits after failed verification until confirmed abandonment', async () => {
        // Given unsaved details handed off to verification
        await Onyx.set(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT, {legalFirstName: 'Edited'});
        renderHook(() => usePrivatePersonalDetailsDiscardConfirmation());
        await waitForBatchedUpdatesWithAct();
        expect(isDirty()).toBe(true);
        // When submission starts and Onyx reports failure
        await act(async () => Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {isLoading: true}));
        await act(async () => Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {isLoading: false, errorFields: {personalDetails: {error: 'Failed'}}}));
        await waitForBatchedUpdatesWithAct();
        // Then no submission bypass or premature cleanup has erased the edit
        expect(isDirty()).toBe(true);
        await act(async () => jest.mocked(useFlowDiscardChangesConfirmation).mock.lastCall?.[0].onDiscard?.());
        await waitForBatchedUpdatesWithAct();
        expect(isDirty()).toBe(false);
    });

    it('protects bank drafts after Onyx failure and stops prompting only on success', async () => {
        // Given manually entered account input
        await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {accountNumber: '1234'});
        const discard = jest.fn();
        renderHook(() => usePersonalBankAccountDiscardConfirmation({onDiscard: discard}));
        await waitForBatchedUpdatesWithAct();
        expect(isDirty()).toBe(true);
        // When the void-returning submission fails through Onyx
        await act(async () => Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {isLoading: true}));
        await act(async () => Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {isLoading: false, errors: {error: 'Failed'}}));
        await waitForBatchedUpdatesWithAct();
        // Then the draft remains protected without cleanup; success alone disables protection
        expect(isDirty()).toBe(true);
        expect(discard).not.toHaveBeenCalled();
        await act(async () => Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {shouldShowSuccess: true}));
        await waitForBatchedUpdatesWithAct();
        expect(isDirty()).toBe(false);
    });

    it('protects address typing before Next and becomes clean after reverting', async () => {
        // Given the bank address step stores keystrokes before its submitted bank draft
        await Onyx.set(ONYXKEYS.FORMS.HOME_ADDRESS_FORM_DRAFT, {addressLine1: 'Changed'});
        renderHook(() => usePersonalBankAccountDiscardConfirmation({onDiscard: jest.fn()}));
        await waitForBatchedUpdatesWithAct();
        expect(isDirty()).toBe(true);
        // When the original address is restored
        await act(async () => Onyx.set(ONYXKEYS.FORMS.HOME_ADDRESS_FORM_DRAFT, {addressLine1: 'Main St'}));
        await waitForBatchedUpdatesWithAct();
        // Then draft presence alone cannot trigger a warning
        expect(isDirty()).toBe(false);
    });

    it('retains the existing-bank baseline through an optimistic update and failure rollback', async () => {
        // Given an existing bank operation initialized before the user supplies its missing phone number
        const bankAccountID = 123;
        await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {bankAccountID});
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {[bankAccountID]: {accountData: {additionalData: {companyPhone: ''}}}});
        renderHook(() => usePersonalBankAccountDiscardConfirmation({isUpdating: true, onDiscard: jest.fn()}));
        await waitForBatchedUpdatesWithAct();
        await act(async () => Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {phoneNumber: '+14155550123'}));
        await waitForBatchedUpdatesWithAct();
        expect(isDirty()).toBe(true);
        // When submission optimistically updates the saved account, then rolls back on failure
        await act(async () => Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {[bankAccountID]: {accountData: {additionalData: {companyPhone: '+14155550123'}}}}));
        await waitForBatchedUpdatesWithAct();
        // Then optimistic data cannot authorize abandonment of the still-pending edit
        expect(isDirty()).toBe(true);
        await act(async () => Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {[bankAccountID]: {accountData: {additionalData: {companyPhone: ''}}}}));
        await act(async () => Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {isLoading: false, updateError: 'common.genericErrorMessage'}));
        await waitForBatchedUpdatesWithAct();
        expect(isDirty()).toBe(true);
    });
});
