import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import createRandomPolicyCategories from 'tests/utils/collections/policyCategory';
import createRandomPolicyTags from 'tests/utils/collections/policyTags';
import {
    canDeleteReportAction,
    canShowReportRecipientLocalTime,
    findLastAccessedReport,
    getDisplayNamesWithTooltips,
    getIcons,
    getIconsForParticipants,
    getIOUReportActionDisplayMessage,
    getReportName,
    getReportPreviewMessage,
    getReportRecipientAccountIDs,
    getTransactionDetails,
    getWorkspaceChats,
    getWorkspaceIcon,
    pushTransactionViolationsOnyxData,
    shouldReportBeInOptionList,
    temporary_getMoneyRequestOptions,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, ReportAction, Transaction} from '@src/types/onyx';
import {chatReportR14932 as chatReport} from '../../__mocks__/reportData/reports';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
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
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
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
        await measureFunction(() => findLastAccessedReport(ignoreDomainRooms, openOnAdminRoom));
    });

    test('[ReportUtils] canDeleteReportAction on 1k reports and policies', async () => {
        const reportID = '1';
        const transaction = createRandomTransaction(1);
        const reportAction = {...createRandomReportAction(1), actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT} as unknown as ReportAction;

        await waitForBatchedUpdates();
        await measureFunction(() => canDeleteReportAction(reportAction, reportID, transaction));
    });

    test('[ReportUtils] getReportRecipientAccountID on 1k participants', async () => {
        const report = {...createRandomReport(1), participantAccountIDs};
        const currentLoginAccountID = 1;

        await waitForBatchedUpdates();
        await measureFunction(() => getReportRecipientAccountIDs(report, currentLoginAccountID));
    });

    test('[ReportUtils] getIconsForParticipants on 1k participants', async () => {
        const participants = Array.from({length: 1000}, (v, i) => i + 1);

        await waitForBatchedUpdates();
        await measureFunction(() => getIconsForParticipants(participants, personalDetails));
    });

    test('[ReportUtils] getIcons on 1k participants', async () => {
        const report = {...createRandomReport(1), parentReportID: '1', parentReportActionID: '1', type: CONST.REPORT.TYPE.CHAT};
        const policy = createRandomPolicy(1);
        const defaultIcon = null;
        const defaultName = '';
        const defaultIconId = -1;

        await waitForBatchedUpdates();
        await measureFunction(() => getIcons(report, personalDetails, defaultIcon, defaultName, defaultIconId, policy));
    });

    test('[ReportUtils] getDisplayNamesWithTooltips 1k participants', async () => {
        const isMultipleParticipantReport = true;
        const shouldFallbackToHidden = true;

        await waitForBatchedUpdates();
        await measureFunction(() => getDisplayNamesWithTooltips(personalDetails, isMultipleParticipantReport, shouldFallbackToHidden));
    });

    test('[ReportUtils] getReportPreviewMessage on 1k policies', async () => {
        const reportAction = createRandomReportAction(1);
        const report = createRandomReport(1);
        const policy = createRandomPolicy(1);
        const shouldConsiderReceiptBeingScanned = true;
        const isPreviewMessageForParentChatReport = true;

        await waitForBatchedUpdates();
        await measureFunction(() => getReportPreviewMessage(report, reportAction, shouldConsiderReceiptBeingScanned, isPreviewMessageForParentChatReport, policy));
    });

    test('[ReportUtils] getReportName on 1k participants', async () => {
        const report = {...createRandomReport(1), chatType: undefined, participantAccountIDs};
        const policy = createRandomPolicy(1);

        await waitForBatchedUpdates();
        await measureFunction(() => getReportName(report, policy));
    });

    test('[ReportUtils] canShowReportRecipientLocalTime on 1k participants', async () => {
        const report = {...createRandomReport(1), participantAccountIDs};
        const accountID = 1;

        await waitForBatchedUpdates();
        await measureFunction(() => canShowReportRecipientLocalTime(personalDetails, report, accountID));
    });

    test('[ReportUtils] shouldReportBeInOptionList on 1k participant', async () => {
        const report = {...createRandomReport(1), participantAccountIDs, type: CONST.REPORT.TYPE.CHAT};
        const currentReportId = '2';
        const isInFocusMode = true;
        const betas = [CONST.BETAS.DEFAULT_ROOMS];

        await waitForBatchedUpdates();
        await measureFunction(() => shouldReportBeInOptionList({report, chatReport, currentReportId, isInFocusMode, betas, doesReportHaveViolations: false, excludeEmptyChats: false}));
    });

    test('[ReportUtils] getWorkspaceIcon on 1k policies', async () => {
        const report = createRandomReport(1);
        const policy = createRandomPolicy(1);

        await waitForBatchedUpdates();
        await measureFunction(() => getWorkspaceIcon(report, policy));
    });

    test('[ReportUtils] getMoneyRequestOptions on 1k participants', async () => {
        const report = {...createRandomReport(1), type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: true};
        const policy = createRandomPolicy(1);
        const reportParticipants = Array.from({length: 1000}, (v, i) => i + 1);

        await waitForBatchedUpdates();
        await measureFunction(() => temporary_getMoneyRequestOptions(report, policy, reportParticipants));
    });

    test('[ReportUtils] getWorkspaceChat on 1k policies', async () => {
        const policyID = '1';
        const accountsID = Array.from({length: 20}, (v, i) => i + 1);

        await waitForBatchedUpdates();
        await measureFunction(() => getWorkspaceChats(policyID, accountsID));
    });

    test('[ReportUtils] getTransactionDetails on 1k reports', async () => {
        const transaction = createRandomTransaction(1);

        await waitForBatchedUpdates();
        await measureFunction(() => getTransactionDetails(transaction, 'yyyy-MM-dd'));
    });

    test('[ReportUtils] pushTransactionViolationsOnyxData on 1k reports with 3 transactions on each report', async () => {
        // Current policy with categories and tags enabled but does not require them
        const policy = {
            ...createRandomPolicy(1),
            areCategoriesEnabled: true,
            requiresCategory: false,
            areTagsEnabled: true,
            requiresTag: false,
        };

        // Simulate a policy optimistic data when requires categories and tags is updated eg (setRequiresCategory)
        const policyOptimisticData = {
            requiresCategory: true,
            requiresTag: true,
        };

        // Create a report collection with 1000 reports linked to the policy
        const reportCollection = Object.values(getMockedReports(1000)).reduce<Record<string, Report>>((acc, report) => {
            acc[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = {
                ...report,
                policyID: policy.id,
            };
            return acc;
        }, {});

        // Create a transaction collection with 3 transactions for each report
        const transactionCollection = Object.values(reportCollection).reduce<Record<string, Transaction>>((acc, report, index) => {
            for (let transactionIndex = 0; transactionIndex < 3; transactionIndex++) {
                const transactionID = index + transactionIndex * 1000;
                // Create a transaction with no category and no tag
                acc[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = {
                    ...createRandomTransaction(transactionID),
                    reportID: report.reportID,
                    category: undefined,
                };
            }
            return acc;
        }, {});

        const reportActionsCollection = Object.values(transactionCollection).reduce<Record<string, Record<string, ReportAction>>>((acc, transaction, index) => {
            acc[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`] = {
                [index.toString()]: {
                    ...createRandomReportAction(index + 1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        IOUReportID: transaction.reportID,
                        IOUTransactionID: transaction.transactionID,
                        amount: transaction.amount,
                        currency: transaction.currency,
                    },
                },
            };
            return acc;
        }, {});

        await Onyx.multiSet({
            ...reportCollection,
            ...transactionCollection,
            ...reportActionsCollection,
            [ONYXKEYS.COLLECTION.POLICY]: {[policy.id]: policy},
        });

        const policyTags = createRandomPolicyTags('Tags', 8);
        const policyCategories = createRandomPolicyCategories(8);

        await waitForBatchedUpdates();
        await measureFunction(() => pushTransactionViolationsOnyxData({}, policy, policyCategories, policyTags, {}, policyOptimisticData, {}, {}));
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
        await measureFunction(() => getIOUReportActionDisplayMessage(reportAction));
    });
});
