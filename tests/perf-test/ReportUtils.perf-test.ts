import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, ReportAction} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const getMockedReports = (length = 500) =>
    createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => createRandomReport(index),
        length,
    );

const getMockedPolicies = (length = 500) =>
    createCollection<Policy>(
        (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
        (index) => createRandomPolicy(index),
        length,
    );

const personalDetails = createCollection<PersonalDetails>(
    (item) => item.accountID,
    (index) => createPersonalDetails(index),
    1000,
);

const mockedReportsMap = getMockedReports(1000) as Record<`${typeof ONYXKEYS.COLLECTION.REPORT}`, Report>;
const mockedPoliciesMap = getMockedPolicies(1000) as Record<`${typeof ONYXKEYS.COLLECTION.POLICY}`, Policy>;
const participantAccountIDs = Array.from({length: 1000}, (v, i) => i + 1);

describe('ReportUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(async () => {
        await Onyx.multiSet({
            ...mockedPoliciesMap,
            ...mockedReportsMap,
        });
    });

    afterAll(() => {
        Onyx.clear();
    });

    test('[ReportUtils] findLastAccessedReport on 2k reports and policies', async () => {
        const ignoreDomainRooms = true;
        const reports = getMockedReports(2000);
        const policies = getMockedPolicies(2000);
        const openOnAdminRoom = true;

        await Onyx.multiSet({
            [ONYXKEYS.COLLECTION.REPORT]: reports,
            [ONYXKEYS.COLLECTION.POLICY]: policies,
        });

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.findLastAccessedReport(ignoreDomainRooms, openOnAdminRoom));
    });

    test('[ReportUtils] canDeleteReportAction on 1k reports and policies', async () => {
        const reportID = '1';
        const reportAction = {...createRandomReportAction(1), actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT} as unknown as ReportAction;

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.canDeleteReportAction(reportAction, reportID));
    });

    test('[ReportUtils] getReportRecipientAccountID on 1k participants', async () => {
        const report = {...createRandomReport(1), participantAccountIDs};
        const currentLoginAccountID = 1;

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.getReportRecipientAccountIDs(report, currentLoginAccountID));
    });

    test('[ReportUtils] getIconsForParticipants on 1k participants', async () => {
        const participants = Array.from({length: 1000}, (v, i) => i + 1);

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.getIconsForParticipants(participants, personalDetails));
    });

    test('[ReportUtils] getIcons on 1k participants', async () => {
        const report = {...createRandomReport(1), parentReportID: '1', parentReportActionID: '1', type: CONST.REPORT.TYPE.CHAT};
        const policy = createRandomPolicy(1);
        const defaultIcon = null;
        const defaultName = '';
        const defaultIconId = -1;

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.getIcons(report, personalDetails, defaultIcon, defaultName, defaultIconId, policy));
    });

    test('[ReportUtils] getDisplayNamesWithTooltips 1k participants', async () => {
        const isMultipleParticipantReport = true;
        const shouldFallbackToHidden = true;

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.getDisplayNamesWithTooltips(personalDetails, isMultipleParticipantReport, shouldFallbackToHidden));
    });

    test('[ReportUtils] getReportPreviewMessage on 1k policies', async () => {
        const reportAction = createRandomReportAction(1);
        const report = createRandomReport(1);
        const policy = createRandomPolicy(1);
        const shouldConsiderReceiptBeingScanned = true;
        const isPreviewMessageForParentChatReport = true;

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.getReportPreviewMessage(report, reportAction, shouldConsiderReceiptBeingScanned, isPreviewMessageForParentChatReport, policy));
    });

    test('[ReportUtils] getReportName on 1k participants', async () => {
        const report = {...createRandomReport(1), chatType: undefined, participantAccountIDs};
        const policy = createRandomPolicy(1);

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.getReportName({report, policy}));
    });

    test('[ReportUtils] canShowReportRecipientLocalTime on 1k participants', async () => {
        const report = {...createRandomReport(1), participantAccountIDs};
        const accountID = 1;

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.canShowReportRecipientLocalTime(personalDetails, report, accountID));
    });

    test('[ReportUtils] shouldReportBeInOptionList on 1k participant', async () => {
        const report = {...createRandomReport(1), participantAccountIDs, type: CONST.REPORT.TYPE.CHAT};
        const currentReportId = '2';
        const isInFocusMode = true;
        const betas = [CONST.BETAS.DEFAULT_ROOMS];
        const policies = getMockedPolicies();

        await waitForBatchedUpdates();
        await measureFunction(() =>
            ReportUtils.shouldReportBeInOptionList({report, currentReportId, isInFocusMode, betas, policies, doesReportHaveViolations: false, excludeEmptyChats: false}),
        );
    });

    test('[ReportUtils] getWorkspaceIcon on 1k policies', async () => {
        const report = createRandomReport(1);
        const policy = createRandomPolicy(1);

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.getWorkspaceIcon(report, policy));
    });

    test('[ReportUtils] getMoneyRequestOptions on 1k participants', async () => {
        const report = {...createRandomReport(1), type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: true};
        const policy = createRandomPolicy(1);
        const reportParticipants = Array.from({length: 1000}, (v, i) => i + 1);

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.temporary_getMoneyRequestOptions(report, policy, reportParticipants));
    });

    test('[ReportUtils] getWorkspaceChat on 1k policies', async () => {
        const policyID = '1';
        const accountsID = Array.from({length: 20}, (v, i) => i + 1);

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.getWorkspaceChats(policyID, accountsID));
    });

    test('[ReportUtils] getTransactionDetails on 1k reports', async () => {
        const transaction = createRandomTransaction(1);

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.getTransactionDetails(transaction, 'yyyy-MM-dd'));
    });

    test('[ReportUtils] getIOUReportActionDisplayMessage on 1k policies', async () => {
        const reportAction = {
            ...createRandomReportAction(1),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                IOUReportID: '1',
                IOUTransactionID: '1',
                amount: 100,
                participantAccountID: 1,
                currency: CONST.CURRENCY.USD,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            },
        };

        await waitForBatchedUpdates();
        await measureFunction(() => ReportUtils.getIOUReportActionDisplayMessage(reportAction));
    });
});
