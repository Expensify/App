import {getWorkspaceAddressStreetLines} from '@libs/WorkspaceDisplayUtils';
import {
    getBrickRoadForPolicy,
    getBulkActionSkippedNotice,
    getBulkArchiveWorkspacesConfirmationPrompt,
    getBulkLeaveWorkspacesConfirmationPrompt,
    getChatTabBrickRoad,
    getChatTabBrickRoadReportID,
    getLeaveWorkspaceConfirmationPrompt,
    getWorkspacesBulkActions,
} from '@libs/WorkspacesSettingsUtils';
import type {WorkspacesBulkActionContext, WorkspacesBulkActionRow} from '@libs/WorkspacesSettingsUtils';

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

        it('returns approver key when user approves outstanding reports without being in the approval workflow', () => {
            const policy = createMock<Policy>({role: CONST.POLICY.ROLE.ADMIN});
            expect(getLeaveWorkspaceConfirmationPrompt(policy, userEmail, ownerDisplayName, translate, true)).toBe('common.leaveWorkspaceConfirmationApprover');
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

    describe('getBulkLeaveWorkspacesConfirmationPrompt', () => {
        // The stub keeps the owner name in the output so the tests can tell the owner groups apart.
        const translate = <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => [path, ...parameters].join(':');
        const userEmail = 'user@example.com';
        const buildWorkspace = (name: string, policy: Policy, ownerDisplayName = 'Owner A') => ({
            policy,
            name,
            ownerDisplayName,
            isApproverOfOutstandingReports: false,
        });

        it('uses the singular warning for a single workspace and the plural one for several', () => {
            // Given one workspace the user audits and two they administer
            const workspaces = [
                buildWorkspace('Admin 1', createMock<Policy>({role: CONST.POLICY.ROLE.ADMIN})),
                buildWorkspace('Auditor 1', createMock<Policy>({role: CONST.POLICY.ROLE.AUDITOR})),
                buildWorkspace('Admin 2', createMock<Policy>({role: CONST.POLICY.ROLE.ADMIN})),
            ];

            // When the bulk leave prompt is built
            const prompt = getBulkLeaveWorkspacesConfirmationPrompt(workspaces, userEmail, translate);

            // Then each warning lists its workspaces, worded for how many it covers, with auditor before admin
            expect(prompt).toBe(
                `common.leaveWorkspaceConfirmationAuditor\n${CONST.DOT_SEPARATOR} Auditor 1\n\ncommon.leaveWorkspacesConfirmationAdmin\n${CONST.DOT_SEPARATOR} Admin 1\n${CONST.DOT_SEPARATOR} Admin 2`,
            );
        });

        it('groups the warnings that name the owner by owner', () => {
            // Given the user approves in three workspaces owned by two different people
            const workspaces = [
                buildWorkspace('Approver 1', createMock<Policy>({approver: userEmail}), 'Owner A'),
                buildWorkspace('Approver 2', createMock<Policy>({approver: userEmail}), 'Owner B'),
                buildWorkspace('Approver 3', createMock<Policy>({approver: userEmail}), 'Owner A'),
            ];

            // When the bulk leave prompt is built
            const prompt = getBulkLeaveWorkspacesConfirmationPrompt(workspaces, userEmail, translate);

            // Then each owner gets their own warning, so the owner named in it is right for every workspace listed under it
            expect(prompt).toBe(
                `common.leaveWorkspacesConfirmationApprover:Owner A\n${CONST.DOT_SEPARATOR} Approver 1\n${CONST.DOT_SEPARATOR} Approver 3\n\ncommon.leaveWorkspaceConfirmationApprover:Owner B\n${CONST.DOT_SEPARATOR} Approver 2`,
            );
        });

        it('lists the workspaces the user pays for last', () => {
            // Given the user is the payer of one workspace and a member of another
            const workspaces = [buildWorkspace('Payer 1', createMock<Policy>({achAccount: {reimburser: userEmail}})), buildWorkspace('Member 1', createMock<Policy>({}))];

            // When the bulk leave prompt is built
            const prompt = getBulkLeaveWorkspacesConfirmationPrompt(workspaces, userEmail, translate);

            // Then the payer warning comes after the warnings for the workspaces being left
            expect(prompt).toBe(`common.leaveWorkspaceConfirmation\n${CONST.DOT_SEPARATOR} Member 1\n\ncommon.leaveWorkspaceReimburser\n${CONST.DOT_SEPARATOR} Payer 1`);
        });
    });

    describe('getBulkActionSkippedNotice', () => {
        it('names the skipped workspaces and how many the action applies to', () => {
            // Given an action that applies to one of three selected workspaces
            // When the notice is built
            const notice = getBulkActionSkippedNotice(1, 3, ['Skipped 1', 'Skipped 2'], TestHelper.translateLocal);

            // Then it says how many workspaces the action covers and lists the ones it leaves out
            expect(notice).toBe('This applies to 1 of the 3 selected workspaces. These will be skipped: Skipped 1, Skipped 2.');
        });

        it('names a single skipped workspace in the singular', () => {
            // Given an action that applies to one of two selected workspaces
            // When the notice is built
            const notice = getBulkActionSkippedNotice(1, 2, ['Acme'], TestHelper.translateLocal);

            // Then the sentence is worded for one workspace
            expect(notice).toBe('This applies to 1 of the 2 selected workspaces. This will be skipped: Acme.');
        });

        it('is empty when the action applies to every selected workspace', () => {
            // Given an action that skips none of the selected workspaces
            // When the notice is built
            const notice = getBulkActionSkippedNotice(2, 2, [], TestHelper.translateLocal);

            // Then there is nothing to tell the user
            expect(notice).toBe('');
        });
    });

    describe('getBulkArchiveWorkspacesConfirmationPrompt', () => {
        const translate = <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => [path, ...parameters].join(':');

        it('lists each workspace under the card warning that applies to it', () => {
            // Given two workspaces with Expensify Cards, one with other cards and one without any cards
            const workspaces = [
                {name: 'Expensify 1', hasExpensifyCards: true, hasCards: true},
                {name: 'Company 1', hasExpensifyCards: false, hasCards: true},
                {name: 'No cards', hasExpensifyCards: false, hasCards: false},
                {name: 'Expensify 2', hasExpensifyCards: true, hasCards: true},
            ];

            // When the bulk archive prompt is built
            const prompt = getBulkArchiveWorkspacesConfirmationPrompt(workspaces, translate);

            // Then a workspace with Expensify Cards only gets that warning, like the single archive confirmation, and the workspace without cards isn't listed
            expect(prompt).toBe(
                `workspace.common.archiveWorkspacesWithExpensifyCardsConfirmation\n${CONST.DOT_SEPARATOR} Expensify 1\n${CONST.DOT_SEPARATOR} Expensify 2\n\nworkspace.common.archiveWithThirdPartyCardsConfirmation\n${CONST.DOT_SEPARATOR} Company 1`,
            );
        });

        it('returns an empty prompt when none of the workspaces have cards', () => {
            // Given workspaces without any cards
            const workspaces = [
                {name: 'No cards 1', hasExpensifyCards: false, hasCards: false},
                {name: 'No cards 2', hasExpensifyCards: false, hasCards: false},
            ];

            // When the bulk archive prompt is built
            const prompt = getBulkArchiveWorkspacesConfirmationPrompt(workspaces, translate);

            // Then there is no card warning to show
            expect(prompt).toBe('');
        });
    });

    describe('getWorkspacesBulkActions', () => {
        const currentUserAccountID = 1;
        const context: WorkspacesBulkActionContext = {
            currentUserAccountID,
            isRestrictedToPreferredPolicy: false,
            canArchivePolicies: true,
            canRenderTransferOwnerButton: true,
        };
        const buildRow = (overrides: Partial<WorkspacesBulkActionRow>): WorkspacesBulkActionRow => ({
            policyID: 'owned',
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.CORPORATE,
            ownerAccountID: currentUserAccountID,
            isArchived: false,
            isDefault: false,
            isJoinRequestPending: false,
            isEligibleToCopy: true,
            isReimburser: false,
            ...overrides,
        });
        const ownedWorkspace = buildRow({});
        const otherOwnersWorkspace = buildRow({policyID: 'other', ownerAccountID: 2});

        it('offers every applicable action in the fixed order when one workspace is selected', () => {
            // Given one selected workspace the user owns and administers

            // When the bulk actions are built
            const actions = getWorkspacesBulkActions([ownedWorkspace], context);

            // Then the single workspace actions are offered before Archive, and Transfer owner and Leave are left out because the user owns it
            expect(actions.map((action) => action.type)).toEqual([
                CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.SET_AS_DEFAULT,
                CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.EXPORT_MEMBERS,
                CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.COPY_SETTINGS,
                CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.DUPLICATE,
                CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.ARCHIVE,
            ]);
        });

        it('drops the single workspace actions and keeps the qualifying workspaces when several are selected', () => {
            // Given one owned workspace and one owned by someone else are selected

            // When the bulk actions are built
            const actions = getWorkspacesBulkActions([ownedWorkspace, otherOwnersWorkspace], context);

            // Then each action is offered once and runs only on the workspaces it applies to, so the rest are skipped
            expect(actions).toEqual([
                {type: CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.EXPORT_MEMBERS, policyIDs: ['owned', 'other']},
                {type: CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.TRANSFER_OWNER, policyIDs: ['other']},
                {type: CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.ARCHIVE, policyIDs: ['owned']},
                {type: CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.LEAVE, policyIDs: ['other']},
            ]);
        });

        it('offers Delete for one workspace only when archiving is not available', () => {
            // Given the archive beta is off
            const contextWithoutArchive = {...context, canArchivePolicies: false};

            // When one owned workspace is selected, and then two
            const singleSelectionTypes = getWorkspacesBulkActions([ownedWorkspace], contextWithoutArchive).map((action) => action.type);
            const multipleSelectionTypes = getWorkspacesBulkActions([ownedWorkspace, buildRow({policyID: 'owned2'})], contextWithoutArchive).map((action) => action.type);

            // Then Delete replaces Archive, and like today it works on one workspace at a time
            expect(singleSelectionTypes).toContain(CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.DELETE);
            expect(singleSelectionTypes).not.toContain(CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.ARCHIVE);
            expect(multipleSelectionTypes).not.toContain(CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.DELETE);
        });

        it('offers Unarchive and Transfer owner only on an archived workspace', () => {
            // Given an archived workspace the user owns, and an archived one they only administer
            const archivedOwned = buildRow({isArchived: true});
            const archivedAdministered = buildRow({policyID: 'other', ownerAccountID: 2, isArchived: true});

            // When each one is selected on its own
            const ownedTypes = getWorkspacesBulkActions([archivedOwned], context).map((action) => action.type);
            const administeredTypes = getWorkspacesBulkActions([archivedAdministered], context).map((action) => action.type);

            // Then the owner can unarchive it and an admin can transfer it, but nothing that changes an archived workspace is offered
            expect(ownedTypes).toEqual([CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.UNARCHIVE]);
            expect(administeredTypes).toEqual([CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.TRANSFER_OWNER]);
        });

        it('offers Export members only to roles that can manage members', () => {
            // Given a workspace where the user is a plain member, and a Collect workspace where they are a People Admin
            const memberWorkspace = buildRow({policyID: 'member', role: CONST.POLICY.ROLE.USER, ownerAccountID: 2});
            const peopleAdminOnTeam = buildRow({policyID: 'team', role: CONST.POLICY.ROLE.PEOPLE_ADMIN, type: CONST.POLICY.TYPE.TEAM, ownerAccountID: 2});
            const peopleAdminOnControl = buildRow({policyID: 'control', role: CONST.POLICY.ROLE.PEOPLE_ADMIN, ownerAccountID: 2});

            // When all three are selected
            const exportAction = getWorkspacesBulkActions([memberWorkspace, peopleAdminOnTeam, peopleAdminOnControl], context).find(
                (action) => action.type === CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.EXPORT_MEMBERS,
            );

            // Then only the Control workspace is exported, matching who sees Download CSV on the Members page
            expect(exportAction?.policyIDs).toEqual(['control']);
        });

        it('skips the workspaces the user reimburses when leaving several at once', () => {
            // Given two workspaces owned by someone else, and the user is the reimburser on one of them
            const reimbursedWorkspace = buildRow({policyID: 'reimbursed', ownerAccountID: 2, isReimburser: true});

            // When both are selected, and then only the reimbursed one
            const multipleLeaveAction = getWorkspacesBulkActions([otherOwnersWorkspace, reimbursedWorkspace], context).find(
                (action) => action.type === CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.LEAVE,
            );
            const singleSelectionTypes = getWorkspacesBulkActions([reimbursedWorkspace], context).map((action) => action.type);

            // Then the bulk leave skips the reimbursed workspace, while selecting it alone keeps Leave so its flow can explain the block
            expect(multipleLeaveAction?.policyIDs).toEqual(['other']);
            expect(singleSelectionTypes).toContain(CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.LEAVE);
        });

        it('hides Set as default and Leave for the preferred workspace when the user is restricted to it', () => {
            // Given the user is restricted to their preferred workspace, which someone else owns
            const restrictedContext = {...context, isRestrictedToPreferredPolicy: true, preferredPolicyID: 'other'};

            // When that workspace is selected
            const types = getWorkspacesBulkActions([otherOwnersWorkspace], restrictedContext).map((action) => action.type);

            // Then neither action is offered, as the restriction already prevents both today
            expect(types).not.toContain(CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.SET_AS_DEFAULT);
            expect(types).not.toContain(CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.LEAVE);
        });
    });
});
