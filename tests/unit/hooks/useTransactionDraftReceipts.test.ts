import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useTransactionDraftReceipts from '@hooks/useTransactionDraftReceipts';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomTransaction from '../../utils/collections/transaction';

describe('useTransactionDraftReceipts', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        return Onyx.clear();
    });

    it('returns an empty array when there are no draft transactions', async () => {
        const {result} = renderHook(() => useTransactionDraftReceipts());

        await waitFor(() => {
            expect(result.current).toEqual([]);
        });
    });

    it('returns an empty array when drafts have no receipts', async () => {
        const draft = createRandomTransaction(1);
        draft.transactionID = 'draft1';
        draft.receipt = undefined;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft1`, draft);

        const {result} = renderHook(() => useTransactionDraftReceipts());

        await waitFor(() => {
            expect(result.current).toEqual([]);
        });
    });

    it('maps receipts with their transactionID', async () => {
        const draft = createRandomTransaction(1);
        draft.transactionID = 'draft1';
        draft.receipt = {source: 'file://receipt1.jpg', filename: 'receipt1.jpg'};

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft1`, draft);

        const {result} = renderHook(() => useTransactionDraftReceipts());

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });

        expect(result.current.at(0)).toEqual({
            ...draft.receipt,
            transactionID: 'draft1',
        });
    });

    it('skips drafts without receipts and maps only those with receipts', async () => {
        const draftWithReceipt = createRandomTransaction(1);
        draftWithReceipt.transactionID = 'draft1';
        draftWithReceipt.receipt = {source: 'file://receipt1.jpg', filename: 'receipt1.jpg'};

        const draftWithoutReceipt = createRandomTransaction(2);
        draftWithoutReceipt.transactionID = 'draft2';
        draftWithoutReceipt.receipt = undefined;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft1`, draftWithReceipt);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft2`, draftWithoutReceipt);

        const {result} = renderHook(() => useTransactionDraftReceipts());

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });

        expect(result.current.at(0)?.transactionID).toBe('draft1');
    });

    it('returns receipts for all drafts that have them', async () => {
        const draft1 = createRandomTransaction(1);
        draft1.transactionID = 'draft1';
        draft1.receipt = {source: 'file://receipt1.jpg', filename: 'receipt1.jpg'};

        const draft2 = createRandomTransaction(2);
        draft2.transactionID = 'draft2';
        draft2.receipt = {source: 'file://receipt2.jpg', filename: 'receipt2.jpg'};

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft1`, draft1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft2`, draft2);

        const {result} = renderHook(() => useTransactionDraftReceipts());

        await waitFor(() => {
            expect(result.current).toHaveLength(2);
        });

        const transactionIDs = result.current.map((r) => r.transactionID);
        expect(transactionIDs).toEqual(expect.arrayContaining(['draft1', 'draft2']));
    });

    it('updates when a draft with a receipt is added', async () => {
        const {result} = renderHook(() => useTransactionDraftReceipts());

        await waitFor(() => {
            expect(result.current).toEqual([]);
        });

        const draft = createRandomTransaction(1);
        draft.transactionID = 'draft1';
        draft.receipt = {source: 'file://receipt1.jpg', filename: 'receipt1.jpg'};

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft1`, draft);

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });
    });
});
