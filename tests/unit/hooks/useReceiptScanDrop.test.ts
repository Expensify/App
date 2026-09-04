import {act, renderHook} from '@testing-library/react-native';

import useFilesValidation from '@hooks/useFilesValidation';
import useReceiptScanDrop from '@hooks/useReceiptScanDrop';

import {navigateToParticipantPage} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';

import {initMoneyRequest, setMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {buildOptimisticTransactionAndCreateDraft} from '@userActions/TransactionEdit';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useFilesValidation');
jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: jest.fn(() => false)}}));
jest.mock('@libs/IOUUtils', () => ({navigateToParticipantPage: jest.fn()}));
jest.mock('@libs/Navigation/Navigation');
jest.mock('@userActions/IOU/MoneyRequest', () => ({initMoneyRequest: jest.fn(), setMoneyRequestParticipantsFromReport: jest.fn()}));
jest.mock('@userActions/IOU/Receipt', () => ({setMoneyRequestReceipt: jest.fn()}));
jest.mock('@userActions/TransactionEdit', () => ({buildOptimisticTransactionAndCreateDraft: jest.fn()}));
let mockOnFilesValidated: Parameters<typeof useFilesValidation>[0] = jest.fn();
describe('useReceiptScanDrop', () => {
    beforeEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
        jest.mocked(useFilesValidation).mockImplementation((onFilesValidated) => {
            mockOnFilesValidated = onFilesValidated;
            return {validateFiles: jest.fn(), PDFValidationComponent: undefined};
        });
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
    it('keeps one and multiple valid receipts ordered on their intended transactions', async () => {
        const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second');
        renderHook(() => useReceiptScanDrop());
        await waitForBatchedUpdatesWithAct();
        const [firstFile, secondFile] = [new File(['first'], 'first.png', {type: 'image/png'}), new File(['second'], 'second.png', {type: 'image/png'})];
        jest.mocked(initMoneyRequest).mockReturnValue(createMock<NonNullable<ReturnType<typeof initMoneyRequest>>>({}));
        mockOnFilesValidated([firstFile], []);
        expect(jest.mocked(setMoneyRequestReceipt)).toHaveBeenLastCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, 'blob:first', 'first.png', true, 'image/png');
        expect(jest.mocked(navigateToParticipantPage)).toHaveBeenCalledWith(CONST.IOU.TYPE.CREATE, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, expect.any(String));
        jest.clearAllMocks();
        await act(() => Onyx.set(ONYXKEYS.NVP_ACTIVE_POLICY_ID, 'policy'));
        await act(() => Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}policy`, {id: 'policy', type: CONST.POLICY.TYPE.TEAM}));
        await waitForBatchedUpdatesWithAct();
        jest.mocked(initMoneyRequest).mockReturnValue(createMock<NonNullable<ReturnType<typeof initMoneyRequest>>>({transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID}));
        jest.mocked(buildOptimisticTransactionAndCreateDraft).mockReturnValue(createMock<ReturnType<typeof buildOptimisticTransactionAndCreateDraft>>({transactionID: 'later'}));
        mockOnFilesValidated([firstFile, secondFile], []);
        await waitForBatchedUpdatesWithAct();
        expect(createObjectURLSpy.mock.calls.slice(-2).map(([file]) => file)).toEqual([firstFile, secondFile]);
        expect(jest.mocked(setMoneyRequestReceipt).mock.calls.map(([transactionID]) => transactionID)).toEqual([CONST.IOU.OPTIMISTIC_TRANSACTION_ID, 'later']);
        expect(jest.mocked(buildOptimisticTransactionAndCreateDraft)).toHaveBeenCalledTimes(1);
        expect(jest.mocked(setMoneyRequestParticipantsFromReport).mock.calls.map(([transactionID]) => transactionID)).toEqual([CONST.IOU.OPTIMISTIC_TRANSACTION_ID, 'later']);
        expect(jest.mocked(Navigation.navigate)).toHaveBeenCalledTimes(1);
        expect(jest.mocked(navigateToParticipantPage)).not.toHaveBeenCalled();
    });
});
