import {randomInt} from 'crypto';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import type PolicyData from '@hooks/usePolicyData/types';
import {
    canDeleteReportAction,
    canShowReportRecipientLocalTime,
    findLastAccessedReport,
    getDisplayNamesWithTooltips,
    getIcons,
    getIconsForParticipants,
    getIOUReportActionDisplayMessage,
    // Will be fixed in https://github.com/Expensify/App/issues/76852
    // eslint-disable-next-line @typescript-eslint/no-deprecated
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
import type {PersonalDetails, Policy, Report, ReportAction, ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';
import {chatReportR14932 as chatReport} from '../../__mocks__/reportData/reports';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyCategories from '../utils/collections/policyCategory';
import createRandomPolicyTags from '../utils/collections/policyTags';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import {formatPhoneNumber, localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const getMockedReports = (length = 500) =>
    createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => createRandomReport(index, undefined),
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
        await measureFunction(() => canDeleteReportAction(reportAction, reportID, transaction, undefined, undefined));
    });

    test('[ReportUtils] getReportRecipientAccountID on 1k participants', async () => {
        const report = {...createRandomReport(1, undefined), participantAccountIDs};
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
        const report = {...createRandomReport(1, undefined), parentReportID: '1', parentReportActionID: '1', type: CONST.REPORT.TYPE.CHAT};
        const policy = createRandomPolicy(1);
        const defaultIcon = null;
        const defaultName = '';
        const defaultIconId = -1;

        await waitForBatchedUpdates();
        await measureFunction(() => getIcons(report, formatPhoneNumber, personalDetails, defaultIcon, defaultName, defaultIconId, policy));
    });

    test('[ReportUtils] getDisplayNamesWithTooltips 1k participants', async () => {
        const isMultipleParticipantReport = true;
        const shouldFallbackToHidden = true;

        await waitForBatchedUpdates();
        await measureFunction(() => getDisplayNamesWithTooltips(personalDetails, isMultipleParticipantReport, localeCompare, formatPhoneNumber, shouldFallbackToHidden));
    });

    test('[ReportUtils] getReportPreviewMessage on 1k policies', async () => {
        const reportAction = createRandomReportAction(1);
        const report = createRandomReport(1, undefined);
        const policy = createRandomPolicy(1);
        const shouldConsiderReceiptBeingScanned = true;
        const isPreviewMessageForParentChatReport = true;

        await waitForBatchedUpdates();
        await measureFunction(() => getReportPreviewMessage(report, reportAction, shouldConsiderReceiptBeingScanned, isPreviewMessageForParentChatReport, policy));
    });

    test('[ReportUtils] getReportName on 1k participants', async () => {
        const report = {...createRandomReport(1, undefined), participantAccountIDs};
        const policy = createRandomPolicy(1);

        await waitForBatchedUpdates();
        // Will be fixed in https://github.com/Expensify/App/issues/76852
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        await measureFunction(() => getReportName(report, policy));
    });

    test('[ReportUtils] canShowReportRecipientLocalTime on 1k participants', async () => {
        const report = {...createRandomReport(1, undefined), participantAccountIDs};
        const accountID = 1;

        await waitForBatchedUpdates();
        await measureFunction(() => canShowReportRecipientLocalTime(personalDetails, report, accountID));
    });

    test('[ReportUtils] shouldReportBeInOptionList on 1k participant', async () => {
        const report = {...createRandomReport(1, undefined), participantAccountIDs, type: CONST.REPORT.TYPE.CHAT};
        const currentReportId = '2';
        const isInFocusMode = true;
        const betas = [CONST.BETAS.DEFAULT_ROOMS];

        await waitForBatchedUpdates();
        await measureFunction(() =>
            shouldReportBeInOptionList({
                report,
                chatReport,
                currentReportId,
                isInFocusMode,
                betas,
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
                draftComment: undefined,
                isReportArchived: false,
            }),
        );
    });

    test('[ReportUtils] getWorkspaceIcon on 1k policies', async () => {
        const report = createRandomReport(1, undefined);
        const policy = createRandomPolicy(1);

        await waitForBatchedUpdates();
        await measureFunction(() => getWorkspaceIcon(report, policy));
    });

    test('[ReportUtils] getMoneyRequestOptions on 1k participants', async () => {
        const report = {...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT), isOwnPolicyExpenseChat: true};
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

    test('[ReportUtils] pushTransactionViolationsOnyxData on 1k reports with random expenses on each report', async () => {
        const policyID = '1';

        // Link report to the policy
        const reports = Object.values(getMockedReports(1000)).map((report) => ({
            ...report,
            policyID,
        }));

        const policyData: PolicyData = {
            reports,
            tags: createRandomPolicyTags('Tags', 8),
            categories: createRandomPolicyCategories(8),
            // Current policy with categories and tags enabled but does not require them
            policy: {
                ...createRandomPolicy(Number(policyID)),
                areCategoriesEnabled: true,
                areTagsEnabled: true,
                requiresCategory: false,
                requiresTag: false,
            },
            transactionsAndViolations: reports.reduce<ReportTransactionsAndViolationsDerivedValue>((acc, report, reportIndex) => {
                // Random number of transactions between 2 and 8
                const numOfTransactionsInReport = randomInt(2, 8);

                acc[report.reportID] = {transactions: {}, violations: {}};

                // Create transactions with no tag or category assigned and no violations, so `pushTransactionViolationsOnyxData` has to create the violations onyx data
                for (let transactionID = reportIndex * numOfTransactionsInReport; transactionID < (reportIndex + 1) * numOfTransactionsInReport; transactionID++) {
                    acc[report.reportID].transactions[transactionID] = {
                        ...createRandomTransaction(transactionID),
                        reportID: report.reportID,
                        category: undefined,
                        tag: undefined,
                    };
                }
                return acc;
            }, {}),
        };

        // Simulate a policy update data when requires categories and tags is updated eg (setRequiresCategory)
        const policyUpdateData: Partial<Policy> = {
            requiresCategory: true,
            requiresTag: true,
        };

        const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS> = {
            optimisticData: [],
            failureData: [],
            successData: [],
        };

        await measureFunction(() => pushTransactionViolationsOnyxData(onyxData, policyData, policyUpdateData));
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
        await measureFunction(() => getIOUReportActionDisplayMessage(translateLocal, reportAction));
    });
});
