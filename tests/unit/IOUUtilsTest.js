import Onyx from 'react-native-onyx';
import * as IOUUtils from '../../src/libs/IOUUtils';
import * as ReportUtils from '../../src/libs/ReportUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import currencyList from './currencyList.json';
import * as TransactionUtils from '../../src/libs/TransactionUtils';

function initCurrencyList() {
    Onyx.init({
        keys: ONYXKEYS,
        initialKeyStates: {
            [ONYXKEYS.CURRENCY_LIST]: currencyList,
        },
    });
    return waitForPromisesToResolve();
}

describe('IOUUtils', () => {
    describe('isIOUReportPendingCurrencyConversion', () => {
        beforeAll(() => {
            Onyx.init({
                keys: ONYXKEYS,
            });
        });

        test('Requesting money offline in a different currency will show the pending conversion message', () => {
            const iouReport = ReportUtils.buildOptimisticIOUReport(1, 2, 100, 1, 'USD');
            const usdPendingTransaction = TransactionUtils.buildOptimisticTransaction(100, 'USD', iouReport.reportID);
            const aedPendingTransaction = TransactionUtils.buildOptimisticTransaction(100, 'AED', iouReport.reportID);

            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${usdPendingTransaction.transactionID}`]: usdPendingTransaction,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${aedPendingTransaction.transactionID}`]: aedPendingTransaction,
            }).then(() => {
                // We requested money offline in a different currency, we don't know the total of the iouReport until we're back online
                expect(IOUUtils.isIOUReportPendingCurrencyConversion(iouReport)).toBe(true);
            });
        });

        test('Requesting money online in a different currency will not show the pending conversion message', () => {
            const iouReport = ReportUtils.buildOptimisticIOUReport(2, 3, 100, 1, 'USD');
            const usdPendingTransaction = TransactionUtils.buildOptimisticTransaction(100, 'USD', iouReport.reportID);
            const aedPendingTransaction = TransactionUtils.buildOptimisticTransaction(100, 'AED', iouReport.reportID);

            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${usdPendingTransaction.transactionID}`]: {
                    ...usdPendingTransaction,
                    pendingAction: null,
                },
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${aedPendingTransaction.transactionID}`]: {
                    ...aedPendingTransaction,
                    pendingAction: null,
                },
            }).then(() => {
                // We requested money online in a different currency, we know the iouReport total and there's no need to show the pending conversion message
                expect(IOUUtils.isIOUReportPendingCurrencyConversion(iouReport)).toBe(false);
            });
        });
    });

    describe('calculateAmount', () => {
        beforeAll(() => initCurrencyList());

        test('103 JPY split among 3 participants including the default user should be [35, 34, 34]', () => {
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 103, true)).toBe(35);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 103)).toBe(34);
        });

        test('10 AFN split among 4 participants including the default user should be [1, 3, 3, 3]', () => {
            const participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10, true)).toBe(1);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10)).toBe(3);
        });

        test('0.02 USD split among 4 participants including the default user should be [-1, 1, 1, 1]', () => {
            const participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 2, true)).toBe(-1);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 2)).toBe(1);
        });
    });
});

describe('isValidMoneyRequestType', () => {
    test('Return true for valid iou type', () => {
        expect(IOUUtils.isValidMoneyRequestType('request')).toBe(true);
        expect(IOUUtils.isValidMoneyRequestType('split')).toBe(true);
    });

    test('Return false for invalid iou type', () => {
        expect(IOUUtils.isValidMoneyRequestType('send')).toBe(false);
        expect(IOUUtils.isValidMoneyRequestType('money')).toBe(false);
    });
});
