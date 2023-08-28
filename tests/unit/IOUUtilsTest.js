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
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'JPY', true)).toBe(3500);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'JPY')).toBe(3400);
        });

        test('103 USD split among 3 participants including the default user should be [34.34, 34.33, 34.33]', () => {
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'USD', true)).toBe(3434);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'USD')).toBe(3433);
        });

        test('10 AFN split among 4 participants including the default user should be [1, 3, 3, 3]', () => {
            const participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1000, 'AFN', true)).toBe(100);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1000, 'AFN')).toBe(300);
        });

        test('10.12 USD split among 4 participants including the default user should be [2.53, 2.53, 2.53, 2.53]', () => {
            const participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD', true)).toBe(253);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD')).toBe(253);
        });

        test('10.12 USD split among 3 participants including the default user should be [3.38, 3.37, 3.37]', () => {
            const participantsAccountIDs = [100, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD', true)).toBe(338);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD')).toBe(337);
        });

        test('0.02 USD split among 4 participants including the default user should be [-0.01, 0.01, 0.01, 0.01]', () => {
            const participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 2, 'USD', true)).toBe(-1);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 2, 'USD')).toBe(1);
        });

        test('1 RSD split among 3 participants including the default user should be [0.34, 0.33, 0.33]', () => {
            // RSD is a special case that we forced to have 2 decimals
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'RSD', true)).toBe(34);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'RSD')).toBe(33);
        });

        test('1 BHD split among 3 participants including the default user should be [0.34, 0.33, 0.33]', () => {
            // BHD has 3 decimal places, but it still produces parts with only 2 decimal places because of a backend limitation
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'BHD', true)).toBe(34);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'BHD')).toBe(33);
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
