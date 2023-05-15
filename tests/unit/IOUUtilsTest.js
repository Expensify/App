import Onyx from 'react-native-onyx';
import * as IOUUtils from '../../src/libs/IOUUtils';
import * as ReportUtils from '../../src/libs/ReportUtils';
import * as NumberUtils from '../../src/libs/NumberUtils';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import currencyList from './currencyList.json';

let iouReport;
let reportActions;
const ownerEmail = 'owner@iou.com';
const managerEmail = 'manager@iou.com';

function createIOUReportAction(type, amount, currency, isOffline = false, IOUTransactionID = NumberUtils.rand64()) {
    const moneyRequestAction = ReportUtils.buildOptimisticIOUReportAction(type, amount, currency, 'Test comment', [managerEmail], IOUTransactionID, '', iouReport.reportID);

    // Default is to create requests online, if `isOffline` is not specified then we need to remove the pendingAction
    if (!isOffline) {
        moneyRequestAction.pendingAction = null;
    }

    reportActions.push(moneyRequestAction);
    return moneyRequestAction;
}

function deleteMoneyRequest(moneyRequestAction, isOffline = false) {
    createIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.DELETE,
        moneyRequestAction.originalMessage.amount,
        moneyRequestAction.originalMessage.currency,
        isOffline,
        moneyRequestAction.originalMessage.IOUTransactionID,
    );
}

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
        beforeEach(() => {
            reportActions = [];
            const chatReportID = ReportUtils.generateReportID();
            const amount = 1000;
            const currency = 'USD';

            iouReport = ReportUtils.buildOptimisticIOUReport(ownerEmail, managerEmail, amount, chatReportID, currency);

            // The starting point of all tests is the IOUReport containing a single non-pending transaction in USD
            // All requests in the tests are assumed to be online, unless isOffline is specified
            createIOUReportAction('create', amount, currency);
        });

        test('Requesting money offline in a different currency will show the pending conversion message', () => {
            // Request money offline in AED
            createIOUReportAction('create', 100, 'AED', true);

            // We requested money offline in a different currency, we don't know the total of the iouReport until we're back online
            expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(true);
        });

        test('IOUReport is not pending conversion when all requests made offline have been deleted', () => {
            // Create two requests offline
            const moneyRequestA = createIOUReportAction('create', 1000, 'AED', true);
            const moneyRequestB = createIOUReportAction('create', 1000, 'AED', true);

            // Delete both requests
            deleteMoneyRequest(moneyRequestA, true);
            deleteMoneyRequest(moneyRequestB, true);

            // Both requests made offline have been deleted, total won't update so no need to show a pending conversion message
            expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(false);
        });

        test('Deleting a request made online shows the preview', () => {
            // Request money online in AED
            const moneyRequest = createIOUReportAction('create', 1000, 'AED');

            // Delete it offline
            deleteMoneyRequest(moneyRequest, true);

            // We don't know what the total is because we need to subtract the converted amount of the offline request from the total
            expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(true);
        });

        test("Deleting a request made offline while there's a previous one made online will not show the pending conversion message", () => {
            // Request money online in AED
            createIOUReportAction('create', 1000, 'AED');

            // Another request offline
            const moneyRequestOffline = createIOUReportAction('create', 1000, 'AED', true);

            // Delete the request made offline
            deleteMoneyRequest(moneyRequestOffline, true);

            expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(false);
        });

        test('Deleting a request made online while we have one made offline will show the pending conversion message', () => {
            // Request money online in AED
            const moneyRequestOnline = createIOUReportAction('create', 1000, 'AED');

            // Request money again but offline
            createIOUReportAction('create', 1000, 'AED', true);

            // Delete the request made online
            deleteMoneyRequest(moneyRequestOnline, true);

            // We don't know what the total is because we need to subtract the converted amount of the offline request from the total
            expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(true);
        });

        test("Deleting a request offline in the report's currency when we have requests in a different currency does not show the pending conversion message", () => {
            // Request money in the report's currency (USD)
            const onlineMoneyRequestInUSD = createIOUReportAction('create', 1000, 'USD');

            // Request money online in a different currency
            createIOUReportAction('create', 2000, 'AED');

            // Delete the USD request offline
            deleteMoneyRequest(onlineMoneyRequestInUSD, true);

            expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(false);
        });
    });

    describe('calculateAmount', () => {
        beforeAll(() => initCurrencyList());

        test('103 JPY split among 3 participants including the default user should be [35, 34, 34]', () => {
            const participants = ['tonystark@expensify.com', 'reedrichards@expensify.com'];
            expect(IOUUtils.calculateAmount(participants, 103, true)).toBe(35);
            expect(IOUUtils.calculateAmount(participants, 103)).toBe(34);
        });

        test('10 AFN split among 4 participants including the default user should be [1, 3, 3, 3]', () => {
            const participants = ['tonystark@expensify.com', 'reedrichards@expensify.com', 'suestorm@expensify.com'];
            expect(IOUUtils.calculateAmount(participants, 10, true)).toBe(1);
            expect(IOUUtils.calculateAmount(participants, 10)).toBe(3);
        });

        test('0.02 USD split among 4 participants including the default user should be [-1, 1, 1, 1]', () => {
            const participants = ['tonystark@expensify.com', 'reedrichards@expensify.com', 'suestorm@expensify.com'];
            expect(IOUUtils.calculateAmount(participants, 2, true)).toBe(-1);
            expect(IOUUtils.calculateAmount(participants, 2)).toBe(1);
        });
    });
});
