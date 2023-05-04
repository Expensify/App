import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import * as IOUUtils from '../../src/libs/IOUUtils';
import * as ReportUtils from '../../src/libs/ReportUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import currencyList from './currencyList.json';

let iouReport;
let reportActions;
const ownerEmail = 'owner@iou.com';
const managerEmail = 'manager@iou.com';

function createIOUReportAction(type, amount, currency, {IOUTransactionID, isOnline} = {}) {
    const moneyRequestAction = ReportUtils.buildOptimisticIOUReportAction(
        type,
        amount,
        currency,
        'Test comment',
        [managerEmail],
        '',
        IOUTransactionID,
        iouReport.reportID,
    );

    // Default is to create requests offline, if this is specified then we need to remove the pendingAction
    moneyRequestAction.pendingAction = isOnline ? null : 'add';

    reportActions.push(moneyRequestAction);
    return moneyRequestAction;
}

function deleteMoneyRequest(moneyRequestAction, {isOnline} = {}) {
    createIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.DELETE,
        moneyRequestAction.originalMessage.amount,
        moneyRequestAction.originalMessage.currency,
        {
            IOUTransactionID: moneyRequestAction.originalMessage.IOUTransactionID,
            isOnline,
        },
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

describe('isIOUReportPendingCurrencyConversion', () => {
    beforeEach(() => {
        reportActions = [];
        const chatReportID = ReportUtils.generateReportID();
        const amount = 1000;
        const currency = 'USD';

        iouReport = ReportUtils.buildOptimisticIOUReport(
            ownerEmail,
            managerEmail,
            amount,
            chatReportID,
            currency,
            CONST.LOCALES.EN,
        );

        // The starting point of all tests is the IOUReport containing a single non-pending transaction in USD
        // All requests in the tests are assumed to be offline, unless isOnline is specified
        createIOUReportAction('create', amount, currency, {IOUTransactionID: '', isOnline: true});
    });

    test('Requesting money offline in a different currency will show the pending conversion message', () => {
        // Request money offline in AED
        createIOUReportAction('create', 100, 'AED');

        // We requested money offline in a different currency, we don't know the total of the iouReport until we're back online
        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(true);
    });

    test('IOUReport is not pending conversion when all requests made offline have been deleted', () => {
        // Create two requests offline
        const moneyRequestA = createIOUReportAction('create', 1000, 'AED');
        const moneyRequestB = createIOUReportAction('create', 1000, 'AED');

        // Delete both requests
        deleteMoneyRequest(moneyRequestA);
        deleteMoneyRequest(moneyRequestB);

        // Both requests made offline have been deleted, total won't update so no need to show a pending conversion message
        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(false);
    });

    test('Deleting a request made online shows the preview', () => {
        // Request money online in AED
        const moneyRequest = createIOUReportAction('create', 1000, 'AED', {isOnline: true});

        // Delete it offline
        deleteMoneyRequest(moneyRequest);

        // We don't know what the total is because we need to subtract the converted amount of the offline request from the total
        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(true);
    });

    test('Deleting a request made offline while there\'s a previous one made online will not show the pending conversion message', () => {
        // Request money online in AED
        createIOUReportAction('create', 1000, 'AED', {isOnline: true});

        // Another request offline
        const moneyRequestOffline = createIOUReportAction('create', 1000, 'AED');

        // Delete the request made offline
        deleteMoneyRequest(moneyRequestOffline);

        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(false);
    });

    test('Deleting a request made online while we have one made offline will show the pending conversion message', () => {
        // Request money online in AED
        const moneyRequestOnline = createIOUReportAction('create', 1000, 'AED', {isOnline: true});

        // Requet money again but offline
        createIOUReportAction('create', 1000, 'AED');

        // Delete the request made online
        deleteMoneyRequest(moneyRequestOnline);

        // We don't know what the total is because we need to subtract the converted amount of the offline request from the total
        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(true);
    });

    test('Deleting a request offline in the report\'s currency when we have requests in a different currency does not show the pending conversion message', () => {
        // Request money in the report's curreny (USD)
        const onlineMoneyRequestInUSD = createIOUReportAction('create', 1000, 'USD', {isOnline: true});

        // Request money online in a different currency
        createIOUReportAction('create', 2000, 'AED', {isOnline: true});

        // Delete the USD request offline
        deleteMoneyRequest(onlineMoneyRequestInUSD);

        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(false);
    });
});

describe('getCurrencyDecimals', () => {
    beforeAll(() => initCurrencyList());
    test('Currency decimals smaller than or equal 2', () => {
        expect(IOUUtils.getCurrencyDecimals('JPY')).toBe(0);
        expect(IOUUtils.getCurrencyDecimals('USD')).toBe(2);
    });

    test('Currency decimals larger than 2 should return 2', () => {
        // Actual: 3
        expect(IOUUtils.getCurrencyDecimals('LYD')).toBe(2);

        // Actual: 4
        expect(IOUUtils.getCurrencyDecimals('UYW')).toBe(2);
    });
});

describe('getCurrencyUnit', () => {
    beforeAll(() => initCurrencyList());
    test('Currency with decimals smaller than or equal 2', () => {
        expect(IOUUtils.getCurrencyUnit('JPY')).toBe(1);
        expect(IOUUtils.getCurrencyUnit('USD')).toBe(100);
    });

    test('Currency with decimals larger than 2 should be floor to 2', () => {
        expect(IOUUtils.getCurrencyUnit('LYD')).toBe(100);
    });
});

describe('calculateAmount', () => {
    beforeAll(() => initCurrencyList());
    test('103 JPY split among 3 participants including the default user should be [35, 34, 34]', () => {
        const participants = ['tonystark@expensify.com', 'reedrichards@expensify.com'];
        expect(IOUUtils.calculateAmount(participants, 103, 'JPY', true)).toBe(3500);
        expect(IOUUtils.calculateAmount(participants, 103, 'JPY')).toBe(3400);
    });

    test('10 AFN split among 4 participants including the default user should be [1, 3, 3, 3]', () => {
        const participants = ['tonystark@expensify.com', 'reedrichards@expensify.com', 'suestorm@expensify.com'];
        expect(IOUUtils.calculateAmount(participants, 10, 'AFN', true)).toBe(100);
        expect(IOUUtils.calculateAmount(participants, 10, 'AFN')).toBe(300);
    });

    test('10 BHD split among 3 participants including the default user should be [334, 333, 333]', () => {
        const participants = ['tonystark@expensify.com', 'reedrichards@expensify.com'];
        expect(IOUUtils.calculateAmount(participants, 10, 'BHD', true)).toBe(334);
        expect(IOUUtils.calculateAmount(participants, 10, 'BHD')).toBe(333);
    });

    test('0.02 USD split among 4 participants including the default user should be [-1, 1, 1, 1]', () => {
        const participants = ['tonystark@expensify.com', 'reedrichards@expensify.com', 'suestorm@expensify.com'];
        expect(IOUUtils.calculateAmount(participants, 0.02, 'USD', true)).toBe(-1);
        expect(IOUUtils.calculateAmount(participants, 0.02, 'USD')).toBe(1);
    });
});
