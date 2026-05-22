import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useHasMultipleSplitChildren from '@hooks/useHasMultipleSplitChildren';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomTransaction from '../../utils/collections/transaction';

const ORIGINAL_TRANSACTION_ID = 'ORIGINAL_TXN';

function splitChild(id: string, reportID: string, pendingAction?: typeof CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
    return {
        ...createRandomTransaction(1),
        transactionID: id,
        reportID,
        pendingAction,
        comment: {originalTransactionID: ORIGINAL_TRANSACTION_ID, source: CONST.IOU.TYPE.SPLIT},
    };
}

describe('useHasMultipleSplitChildren', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('returns false when there is no original transaction', () => {
        // Given no original transaction id
        // When the hook is rendered
        const {result} = renderHook(() => useHasMultipleSplitChildren(undefined));

        // Then it reports the transaction is not part of a multi-child split
        expect(result.current).toBe(false);
    });

    it('returns false when only one split child remains', async () => {
        // Given a single split child for the original
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}c1`, splitChild('c1', 'REPORT_1'));

        // When the hook is rendered
        const {result} = renderHook(() => useHasMultipleSplitChildren(ORIGINAL_TRANSACTION_ID));

        // Then it is not a multi-child split
        await waitFor(() => expect(result.current).toBe(false));
    });

    it('counts an unreported child so a split with one reported and one unreported half stays a split', async () => {
        // Given one split child on a report and one that has been unreported but not deleted
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}c1`, splitChild('c1', 'REPORT_1'));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}c2`, splitChild('c2', CONST.REPORT.UNREPORTED_REPORT_ID));

        // When the hook is rendered
        const {result} = renderHook(() => useHasMultipleSplitChildren(ORIGINAL_TRANSACTION_ID));

        // Then the unreported half still counts, so it is a multi-child split
        await waitFor(() => expect(result.current).toBe(true));
    });

    it('does not count a child that is pending deletion', async () => {
        // Given one live split child and one that has been deleted
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}c1`, splitChild('c1', 'REPORT_1'));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}c2`, splitChild('c2', CONST.REPORT.UNREPORTED_REPORT_ID, CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE));

        // When the hook is rendered
        const {result} = renderHook(() => useHasMultipleSplitChildren(ORIGINAL_TRANSACTION_ID));

        // Then the split is dissolved (only the live child counts)
        await waitFor(() => expect(result.current).toBe(false));
    });

    it('ignores children that belong to a different original transaction', async () => {
        // Given two split children pointing at a different original
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}c1`, {...splitChild('c1', 'REPORT_1'), comment: {originalTransactionID: 'OTHER', source: CONST.IOU.TYPE.SPLIT}});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}c2`, {...splitChild('c2', 'REPORT_2'), comment: {originalTransactionID: 'OTHER', source: CONST.IOU.TYPE.SPLIT}});

        // When the hook is rendered for our original
        const {result} = renderHook(() => useHasMultipleSplitChildren(ORIGINAL_TRANSACTION_ID));

        // Then they are not counted
        await waitFor(() => expect(result.current).toBe(false));
    });
});
