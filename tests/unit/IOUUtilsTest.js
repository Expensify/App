import * as IOUUtils from '../../src/libs/IOUUtils';
import * as ReportUtils from '../../src/libs/ReportUtils';

let iouReport;
let reportActions;
const ownerEmail = 'owner@iou.com';
const managerEmail = 'manager@iou.com';

function createIOUReportAction(type, amount, currency, {IOUTransactionID, isOnline} = {}) {
    let moneyRequestAction = ReportUtils.buildOptimisticIOUReportAction(
        1,
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
    if (isOnline) {
        moneyRequestAction = {
            ...moneyRequestAction,
            pendingAction: null,
        };
    }
    reportActions.push(moneyRequestAction);
    return moneyRequestAction;
}

function cancelMoneyRequest(moneyRequestAction, {isOnline} = {}) {
    createIOUReportAction(
        'cancel',
        moneyRequestAction.originalMessage.amount,
        moneyRequestAction.originalMessage.currency,
        {
            IOUTransactionID: moneyRequestAction.originalMessage.IOUTransactionID,
            isOnline,
        },
    );
}

beforeEach(() => {
    reportActions = [];
    const chatReportID = ReportUtils.generateReportID();
    const amount = 1000;
    const currency = 'USD';

    // Create an IOU report
    iouReport = ReportUtils.buildOptimisticIOUReport(
        ownerEmail,
        managerEmail,
        amount,
        chatReportID,
        currency,
        'en',
    );

    // The starting point of all tests is the IOUReport containing a single non-pending transaction in USD
    // All requests in the tests are assumed to be offline, unless isOnline is specified
    createIOUReportAction('create', amount, currency, {IOUTransactionID: '', isOnline: true});
});

describe('isIOUReportPendingCurrencyConversion', () => {
    test('Requesting money offline in a different currency shows the IOUReport as pending', () => {
        // Request money offline in AED
        createIOUReportAction('create', 100, 'AED');

        // We requested money offline in a different currency, we don't know the total of the iouReport until we're back online
        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(true);
    });

    test('IOUReport is not pending conversion when all requests made offline have been cancelled', () => {
        // Create two requests offline
        const moneyRequestA = createIOUReportAction('create', 1000, 'AED');
        const moneyRequestB = createIOUReportAction('create', 1000, 'AED');

        // Cancel both requests
        cancelMoneyRequest(moneyRequestA);
        cancelMoneyRequest(moneyRequestB);

        // Both requests made offline have been cancelled, total won't update so no need to show a pending message
        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(false);
    });

    test('Cancelling a request made online shows the preview', () => {
        // Request money online in AED
        const moneyRequest = createIOUReportAction('create', 1000, 'AED', {isOnline: true});

        // Cancel it offline
        cancelMoneyRequest(moneyRequest);

        // We don't know what the total is because we need to subtract the converted amount of the offline request from the total
        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(true);
    });

    test('Cancelling a request made offline while there\'s a previous one made online will not show the pending message', () => {
        // Request money online in AED
        createIOUReportAction('create', 1000, 'AED', {isOnline: true});

        // Another request offline
        const moneyRequestOffline = createIOUReportAction('create', 1000, 'AED');

        // Cancel the request made offline
        cancelMoneyRequest(moneyRequestOffline);

        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(false);
    });

    test('Cancelling a request made online while wxe have on made offline will show the preview', () => {
        // Request money online in AED
        const moneyRequestOnline = createIOUReportAction('create', 1000, 'AED', {isOnline: true});

        // Requet money again but offline
        createIOUReportAction('create', 1000, 'AED');

        // Cancel the request made online
        cancelMoneyRequest(moneyRequestOnline);

        // We don't know what the total is because we need to subtract the converted amount of the offline request from the total
        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(true);
    });
});

