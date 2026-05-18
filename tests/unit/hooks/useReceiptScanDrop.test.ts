import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useReceiptScanDrop from '@hooks/useReceiptScanDrop';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

describe('useReceiptScanDrop', () => {
    afterEach(async () => {
        await Onyx.clear();
    });

    it('should disable drag for anonymous users', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
        const {result} = renderHook(() => useReceiptScanDrop());
        await waitForBatchedUpdatesWithAct();
        expect(result.current.isDragDisabled).toBe(true);
    });

    it('should enable drag for logged-in users', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'test-token'});
        const {result} = renderHook(() => useReceiptScanDrop());
        await waitForBatchedUpdatesWithAct();
        expect(result.current.isDragDisabled).toBe(false);
    });
});
