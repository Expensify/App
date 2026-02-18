import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {canEditMultipleTransactions} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OriginalMessageIOU, Policy, Report, ReportActions, Transaction} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createExpenseReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const currentUserAccountID = 1;
const currentUserEmail = 'test@example.com';

const buildTestData = (options?: {disableSecondAction?: boolean}) => {
    const transaction1: Transaction = {
        ...createRandomTransaction(1),
        transactionID: 't1',
        reportID: 'r1',
        amount: 1000,
        managedCard: false,
    };
    const transaction2: Transaction = {
        ...createRandomTransaction(2),
        transactionID: 't2',
        reportID: 'r2',
        amount: 2000,
        managedCard: false,
    };
    const report1: Report = {
        ...createExpenseReport(1),
        reportID: 'r1',
        policyID: 'p1',
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    };
    const report2: Report = {
        ...createExpenseReport(2),
        reportID: 'r2',
        policyID: 'p2',
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    };
    const policy1: Policy = {
        ...createRandomPolicy(1),
        id: 'p1',
        role: CONST.POLICY.ROLE.ADMIN,
    };
    const policy2: Policy = {
        ...createRandomPolicy(2),
        id: 'p2',
        role: CONST.POLICY.ROLE.ADMIN,
    };
    const reportAction1OriginalMessage: OriginalMessageIOU = {
        IOUReportID: report1.reportID,
        IOUTransactionID: transaction1.transactionID,
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: transaction1.amount,
        currency: transaction1.currency,
    };
    const reportAction1 = {
        ...createRandomReportAction(1),
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: currentUserAccountID,
        originalMessage: reportAction1OriginalMessage,
    };
    const reportAction2OriginalMessage: OriginalMessageIOU = {
        IOUReportID: report2.reportID,
        IOUTransactionID: transaction2.transactionID,
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: transaction2.amount,
        currency: transaction2.currency,
    };
    const reportAction2 = {
        ...createRandomReportAction(2),
        actionName: options?.disableSecondAction ? CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT : CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: currentUserAccountID,
        originalMessage: reportAction2OriginalMessage,
    };

    const reports: OnyxCollection<Report> = {
        [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
        [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
    };
    const policies: OnyxCollection<Policy> = {
        [`${ONYXKEYS.COLLECTION.POLICY}${policy1.id}`]: policy1,
        [`${ONYXKEYS.COLLECTION.POLICY}${policy2.id}`]: policy2,
    };
    const reportActions: OnyxCollection<ReportActions> = {
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report1.reportID}`]: {
            [reportAction1.reportActionID]: reportAction1,
        },
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report2.reportID}`]: {
            [reportAction2.reportActionID]: reportAction2,
        },
    };

    return {
        transaction1,
        transaction2,
        report1,
        report2,
        policy1,
        policy2,
        reportAction1,
        reportAction2,
        reports,
        policies,
        reportActions,
    };
};

describe('canEditMultipleTransactions', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns false when fewer than two transactions are selected', () => {
        const {transaction1, reports, policies, reportActions} = buildTestData();
        const result = canEditMultipleTransactions([transaction1], reportActions, reports, policies);

        expect(result).toBe(false);
    });

    it('returns false when any selected transaction has no editable fields', () => {
        const {transaction1, transaction2, reports, policies, reportActions} = buildTestData({disableSecondAction: true});

        const result = canEditMultipleTransactions([transaction1, transaction2], reportActions, reports, policies);

        expect(result).toBe(false);
    });

    it.each([
        CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        CONST.IOU.REPORT_ACTION_TYPE.REJECT,
        CONST.IOU.REPORT_ACTION_TYPE.CANCEL,
        CONST.IOU.REPORT_ACTION_TYPE.DELETE,
        CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
    ])('returns false when the IOU action type is %s', (actionType) => {
        const {transaction1, transaction2, reports, policies, reportActions, reportAction2} = buildTestData();

        reportAction2.originalMessage = {...reportAction2.originalMessage, type: actionType};

        const result = canEditMultipleTransactions([transaction1, transaction2], reportActions, reports, policies);

        expect(result).toBe(false);
    });

    it('returns false when the IOU action type is pay without IOU details', () => {
        const {transaction1, transaction2, reports, policies, reportActions, reportAction2} = buildTestData();

        reportAction2.originalMessage = {
            ...reportAction2.originalMessage,
            type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
            IOUDetails: undefined,
        };

        const result = canEditMultipleTransactions([transaction1, transaction2], reportActions, reports, policies);

        expect(result).toBe(false);
    });

    it('returns false when the IOU action is deleted', () => {
        const {transaction1, transaction2, reports, policies, reportActions, reportAction2} = buildTestData();

        reportAction2.originalMessage = {
            ...reportAction2.originalMessage,
            deleted: '2024-01-01',
        };

        const result = canEditMultipleTransactions([transaction1, transaction2], reportActions, reports, policies);

        expect(result).toBe(false);
    });

    it('returns false when any selected transaction belongs to a reimbursed report', () => {
        const {transaction1, transaction2, reports, policies, reportActions, report2} = buildTestData();

        report2.statusNum = CONST.REPORT.STATUS_NUM.REIMBURSED;

        const result = canEditMultipleTransactions([transaction1, transaction2], reportActions, reports, policies);

        expect(result).toBe(false);
    });

    it('returns false when selected entities are reports', () => {
        const {transaction1, transaction2, reports, policies, reportActions} = buildTestData();

        const result = canEditMultipleTransactions([transaction1, transaction2], reportActions, reports, policies, true);

        expect(result).toBe(false);
    });

    it('returns true when all selected transactions have an editable field', () => {
        const {transaction1, transaction2, reports, policies, reportActions} = buildTestData();

        const result = canEditMultipleTransactions([transaction1, transaction2], reportActions, reports, policies);

        expect(result).toBe(true);
    });
});
