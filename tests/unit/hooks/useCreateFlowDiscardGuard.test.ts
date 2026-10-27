import {act, renderHook, waitFor} from '@testing-library/react-native';

import useCreateFlowDiscardGuard from '@hooks/useCreateFlowDiscardGuard';
import useDiscardChangesConfirmation from '@hooks/useDiscardChangesConfirmation';

import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useDiscardChangesConfirmation', () => jest.fn(() => ({suppressDiscardPrompt: jest.fn()})));
jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => jest.fn());

const getGuardOptions = () => jest.mocked(useDiscardChangesConfirmation).mock.calls.at(-1)?.[0];

describe('useCreateFlowDiscardGuard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('keeps an untouched flow clean', async () => {
        // Given a create flow whose draft only holds the values the flow seeds itself
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            amount: 0,
            category: 'Travel',
            billable: true,
            comment: {},
            reportID: '1',
            merchant: CONST.TRANSACTION.DEFAULT_MERCHANT,
        });

        // When the flow root sets up its guard
        const {result} = renderHook(() => useCreateFlowDiscardGuard({isEnabled: true}));
        await waitForBatchedUpdates();

        // Then leaving the flow doesn't prompt, and the guard keeps prompting while later steps cover the root
        expect(result.current.isFlowDirty).toBe(false);
        expect(getGuardOptions()?.getHasUnsavedChanges()).toBe(false);
        expect(getGuardOptions()?.shouldPromptWhenUnfocused).toBe(true);
    });

    it('prompts for user input in any of the flow drafts, and clears all of them on Discard', async () => {
        // Given a multi-scan flow where only the second draft holds a scanned receipt
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            amount: 0,
            comment: {},
            reportID: '1',
            merchant: '',
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}2`, {
            transactionID: '2',
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            amount: 0,
            comment: {},
            reportID: '1',
            merchant: '',
            receipt: {source: 'blob:second'},
        });

        // When the flow root sets up its guard
        const {result} = renderHook(() => useCreateFlowDiscardGuard({isEnabled: true}));
        await waitFor(() => expect(result.current.isFlowDirty).toBe(true));

        // Then leaving the flow prompts
        expect(getGuardOptions()?.getHasUnsavedChanges()).toBe(true);

        // When the user confirms Discard
        act(() => getGuardOptions()?.onDiscarded?.());

        // Then every draft of the flow is cleared once the flow has closed
        expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith({
            draftTransactionIDs: expect.arrayContaining([CONST.IOU.OPTIMISTIC_TRANSACTION_ID, '2']),
            shouldWaitForUpcomingTransition: true,
        });
    });

    it('stays out of the way when the screen is not the root of the flow', async () => {
        // Given a dirty flow, and a screen that is only the flow root when nothing was opened below it
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            amount: 0,
            comment: {},
            reportID: '1',
            merchant: '',
            receipt: {source: 'blob:receipt'},
        });
        const getIsFlowRoot = jest.fn(() => false);

        // When the screen sets up its guard on top of the start page that already guards the flow
        const {result} = renderHook(() => useCreateFlowDiscardGuard({isEnabled: true, getIsFlowRoot}));
        await waitFor(() => expect(result.current.isFlowDirty).toBe(true));

        // Then it doesn't prompt, so the user is asked once, by the start page
        expect(getGuardOptions()?.getHasUnsavedChanges()).toBe(false);
        expect(getIsFlowRoot).toHaveBeenCalled();
    });

    it('stays clean when disabled', async () => {
        // Given a dirty flow whose root is guarded elsewhere
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            amount: 100,
            isAmountSet: true,
            comment: {},
            reportID: '1',
            merchant: '',
        });

        // When the screen sets up a disabled guard
        const {result} = renderHook(() => useCreateFlowDiscardGuard({isEnabled: false}));
        await waitForBatchedUpdates();

        // Then it never prompts
        expect(result.current.isFlowDirty).toBe(false);
        expect(getGuardOptions()?.getHasUnsavedChanges()).toBe(false);
        expect(getGuardOptions()?.shouldPromptWhenUnfocused).toBe(false);
    });
});
