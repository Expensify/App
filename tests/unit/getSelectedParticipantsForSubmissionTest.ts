import getSelectedParticipantsForSubmission from '@pages/iou/request/step/confirmation/submission/utils/getSelectedParticipantsForSubmission';

import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';
import type {SplitShares} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';

import createRandomTransaction from '../utils/collections/transaction';

const ALICE_ACCOUNT_ID = 1;
const BOB_ACCOUNT_ID = 2;
const WORKSPACE_OWNER_ACCOUNT_ID = 3;

const ALICE: Participant = {accountID: ALICE_ACCOUNT_ID, login: 'alice@test.com'};
const BOB: Participant = {accountID: BOB_ACCOUNT_ID, login: 'bob@test.com'};
const WORKSPACE_CHAT: Participant = {reportID: '100', isPolicyExpenseChat: true, ownerAccountID: WORKSPACE_OWNER_ACCOUNT_ID};

function buildTransaction(splitShares?: SplitShares): Transaction {
    return {...createRandomTransaction(1), splitShares};
}

describe('getSelectedParticipantsForSubmission', () => {
    it('returns the selected participants untouched for a non-split expense', () => {
        // Given a transaction where Bob's amount is zero
        const transaction = buildTransaction({[ALICE_ACCOUNT_ID]: {amount: 100}, [BOB_ACCOUNT_ID]: {amount: 0}});
        const selectedParticipants = [ALICE, BOB];

        // When the participants are picked for a non-split (submit) expense
        const result = getSelectedParticipantsForSubmission({transaction, iouType: CONST.IOU.TYPE.SUBMIT, selectedParticipants});

        // Then split shares are ignored and the selection is returned as-is, because shares only apply to splits
        expect(result).toBe(selectedParticipants);
    });

    it('returns the selected participants untouched for a split without split shares', () => {
        // Given a split whose transaction carries no split shares yet
        const transaction = buildTransaction();
        const selectedParticipants = [ALICE, BOB];

        // When the participants for submission are resolved
        const result = getSelectedParticipantsForSubmission({transaction, iouType: CONST.IOU.TYPE.SPLIT, selectedParticipants});

        // Then nobody is filtered out, since there are no amounts to filter by
        expect(result).toBe(selectedParticipants);
    });

    it('drops split participants whose share is zero', () => {
        // Given a split where Alice owes an amount and Bob's share was set to zero
        const transaction = buildTransaction({[ALICE_ACCOUNT_ID]: {amount: 100}, [BOB_ACCOUNT_ID]: {amount: 0}});

        // When the participants for submission are resolved
        const result = getSelectedParticipantsForSubmission({transaction, iouType: CONST.IOU.TYPE.SPLIT, selectedParticipants: [ALICE, BOB]});

        // Then only Alice is kept, so no zero-amount split is created for Bob
        expect(result).toEqual([ALICE]);
    });

    it('drops split participants that have no split share entry', () => {
        // Given a split whose shares only include Alice
        const transaction = buildTransaction({[ALICE_ACCOUNT_ID]: {amount: 100}});

        // When the participants are picked for a split
        const result = getSelectedParticipantsForSubmission({transaction, iouType: CONST.IOU.TYPE.SPLIT, selectedParticipants: [ALICE, BOB]});

        // Then Bob is dropped, because only participants with a positive share are kept
        expect(result).toEqual([ALICE]);
    });

    it('matches a workspace chat participant by its owner account ID', () => {
        // Given a split with a workspace chat whose owner has a non-zero share, keyed by the owner's account ID
        const transaction = buildTransaction({[ALICE_ACCOUNT_ID]: {amount: 0}, [WORKSPACE_OWNER_ACCOUNT_ID]: {amount: 100}});

        // When the participants for submission are resolved
        const result = getSelectedParticipantsForSubmission({transaction, iouType: CONST.IOU.TYPE.SPLIT, selectedParticipants: [ALICE, WORKSPACE_CHAT]});

        // Then the workspace chat is kept through its owner's share and Alice is dropped
        expect(result).toEqual([WORKSPACE_CHAT]);
    });
});
