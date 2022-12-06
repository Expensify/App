import * as IOUUtils from '../../src/libs/IOUUtils';
import * as ReportUtils from '../../src/libs/ReportUtils';

let iouReport;
let reportActions;
const ownerEmail = 'owner@iou.com';
const managerEmail = 'manager@iou.com';

function createIOUReportAction(type, amount, currency, {IOUTransactionID, isOnline} = {}) {
    const moneyRequestAction = ReportUtils.buildOptimisticIOUReportAction(
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
        return {
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
        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(true);
    });

    test('IOUReport is not pending conversion when all requests made offline have been cancelled', () => {
        // Create two requests offline
        const moneyRequestA = createIOUReportAction('create', 1000, 'AED');
        const moneyRequestB = createIOUReportAction('create', 1000, 'AED');

        // Cancel both requests
        cancelMoneyRequest(moneyRequestA);
        cancelMoneyRequest(moneyRequestB);

        expect(IOUUtils.isIOUReportPendingCurrencyConversion(reportActions, iouReport)).toBe(false);
    });
});

