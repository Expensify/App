import {getBrickRoadForPolicy, getChatTabBrickRoad, getChatTabBrickRoadReportID, getLeaveWorkspaceConfirmationPrompt, getWorkspaceAddressStreetLines} from '@libs/WorkspacesSettingsUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, ReportActions, Transaction, TransactionViolations} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import mockData from './WorkspacesSettingsUtilsTest.json';

const reportActionID = '8722650843049927838';

const reports = {
    [`${ONYXKEYS.COLLECTION.REPORT}4286515777714555`]: createMock<Report>({
        ...mockData.reports.report_4286515777714555,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    }),
    [`${ONYXKEYS.COLLECTION.REPORT}6955627196303088`]: createMock<Report>({
        ...mockData.reports.report_6955627196303088,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    }),
} satisfies Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, Report>;

const reportActions = {
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}6955627196303088`]: createMock<ReportActions>({
        [reportActionID]: createMock<ReportAction>({
            ...mockData.reportActions.reportActions_6955627196303088[reportActionID],
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
        }),
    }),
} satisfies Record<`${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}${string}`, ReportActions>;

const transactionViolations = {
    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}3106135972713435169`]: [
        {
            name: CONST.VIOLATIONS.MISSING_CATEGORY,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            showInReview: true,
        },
    ],
    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}3690687111940510713`]: [
        {
            name: CONST.VIOLATIONS.MISSING_CATEGORY,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            showInReview: true,
        },
    ],
} satisfies Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${string}`, TransactionViolations>;

