import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useTransactionDraftValues from '@hooks/useTransactionDraftValues';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomTransaction from '../../utils/collections/transaction';

describe('useTransactionDraftValues', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        return Onyx.clear();
    });

    it('returns an empty array when there are no draft transactions', async () => {
        const {result} = renderHook(() => useTransactionDraftValues());

        await waitFor(() => {
            expect(result.current).toEqual([]);
        });
    });

    it('returns values from the draft transaction collection', async () => {
        const draft1 = createRandomTransaction(1);
        const draft2 = createRandomTransaction(2);
        draft1.transactionID = 'draft1';
        draft2.transactionID = 'draft2';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft1`, draft1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft2`, draft2);

        const {result} = renderHook(() => useTransactionDraftValues());

        await waitFor(() => {
            expect(result.current).toHaveLength(2);
        });

        expect(result.current).toEqual(expect.arrayContaining([draft1, draft2]));
    });

    it('updates when a new draft transaction is added', async () => {
        const draft1 = createRandomTransaction(1);
        draft1.transactionID = 'draft1';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft1`, draft1);

        const {result} = renderHook(() => useTransactionDraftValues());

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });

        const draft2 = createRandomTransaction(2);
        draft2.transactionID = 'draft2';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft2`, draft2);

        await waitFor(() => {
            expect(result.current).toHaveLength(2);
        });
    });

    it('updates when a draft transaction is removed', async () => {
        const draft1 = createRandomTransaction(1);
        draft1.transactionID = 'draft1';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft1`, draft1);

        const {result} = renderHook(() => useTransactionDraftValues());

        await waitFor(() => {
            expect(result.current).toHaveLength(1);
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft1`, null);

        await waitFor(() => {
            expect(result.current).toHaveLength(0);
        });
    });
});
