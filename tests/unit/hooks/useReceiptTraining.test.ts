import {renderHook} from '@testing-library/react-native';
import useReceiptTraining from '@components/MoneyRequestConfirmationList/hooks/useReceiptTraining';
import type * as OnyxTypes from '@src/types/onyx';

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => ({
        shouldShowProductTrainingTooltip: false,
        renderProductTrainingTooltip: () => null,
    }),
}));

function makeTransaction(receipt: Partial<NonNullable<OnyxTypes.Transaction['receipt']>> = {}): OnyxTypes.Transaction {
    return {transactionID: 'txn1', receipt} as unknown as OnyxTypes.Transaction;
}

describe('useReceiptTraining', () => {
    it('reflects transaction.receipt.isTestReceipt when true', () => {
        const {result} = renderHook(() =>
            useReceiptTraining({
                transaction: makeTransaction({isTestReceipt: true}),
            }),
        );
        expect(result.current.isTestReceipt).toBe(true);
    });

    it('returns false when receipt has no isTestReceipt flag', () => {
        const {result} = renderHook(() =>
            useReceiptTraining({
                transaction: makeTransaction({}),
            }),
        );
        expect(result.current.isTestReceipt).toBe(false);
    });

    it('returns false when transaction is undefined', () => {
        const {result} = renderHook(() =>
            useReceiptTraining({
                transaction: undefined,
            }),
        );
        expect(result.current.isTestReceipt).toBe(false);
    });

    it('exposes shouldShowProductTrainingTooltip and renderProductTrainingTooltip', () => {
        const {result} = renderHook(() =>
            useReceiptTraining({
                transaction: makeTransaction({}),
            }),
        );
        expect(typeof result.current.shouldShowProductTrainingTooltip).toBe('boolean');
        expect(typeof result.current.renderProductTrainingTooltip).toBe('function');
    });
});