describe('WorkspacesSettingsUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        Onyx.clear([ONYXKEYS.NVP_PREFERRED_LOCALE]).then(waitForBatchedUpdates);
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });
    describe('getBrickRoadForPolicy', () => {
        it('Should return "error"', async () => {
            const report = Object.values(mockData.reports)?.at(0);
            const session = mockData.session;
            const transactions = mockData.transactions;

            await Onyx.multiSet({
                session,
                ...createMock<ReportCollectionDataSet>(reports),
                ...createMock<OnyxCollection<ReportActions>>(reportActions),
                ...createMock<OnyxCollection<TransactionViolations>>(transactionViolations),
                ...createMock<OnyxCollection<Transaction>>(transactions),
            });

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            // eslint-disable-next-line rulesdir/no-default-id-values
            const result = getBrickRoadForPolicy(report?.reportID ?? '', reportAttributes?.reports);

            // The result should be 'error' because there is at least one IOU action associated with a transaction that has a violation.
            expect(result).toBe('error');
        });

        it('Should return "undefined"', async () => {
            const report = Object.values(mockData.reports)?.at(0);
            const session = mockData.session;

            await Onyx.multiSet({
                ...createMock<ReportCollectionDataSet>(reports),
                ...createMock<OnyxCollection<ReportActions>>(reportActions),
                session,
            });

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            // eslint-disable-next-line rulesdir/no-default-id-values
            const result = getBrickRoadForPolicy(report?.reportID ?? '', reportAttributes?.reports);

            // Then the result should be 'undefined' since no IOU action is linked to a transaction with a violation.
            expect(result).toBe(undefined);
        });
    });

    describe('getChatTabBrickRoadReportID', () => {
        it('Should return "error"', async () => {
            const session = mockData.session;
            const transactions = mockData.transactions;

            await Onyx.multiSet({
                session,
                ...createMock<ReportCollectionDataSet>(reports),
                ...createMock<OnyxCollection<ReportActions>>(reportActions),
                ...createMock<OnyxCollection<TransactionViolations>>(transactionViolations),
                ...createMock<OnyxCollection<Transaction>>(transactions),
            });

            const reportIDs = Object.values(reports).map((report) => report.reportID);

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            const result = getChatTabBrickRoadReportID(reportIDs, reportAttributes?.reports);

            // The result should be '4286515777714555' as it is the reportID associated with the violation.
            expect(result).toBe('4286515777714555');
        });

        it('Should return "undefined"', async () => {
            const session = mockData.session;

            await Onyx.multiSet({
                ...createMock<ReportCollectionDataSet>(reports),
                ...createMock<OnyxCollection<ReportActions>>(reportActions),
                session,
            });

            const reportIDs = Object.values(reports).map((report) => report.reportID);

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            const result = getChatTabBrickRoadReportID(reportIDs, reportAttributes?.reports);

            // Then the result should be 'undefined' since no IOU action is linked to a transaction with a violation.
            expect(result).toBe(undefined);
        });
    });

    describe('getChatTabBrickRoad', () => {
        it('Should return reportID which has "error"', async () => {
            const session = mockData.session;
            const transactions = mockData.transactions;

            await Onyx.multiSet({
                session,
                ...createMock<ReportCollectionDataSet>(reports),
                ...createMock<OnyxCollection<ReportActions>>(reportActions),
                ...createMock<OnyxCollection<TransactionViolations>>(transactionViolations),
                ...createMock<OnyxCollection<Transaction>>(transactions),
            });

            const reportIDs = Object.values(reports).map((report) => report.reportID);

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            const result = getChatTabBrickRoad(reportIDs, reportAttributes?.reports);

            // The result should be 'error' due to violation present in the reports.
            expect(result).toBe('error');
        });

        it('Should return "undefined"', async () => {
            const session = mockData.session;

            await Onyx.multiSet({
                ...createMock<ReportCollectionDataSet>(reports),
                ...createMock<OnyxCollection<ReportActions>>(reportActions),
                session,
            });

            const reportIDs = Object.values(reports).map((report) => report.reportID);

            await waitForBatchedUpdates();
            const reportAttributes = await OnyxUtils.get(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES);

            const result = getChatTabBrickRoad(reportIDs, reportAttributes?.reports);

            // Then the result should be 'undefined' since no IOU action is linked to a transaction with a violation.
            expect(result).toBe(undefined);
        });
    });

    describe('getWorkspaceAddressStreetLines', () => {
        it('Should prefer explicit street line 2 over legacy newline value', () => {
            const result = getWorkspaceAddressStreetLines('123 Main St\nLegacy Line 2', 'Suite 200');

            expect(result).toEqual({
                streetLineOne: '123 Main St',
                streetLineTwo: 'Suite 200',
            });
        });

        it('Should fallback to legacy newline street line 2 when explicit line 2 is missing', () => {
            const result = getWorkspaceAddressStreetLines('123 Main St\nLegacy Line 2');

            expect(result).toEqual({
                streetLineOne: '123 Main St',
                streetLineTwo: 'Legacy Line 2',
            });
        });

        it('Should fallback to legacy newline street line 2 when explicit line 2 is empty', () => {
            const result = getWorkspaceAddressStreetLines('123 Main St\nLegacy Line 2', '   ');

            expect(result).toEqual({
                streetLineOne: '123 Main St',
                streetLineTwo: 'Legacy Line 2',
            });
        });
    });

    describe('getLeaveWorkspaceConfirmationPrompt', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Translation parameters are required by the production callback signature; this stub intentionally returns only the key.
        const translate = <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => path;
        const userEmail = 'user@example.com';
        const ownerDisplayName = 'Workspace Owner';

        it('returns reimburser key when user is the reimbursement contact', () => {
            const policy = createMock<Policy>({achAccount: {reimburser: userEmail}});
            expect(getLeaveWorkspaceConfirmationPrompt(policy, userEmail, ownerDisplayName, translate)).toBe('common.leaveWorkspaceReimburser');
        });

        it('returns technicalContact key when user is the technical contact', () => {
            const policy = createMock<Policy>({technicalContact: userEmail});
            expect(getLeaveWorkspaceConfirmationPrompt(policy, userEmail, ownerDisplayName, translate)).toBe('common.leaveWorkspaceConfirmationTechContact');
        });

        it('returns exporter key when user is an accounting connection exporter', () => {
            const policy = createMock<Policy>({connections: {quickbooksOnline: {config: {export: {exporter: userEmail}}}}});
            expect(getLeaveWorkspaceConfirmationPrompt(policy, userEmail, ownerDisplayName, translate)).toBe('common.leaveWorkspaceConfirmationExporter');
        });

        it('returns approver key when user is an approver', () => {
            const policy = createMock<Policy>({approver: userEmail});
            expect(getLeaveWorkspaceConfirmationPrompt(policy, userEmail, ownerDisplayName, translate)).toBe('common.leaveWorkspaceConfirmationApprover');
        });

        it('returns admin key when the policy role is admin', () => {
            const policy = createMock<Policy>({role: CONST.POLICY.ROLE.ADMIN});
            expect(getLeaveWorkspaceConfirmationPrompt(policy, userEmail, ownerDisplayName, translate)).toBe('common.leaveWorkspaceConfirmationAdmin');
        });

        it('returns auditor key when the policy role is auditor', () => {
            const policy = createMock<Policy>({role: CONST.POLICY.ROLE.AUDITOR});
            expect(getLeaveWorkspaceConfirmationPrompt(policy, userEmail, ownerDisplayName, translate)).toBe('common.leaveWorkspaceConfirmationAuditor');
        });

        it('returns default key when user has no special role', () => {
            const policy = createMock<Policy>({});
            expect(getLeaveWorkspaceConfirmationPrompt(policy, userEmail, ownerDisplayName, translate)).toBe('common.leaveWorkspaceConfirmation');
        });
    });
});
