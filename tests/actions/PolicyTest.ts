import {Str} from 'expensify-common';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {WRITE_COMMANDS} from '@libs/API/types';
import GoogleTagManager from '@libs/GoogleTagManager';
// eslint-disable-next-line no-restricted-syntax
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
// eslint-disable-next-line no-restricted-syntax -- this is needed to allow mocking
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import {askToJoinPolicy, joinAccessiblePolicy} from '@src/libs/actions/Policy/Member';
import * as Policy from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Onboarding, PolicyJoinMember, PolicyReportField, Policy as PolicyType, Report, ReportAction, ReportActions, TransactionViolations} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/Report';
import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ESH_EMAIL = 'eshgupta1217@gmail.com';
const ESH_ACCOUNT_ID = 1;
const ESH_PARTICIPANT_ADMINS_ROOM: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
const ESH_PARTICIPANT_EXPENSE_CHAT = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
const WORKSPACE_NAME = "Esh's Workspace";
const EMPLOYEE_EMAIL = 'employee@example.com';
const TEST_EMAIL = 'esh@gmail.com';
const TEST_EMAIL_2 = 'eshofficial@gmail.com';
const TEST_ACCOUNT_ID = 1;
const TEST_DISPLAY_NAME = 'Esh Gupta';
const TEST_PHONE_NUMBER = '1234567890';
const TEST_NON_PUBLIC_DOMAIN_EMAIL = 'esh@example.com';
const TEST_SMS_DOMAIN_EMAIL = 'esh@expensify.sms';

jest.mock('@libs/GoogleTagManager');

OnyxUpdateManager();
describe('actions/Policy', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    let mockFetch: MockFetch;
    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        IntlStore.load(CONST.LOCALES.EN);
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('createWorkspace', () => {
        afterEach(() => {
            mockFetch?.resume?.();
        });

        it('creates a new workspace', async () => {
            (fetch as MockFetch)?.pause?.();
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            const fakePolicy = createRandomPolicy(0, CONST.POLICY.TYPE.PERSONAL);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.NVP_ACTIVE_POLICY_ID}`, fakePolicy.id);
            await Onyx.set(`${ONYXKEYS.NVP_INTRO_SELECTED}`, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            await waitForBatchedUpdates();

            let adminReportID;
            let expenseReportID;
            const policyID = Policy.generatePolicyID();

            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: [CONST.BETAS.SUGGESTED_FOLLOWUPS],
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> | OnyxCollection<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            const activePolicyID: OnyxEntry<string> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.NVP_ACTIVE_POLICY_ID}`,
                    callback: (id) => {
                        Onyx.disconnect(connection);
                        resolve(id);
                    },
                });
            });

            // check if NVP_ACTIVE_POLICY_ID is updated to created policy id
            expect(activePolicyID).toBe(policyID);

            // check if policy was created with correct values
            expect(policy?.id).toBe(policyID);
            expect(policy?.name).toBe(WORKSPACE_NAME);
            expect(policy?.type).toBe(CONST.POLICY.TYPE.TEAM);
            expect(policy?.role).toBe(CONST.POLICY.ROLE.ADMIN);
            expect(policy?.owner).toBe(ESH_EMAIL);
            expect(policy?.areWorkflowsEnabled).toBe(true);
            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.BASIC);
            expect(policy?.approver).toBe(ESH_EMAIL);
            expect(policy?.isPolicyExpenseChatEnabled).toBe(true);
            expect(policy?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(policy?.employeeList).toEqual({[ESH_EMAIL]: {email: ESH_EMAIL, submitsTo: ESH_EMAIL, errors: {}, role: CONST.POLICY.ROLE.ADMIN}});
            expect(policy?.mccGroup).toBeDefined();
            expect(policy?.requiresCategory).toBe(true);

            let allReports: OnyxCollection<Report> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports);
                    },
                });
            });

            // These reports should be created: #admins and expense report + task reports of manage team (default) intent
            const workspaceReports = Object.values(allReports ?? {})
                .filter((report) => report?.policyID === policyID)
                .filter((report) => report?.type !== 'task');
            expect(workspaceReports.length).toBe(2);
            for (const report of workspaceReports) {
                expect(report?.pendingFields?.addWorkspaceRoom).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                switch (report?.chatType) {
                    case CONST.REPORT.CHAT_TYPE.POLICY_ADMINS: {
                        expect(report?.participants).toEqual({[ESH_ACCOUNT_ID]: ESH_PARTICIPANT_ADMINS_ROOM});
                        adminReportID = report.reportID;
                        break;
                    }
                    case CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT: {
                        expect(report?.participants).toEqual({[ESH_ACCOUNT_ID]: ESH_PARTICIPANT_EXPENSE_CHAT});
                        expenseReportID = report.reportID;
                        break;
                    }
                    default:
                        break;
                }
            }

            let reportActions: OnyxCollection<ReportActions> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });

            // Each of the three reports should have a `CREATED` action.
            let adminReportActions: ReportAction[] = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminReportID}`] ?? {});
            let expenseReportActions: ReportAction[] = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`] ?? {});
            let workspaceReportActions: ReportAction[] = adminReportActions.concat(expenseReportActions);
            expect(expenseReportActions.length).toBe(1);
            for (const reportAction of [...expenseReportActions]) {
                expect(reportAction.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.CREATED);
                expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                expect(reportAction.actorAccountID).toBe(ESH_ACCOUNT_ID);
            }

            // We do not pass tasks to `#admins` channel in favour of backed generated followup-list
            const expectedManageTeamDefaultTasksCount = 0;

            // After filtering, two actions are added to the list =- signoff message (+1) and default create action (+1)
            const expectedReportActionsOfTypeCreatedCount = 1;
            const expectedSignOffMessagesCount = 1;
            expect(adminReportActions.length).toBe(expectedManageTeamDefaultTasksCount + expectedReportActionsOfTypeCreatedCount + expectedSignOffMessagesCount);

            let reportActionsOfTypeCreatedCount = 0;
            let signOffMessagesCount = 0;
            let manageTeamTasksCount = 0;
            for (const reportAction of adminReportActions) {
                if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
                    reportActionsOfTypeCreatedCount++;
                    expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                    expect(reportAction.actorAccountID).toBe(ESH_ACCOUNT_ID);
                    continue;
                }
                if (reportAction.childType === CONST.REPORT.TYPE.TASK) {
                    manageTeamTasksCount++;
                    expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                    // we dont check actorAccountID as it will be a random account id for the guide
                    continue;
                }
                signOffMessagesCount++;
            }
            expect(reportActionsOfTypeCreatedCount).toBe(expectedReportActionsOfTypeCreatedCount);
            expect(signOffMessagesCount).toBe(expectedSignOffMessagesCount);
            expect(manageTeamTasksCount).toBe(expectedManageTeamDefaultTasksCount);

            // Check for success data
            (fetch as MockFetch)?.resume?.();
            await waitForBatchedUpdates();

            policy = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.POLICY,
                    waitForCollectionCallback: true,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            // Check if the policy pending action was cleared
            expect(policy?.pendingAction).toBeFalsy();

            allReports = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports);
                    },
                });
            });

            // Check if the report pending action and fields were cleared
            for (const report of Object.values(allReports ?? {})) {
                expect(report?.pendingAction).toBeFalsy();
                expect(report?.pendingFields?.addWorkspaceRoom).toBeFalsy();
            }

            reportActions = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });

            // Check if the report action pending action was cleared
            adminReportActions = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminReportID}`] ?? {});
            expenseReportActions = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`] ?? {});
            workspaceReportActions = adminReportActions.concat(expenseReportActions);
            for (const reportAction of workspaceReportActions) {
                expect(reportAction.pendingAction).toBeFalsy();
            }
        });

        it('duplicate workspace', async () => {
            (fetch as MockFetch)?.pause?.();
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            const fakePolicy = createRandomPolicy(10, CONST.POLICY.TYPE.PERSONAL);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.NVP_ACTIVE_POLICY_ID}`, fakePolicy.id);
            await Onyx.set(`${ONYXKEYS.NVP_INTRO_SELECTED}`, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            await waitForBatchedUpdates();

            let adminReportID;
            let expenseReportID;
            const POLICY_NAME = 'Duplicate Workspace';
            const policyID = Policy.generatePolicyID();

            const options = {
                currentUserAccountID: ESH_ACCOUNT_ID,
                policyName: POLICY_NAME,
                policyID: fakePolicy.id,
                targetPolicyID: policyID,
                welcomeNote: 'Join my policy',
                parts: {
                    people: true,
                    reports: true,
                    connections: true,
                    categories: true,
                    tags: true,
                    taxes: true,
                    perDiem: true,
                    reimbursements: true,
                    expenses: true,
                    distance: true,
                    invoices: true,
                    exportLayouts: true,
                },
                localCurrency: 'USD',
            };

            Policy.duplicateWorkspace(fakePolicy, options);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> | OnyxCollection<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.id).toBe(policyID);

            // check if policy was created with correct values
            expect(policy?.id).toBe(policyID);
            expect(policy?.name).toBe(POLICY_NAME);
            expect(policy?.type).toBe(fakePolicy.type);
            expect(policy?.role).toBe(fakePolicy.role);
            expect(policy?.owner).toBe(fakePolicy.owner);
            expect(policy?.areWorkflowsEnabled).toBe(true);
            expect(policy?.areDistanceRatesEnabled).toBe(true);
            expect(policy?.areInvoicesEnabled).toBe(true);
            expect(policy?.arePerDiemRatesEnabled).toBe(true);
            expect(policy?.approvalMode).toBe(fakePolicy.approvalMode);
            expect(policy?.approver).toBe(fakePolicy.approver);
            expect(policy?.isPolicyExpenseChatEnabled).toBe(fakePolicy.isPolicyExpenseChatEnabled);
            expect(policy?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(policy?.employeeList).toEqual(fakePolicy.employeeList);
            expect(policy?.mccGroup).toBe(fakePolicy.mccGroup);
            expect(policy?.requiresCategory).toBe(fakePolicy.requiresCategory);

            let allReports: OnyxCollection<Report> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports);
                    },
                });
            });

            // These reports should be created: #admins and expense report + task reports of manage team (default) intent
            const workspaceReports = Object.values(allReports ?? {})
                .filter((report) => report?.policyID === policyID)
                .filter((report) => report?.type !== 'task');
            expect(workspaceReports.length).toBe(2);
            for (const report of workspaceReports) {
                expect(report?.pendingFields?.addWorkspaceRoom).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                switch (report?.chatType) {
                    case CONST.REPORT.CHAT_TYPE.POLICY_ADMINS: {
                        expect(report?.participants).toEqual({[ESH_ACCOUNT_ID]: ESH_PARTICIPANT_ADMINS_ROOM});
                        adminReportID = report.reportID;
                        break;
                    }
                    case CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT: {
                        expect(report?.participants).toEqual({[ESH_ACCOUNT_ID]: ESH_PARTICIPANT_EXPENSE_CHAT});
                        expenseReportID = report.reportID;
                        break;
                    }
                    default:
                        break;
                }
            }

            let reportActions: OnyxCollection<ReportActions> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });

            // Each of the three reports should have a `CREATED` action.
            let adminReportActions: ReportAction[] = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminReportID}`] ?? {});
            let expenseReportActions: ReportAction[] = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`] ?? {});
            let workspaceReportActions: ReportAction[] = adminReportActions.concat(expenseReportActions);
            expect(expenseReportActions.length).toBe(1);
            for (const reportAction of [...expenseReportActions]) {
                expect(reportAction.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.CREATED);
                expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                expect(reportAction.actorAccountID).toBe(ESH_ACCOUNT_ID);
            }

            // After filtering, two actions are added to the list =- signoff message (+1) and default create action (+1)
            const expectedReportActionsOfTypeCreatedCount = 1;
            expect(adminReportActions.length).toBe(1);

            let reportActionsOfTypeCreatedCount = 0;
            for (const reportAction of adminReportActions) {
                if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
                    reportActionsOfTypeCreatedCount++;
                    expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                    expect(reportAction.actorAccountID).toBe(ESH_ACCOUNT_ID);
                    continue;
                }
                if (reportAction.childType === CONST.REPORT.TYPE.TASK) {
                    expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                }
            }
            expect(reportActionsOfTypeCreatedCount).toBe(expectedReportActionsOfTypeCreatedCount);

            // Check for success data
            (fetch as MockFetch)?.resume?.();
            await waitForBatchedUpdates();

            policy = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.POLICY,
                    waitForCollectionCallback: true,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            // Check if the policy pending action was cleared
            expect(policy?.pendingAction).toBeFalsy();

            allReports = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports);
                    },
                });
            });

            // Check if the report pending action and fields were cleared
            for (const report of Object.values(allReports ?? {})) {
                expect(report?.pendingAction).toBeFalsy();
                expect(report?.pendingFields?.addWorkspaceRoom).toBeFalsy();
            }

            reportActions = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });

            // Check if the report action pending action was cleared
            adminReportActions = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminReportID}`] ?? {});
            expenseReportActions = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`] ?? {});
            workspaceReportActions = adminReportActions.concat(expenseReportActions);
            for (const reportAction of workspaceReportActions) {
                expect(reportAction.pendingAction).toBeFalsy();
            }
        });

        it('duplicate workspace disabled options', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            const fakePolicy = createRandomPolicy(12, CONST.POLICY.TYPE.TEAM);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();

            const options = {
                currentUserAccountID: ESH_ACCOUNT_ID,
                policyName: 'Distance Disabled Workspace',
                policyID: fakePolicy.id,
                targetPolicyID: policyID,
                welcomeNote: 'Join my policy',
                parts: {
                    people: true,
                    reports: false,
                    connections: false,
                    categories: false,
                    tags: false,
                    taxes: false,
                    perDiem: false,
                    reimbursements: false,
                    expenses: false,
                    distance: false,
                    invoices: false,
                    exportLayouts: false,
                },
                localCurrency: 'USD',
            };

            Policy.duplicateWorkspace(fakePolicy, options);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            // When these parts are disabled, the corresponding policy settings should be false
            expect(policy?.areWorkflowsEnabled).toBe(false);
            expect(policy?.areDistanceRatesEnabled).toBe(false);
            expect(policy?.areInvoicesEnabled).toBe(false);
            expect(policy?.arePerDiemRatesEnabled).toBe(false);
        });

        it('duplicate workspace with overview, travel, and codingRules options', async () => {
            const basePolicy = createRandomPolicy(15, CONST.POLICY.TYPE.TEAM);
            const fakePolicy: PolicyType = {
                ...basePolicy,
                outputCurrency: 'EUR',
                address: {addressStreet: '1 Main Street', city: 'Paris', country: 'FR', state: '', zipCode: '75001'},
                isTravelEnabled: true,
                tax: {trackingEnabled: true},
                rules: {codingRules: {rule1: {filters: {left: 'merchant', operator: 'eq', right: 'Acme'}, category: 'Travel'}}},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();

            const options = {
                currentUserAccountID: ESH_ACCOUNT_ID,
                policyName: 'Overview Travel CodingRules Workspace',
                policyID: fakePolicy.id,
                targetPolicyID: policyID,
                welcomeNote: 'Join my policy',
                parts: {
                    people: false,
                    reports: false,
                    connections: false,
                    categories: false,
                    tags: false,
                    taxes: true,
                    perDiem: false,
                    reimbursements: false,
                    expenses: false,
                    distance: false,
                    invoices: false,
                    exportLayouts: false,
                    overview: true,
                    travel: true,
                    codingRules: true,
                },
                localCurrency: 'USD',
            };

            Policy.duplicateWorkspace(fakePolicy, options);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.outputCurrency).toBe('EUR');
            expect(policy?.address).toEqual(fakePolicy.address);
            expect(policy?.isTravelEnabled).toBe(true);
            expect(policy?.tax).toEqual(fakePolicy.tax);
            expect(policy?.rules).toEqual({codingRules: fakePolicy.rules?.codingRules});
        });

        it('duplicate workspace with 3+ members creates optimistic announce chat using currentUserAccountID', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            const basePolicy = createRandomPolicy(16, CONST.POLICY.TYPE.TEAM);
            const memberAEmail = 'member-a@expensifail.com';
            const memberBEmail = 'member-b@expensifail.com';
            const memberCEmail = 'member-c@expensifail.com';
            const fakePolicy: PolicyType = {
                ...basePolicy,
                employeeList: {
                    [memberAEmail]: {email: memberAEmail, role: CONST.POLICY.ROLE.ADMIN},
                    [memberBEmail]: {email: memberBEmail, role: CONST.POLICY.ROLE.USER},
                    [memberCEmail]: {email: memberCEmail, role: CONST.POLICY.ROLE.USER},
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            const memberAID = 200;
            const memberBID = 201;
            const memberCID = 202;
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [memberAID]: {accountID: memberAID, login: memberAEmail},
                [memberBID]: {accountID: memberBID, login: memberBEmail},
                [memberCID]: {accountID: memberCID, login: memberCEmail},
            });
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            const options = {
                currentUserAccountID: ESH_ACCOUNT_ID,
                policyName: 'Workspace With Members',
                policyID: fakePolicy.id,
                targetPolicyID: policyID,
                welcomeNote: 'Welcome to the workspace',
                parts: {
                    people: true,
                    reports: false,
                    connections: false,
                    categories: false,
                    tags: false,
                    taxes: false,
                    perDiem: false,
                    reimbursements: false,
                    expenses: false,
                    distance: false,
                    invoices: false,
                    exportLayouts: false,
                },
                localCurrency: 'USD',
            };

            Policy.duplicateWorkspace(fakePolicy, options);
            await waitForBatchedUpdates();

            const allReports: OnyxCollection<Report> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports);
                    },
                });
            });

            // With 3 employees copied to the duplicate policy, the optimistic #announce room should be created
            const announceChat = Object.values(allReports ?? {}).find((report) => report?.policyID === policyID && report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE);
            expect(announceChat).toBeTruthy();
            expect(announceChat?.writeCapability).toBe(CONST.REPORT.WRITE_CAPABILITIES.ADMINS);
            // Participants of the optimistic announce room should include every duplicated employee
            expect(Object.keys(announceChat?.participants ?? {}).length).toBe(3);
        });

        it('duplicate workspace with a file uses its uri and name on the policy avatar', async () => {
            const fakePolicy = createRandomPolicy(17, CONST.POLICY.TYPE.TEAM);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            const file = {uri: 'file://tmp/avatar.png', name: 'avatar.png', type: 'image/png'} as File;
            const options = {
                currentUserAccountID: ESH_ACCOUNT_ID,
                policyName: 'Workspace With Avatar',
                policyID: fakePolicy.id,
                targetPolicyID: policyID,
                welcomeNote: 'Join my policy',
                file,
                parts: {
                    people: false,
                    reports: false,
                    connections: false,
                    categories: false,
                    tags: false,
                    taxes: false,
                    perDiem: false,
                    reimbursements: false,
                    expenses: false,
                    distance: false,
                    invoices: false,
                    exportLayouts: false,
                },
                localCurrency: 'USD',
            };

            Policy.duplicateWorkspace(fakePolicy, options);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.avatarURL).toBe(file.uri);
            expect(policy?.originalFileName).toBe(file.name);
        });

        it('creates a new workspace with BASIC approval mode if the introSelected is MANAGE_TEAM', async () => {
            const policyID = Policy.generatePolicyID();
            // When a new workspace is created with introSelected set to MANAGE_TEAM
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> | OnyxCollection<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            // Then the policy should have approval mode set to BASIC
            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.BASIC);
        });

        it('creates a new workspace when betas are explicitly passed', async () => {
            const policyID = Policy.generatePolicyID();
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                hasActiveAdminPolicies: false,
                betas: [CONST.BETAS.SUGGESTED_FOLLOWUPS],
            });
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> | OnyxCollection<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.id).toBe(policyID);
            expect(policy?.name).toBe(WORKSPACE_NAME);
            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.BASIC);
        });

        it('creates a new workspace with OPTIONAL approval mode if the introSelected is TRACK_WORKSPACE', async () => {
            const policyID = Policy.generatePolicyID();
            // When a new workspace is created with introSelected set to TRACK_WORKSPACE
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> | OnyxCollection<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            // Then the policy should have approval mode set to OPTIONAL
            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.OPTIONAL);
        });

        it('create a new workspace fails will reset hasCompletedGuidedSetupFlow to the correct value', async () => {
            (fetch as MockFetch)?.pause?.();
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true, chatReportID: '12345'});
            await waitForBatchedUpdates();

            (fetch as MockFetch)?.fail?.();
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID: undefined,
                engagementChoice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            (fetch as MockFetch)?.resume?.();
            await waitForBatchedUpdates();

            let onboarding: OnyxEntry<Onboarding>;
            await TestHelper.getOnyxData({
                key: ONYXKEYS.NVP_ONBOARDING,
                waitForCollectionCallback: false,
                callback: (val) => {
                    onboarding = val;
                },
            });
            expect(onboarding?.hasCompletedGuidedSetupFlow).toBeTruthy();
        });

        it('create a new workspace with delayed submission set to manually if the onboarding choice is newDotManageTeam or newDotLookingAround', async () => {
            const policyID = Policy.generatePolicyID();
            // When a new workspace is created with introSelected set to MANAGE_TEAM
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                waitForCollectionCallback: false,
                callback: (policy) => {
                    // Then the autoReportingFrequency should be set to manually
                    expect(policy?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE);
                    expect(policy?.areWorkflowsEnabled).toBeTruthy();
                    expect(policy?.harvesting?.enabled).toBe(false);
                },
            });
        });

        it('create a new workspace with delayed submission set to manually if the onboarding choice is not selected', async () => {
            const policyID = Policy.generatePolicyID();
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: undefined,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                waitForCollectionCallback: false,
                callback: (policy) => {
                    // Then the autoReportingFrequency should be set to manually
                    expect(policy?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE);
                    expect(policy?.areWorkflowsEnabled).toBeTruthy();
                    expect(policy?.harvesting?.enabled).toBe(false);
                },
            });
        });

        it('create a new workspace with enabled workflows if the onboarding choice is newDotManageTeam', async () => {
            const policyID = Policy.generatePolicyID();
            // When a new workspace is created with introSelected set to MANAGE_TEAM
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                waitForCollectionCallback: false,
                callback: (policy) => {
                    // Then the workflows feature is enabled
                    expect(policy?.areWorkflowsEnabled).toBeTruthy();
                },
            });
        });

        it('create a new workspace with enabled workflows if the onboarding choice is newDotLookingAround', async () => {
            const policyID = Policy.generatePolicyID();
            // When a new workspace is created with introSelected set to LOOKING_AROUND
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                waitForCollectionCallback: false,
                callback: (policy) => {
                    // Then the workflows feature is enabled
                    expect(policy?.areWorkflowsEnabled).toBeTruthy();
                },
            });
        });

        it('create a new workspace with enabled workflows if the onboarding choice is newDotTrackWorkspace', async () => {
            const policyID = Policy.generatePolicyID();
            // When a new workspace is created with introSelected set to TRACK_WORKSPACE
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                waitForCollectionCallback: false,
                callback: (policy) => {
                    // Then workflows is enabled
                    expect(policy?.areWorkflowsEnabled).toBeTruthy();
                },
            });
        });

        it('create a new workspace with disabled workflows if the onboarding choice is newDotEmployer', async () => {
            const policyID = Policy.generatePolicyID();
            // When a new workspace is created with introSelected set to EMPLOYER
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.EMPLOYER,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.EMPLOYER},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                waitForCollectionCallback: false,
                callback: (policy) => {
                    // Then workflows are not enabled
                    expect(policy?.areWorkflowsEnabled).toBeFalsy();
                },
            });
        });

        it('create a new workspace with disabled workflows if the onboarding choice is newDotSplitChat', async () => {
            const policyID = Policy.generatePolicyID();
            // When a new workspace is created with introSelected set to CHAT_SPLIT
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                waitForCollectionCallback: false,
                callback: (policy) => {
                    // Then workflows are not enabled
                    expect(policy?.areWorkflowsEnabled).toBeFalsy();
                },
            });
        });

        it('should pass areDistanceRatesEnabled as true when creating workspace with distance rates feature enabled', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const policyID = Policy.generatePolicyID();

            // When creating a workspace with distance rates feature enabled
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: false,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
                currency: 'USD',
                featuresMap: [
                    {
                        id: CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED,
                        enabled: true,
                    },
                ],
                introSelected: {choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            // Then API.write should be called with CREATE_WORKSPACE command and areDistanceRatesEnabled set to true
            expect(apiWriteSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.CREATE_WORKSPACE,
                expect.objectContaining({
                    areDistanceRatesEnabled: true,
                }),
                expect.anything(),
            );

            apiWriteSpy.mockRestore();
        });

        it('should pass isSelfTourViewed as true when creating workspace with selfTourViewed flag', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const policyID = Policy.generatePolicyID();

            // When creating a workspace with isSelfTourViewed set to true
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: true,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            // Then API.write should be called with CREATE_WORKSPACE command
            expect(apiWriteSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.CREATE_WORKSPACE,
                expect.objectContaining({
                    policyID,
                }),
                expect.anything(),
            );

            apiWriteSpy.mockRestore();
        });

        it('should pass isSelfTourViewed as false when creating workspace without selfTourViewed flag', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const policyID = Policy.generatePolicyID();

            // When creating a workspace with isSelfTourViewed set to false
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            // Then API.write should be called with CREATE_WORKSPACE command
            expect(apiWriteSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.CREATE_WORKSPACE,
                expect.objectContaining({
                    policyID,
                }),
                expect.anything(),
            );

            apiWriteSpy.mockRestore();
        });

        it('should mark VIEW_TOUR task as completed in guidedSetupData when isSelfTourViewed is true', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const policyID = Policy.generatePolicyID();

            // When creating a workspace with isSelfTourViewed set to true
            // Use LOOKING_AROUND as introSelected.choice to ensure VIEW_TOUR task is included
            // (VIEW_TOUR is filtered out when both introSelected.choice and engagementChoice are MANAGE_TEAM)
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: true,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            // Extract the guidedSetupData from the API call
            const apiCallArgs = apiWriteSpy.mock.calls.find((call) => call.at(0) === WRITE_COMMANDS.CREATE_WORKSPACE);
            expect(apiCallArgs).toBeDefined();
            const params = apiCallArgs?.[1] as {guidedSetupData?: string};
            expect(params.guidedSetupData).toBeDefined();

            // Parse the guidedSetupData and find the VIEW_TOUR task
            type GuidedSetupItem = {task?: string; completedTaskReportActionID?: string};
            const guidedSetupData = JSON.parse(params.guidedSetupData ?? '[]') as GuidedSetupItem[];
            const viewTourTask = guidedSetupData.find((item) => item.task === CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR);

            // VIEW_TOUR task should have completedTaskReportActionID set when isSelfTourViewed is true
            expect(viewTourTask).toBeDefined();
            expect(viewTourTask?.completedTaskReportActionID).toBeDefined();

            apiWriteSpy.mockRestore();
        });

        it('should not mark VIEW_TOUR task as completed in guidedSetupData when isSelfTourViewed is false', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const policyID = Policy.generatePolicyID();

            // When creating a workspace with isSelfTourViewed set to false
            // Use LOOKING_AROUND as introSelected.choice to ensure VIEW_TOUR task is included
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            // Extract the guidedSetupData from the API call
            const apiCallArgs = apiWriteSpy.mock.calls.find((call) => call.at(0) === WRITE_COMMANDS.CREATE_WORKSPACE);
            expect(apiCallArgs).toBeDefined();
            const params = apiCallArgs?.[1] as {guidedSetupData?: string};
            expect(params.guidedSetupData).toBeDefined();

            // Parse the guidedSetupData and find the VIEW_TOUR task
            type GuidedSetupItem = {task?: string; completedTaskReportActionID?: string};
            const guidedSetupData = JSON.parse(params.guidedSetupData ?? '[]') as GuidedSetupItem[];
            const viewTourTask = guidedSetupData.find((item) => item.task === CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR);

            // VIEW_TOUR task should NOT have completedTaskReportActionID set when isSelfTourViewed is false
            expect(viewTourTask).toBeDefined();
            expect(viewTourTask?.completedTaskReportActionID).toBeUndefined();

            apiWriteSpy.mockRestore();
        });

        it('should include memberData when adminParticipant is provided', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const policyID = Policy.generatePolicyID();
            const adminEmail = 'admin@example.com';
            const adminAccountID = 999;

            // When creating a workspace with an adminParticipant
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
                adminParticipant: {login: adminEmail, accountID: adminAccountID},
            });
            await waitForBatchedUpdates();

            // Then API.write should be called with CREATE_WORKSPACE command
            const apiCallArgs = apiWriteSpy.mock.calls.find((call) => call.at(0) === WRITE_COMMANDS.CREATE_WORKSPACE);
            expect(apiCallArgs).toBeDefined();
            const params = apiCallArgs?.[1] as {memberData?: string; policyID?: string};
            expect(params.policyID).toBe(policyID);
            expect(params.memberData).toBeDefined();
            const memberData = JSON.parse(params.memberData ?? '{}') as {accountID: number; email: string; role: string};
            expect(memberData.accountID).toBe(adminAccountID);
            expect(memberData.email).toBe(adminEmail);
            expect(memberData.role).toBe(CONST.POLICY.ROLE.ADMIN);

            apiWriteSpy.mockRestore();
        });

        it('should handle TEST_DRIVE_RECEIVER intro choice with createWorkspace task', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const policyID = Policy.generatePolicyID();
            const createWorkspaceTaskReportID = 'testTaskReportID123';

            // When creating a workspace with TEST_DRIVE_RECEIVER choice and createWorkspace task
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER, createWorkspace: createWorkspaceTaskReportID},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            // Then API.write should be called with CREATE_WORKSPACE command
            expect(apiWriteSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.CREATE_WORKSPACE,
                expect.objectContaining({
                    policyID,
                }),
                expect.anything(),
            );

            apiWriteSpy.mockRestore();
        });

        it('should publish a workspace created event if this is their first policy', () => {
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID: '1',
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });

            expect(GoogleTagManager.publishEvent).toHaveBeenCalledTimes(1);
            expect(GoogleTagManager.publishEvent).toHaveBeenCalledWith(CONST.ANALYTICS.EVENT.WORKSPACE_CREATED, ESH_ACCOUNT_ID);
        });

        it('should not publish a workspace created event if this is not their first policy', () => {
            Policy.createWorkspace({
                policyOwnerEmail: ESH_EMAIL,
                makeMeAdmin: true,
                policyName: WORKSPACE_NAME,
                policyID: '1',
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: ESH_ACCOUNT_ID,
                currentUserEmailParam: ESH_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: true,
            });

            expect(GoogleTagManager.publishEvent).not.toHaveBeenCalled();
        });
    });

    describe('updateWorkspaceAvatar', () => {
        it('should update workspace avatar optimistically and succeed', async () => {
            // Given a workspace with no avatar
            const policy = {
                ...createRandomPolicy(0),
                avatarURL: '',
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            mockFetch.pause();

            // When setting the workspace avatar
            const file = {
                uri: 'file://path/to/avatar.png',
                name: 'avatar.png',
                type: 'image/png',
            } as File;
            Policy.updateWorkspaceAvatar(policy.id, '', file);

            // Then optimistic data should be set in Onyx
            await waitForBatchedUpdates();
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.avatarURL).toBe(file.uri);
            expect(updatedPolicy?.originalFileName).toBe(file.name);
            expect(updatedPolicy?.errorFields?.avatarURL).toBeUndefined();
            expect(updatedPolicy?.pendingFields?.avatarURL).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.avatarURL).toBeUndefined();
        });

        it('should revert workspace avatar when fail', async () => {
            // Given a workspace with an avatar
            const policy = {
                ...createRandomPolicy(0),
                avatarURL: 'https://example.com/avatar.png',
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When updating the workspace avatar but fail
            mockFetch.fail();
            const file = {
                uri: 'file://path/to/avatar.png',
                name: 'avatar.png',
                type: 'image/png',
            } as File;
            Policy.updateWorkspaceAvatar(policy.id, policy.avatarURL, file);
            await waitForBatchedUpdates();

            // Then the avatar should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.avatarURL).toBe(policy.avatarURL);
            expect(updatedPolicy?.pendingFields?.avatarURL).toBeUndefined();
        });
    });

    describe('deleteWorkspaceAvatar', () => {
        it('should delete workspace avatar optimistically and succeed', async () => {
            // Given a workspace with an avatar
            const policy = {
                ...createRandomPolicy(0),
                avatarURL: 'https://example.com/avatar.png',
                originalFileName: 'old_avatar.png',
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            mockFetch.pause();

            // When deleting the workspace avatar
            Policy.deleteWorkspaceAvatar(policy.id, policy.avatarURL, policy.originalFileName);
            await waitForBatchedUpdates();

            // Then optimistic data should be set
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.avatarURL).toBe('');
            expect(updatedPolicy?.originalFileName).toBeUndefined();
            expect(updatedPolicy?.errorFields?.avatarURL).toBeUndefined();
            expect(updatedPolicy?.pendingFields?.avatarURL).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.avatarURL).toBeUndefined();
        });

        it('should revert workspace avatar deletion when fail', async () => {
            // Given a workspace with an avatar
            const policy = {
                ...createRandomPolicy(0),
                avatarURL: 'https://example.com/avatar.png',
                originalFileName: 'old_avatar.png',
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When deleting the workspace avatar but fail
            mockFetch.fail();
            Policy.deleteWorkspaceAvatar(policy.id, policy.avatarURL, policy.originalFileName);
            await waitForBatchedUpdates();

            // Then the avatar should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.avatarURL).toBe(policy.avatarURL);
            expect(updatedPolicy?.originalFileName).toBe('old_avatar.png');
            expect(updatedPolicy?.pendingFields?.avatarURL).toBeUndefined();
            expect(updatedPolicy?.errorFields?.avatarURL).not.toBeUndefined();
        });
    });

    describe('updateGeneralSettings', () => {
        const NEW_NAME = 'New Workspace Name';
        const NEW_CURRENCY = CONST.CURRENCY.EUR;

        it('should update workspace name optimistically and succeed', async () => {
            // Given a workspace and a paused fetch
            const policy = {
                ...createRandomPolicy(0),
                name: 'Old Name',
                outputCurrency: CONST.CURRENCY.USD,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When updating the workspace name
            mockFetch.pause();
            Policy.updateGeneralSettings(policy, NEW_NAME, policy.outputCurrency);
            await waitForBatchedUpdates();

            // Then optimistic data should be set
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.name).toBe(NEW_NAME);
            expect(updatedPolicy?.pendingFields?.name).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(updatedPolicy?.errorFields?.name).toBeUndefined();

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.name).toBeUndefined();
        });

        it('should revert workspace name update when fail', async () => {
            // Given a workspace
            const policy = {
                ...createRandomPolicy(0),
                name: 'Old Name',
                outputCurrency: CONST.CURRENCY.USD,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When updating the workspace name but fail
            mockFetch.fail();
            Policy.updateGeneralSettings(policy, NEW_NAME, policy.outputCurrency);
            await waitForBatchedUpdates();

            // Then the name should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.name).toBe(policy.name);
            expect(updatedPolicy?.pendingFields?.name).toBeUndefined();
            expect(updatedPolicy?.errorFields?.name).not.toBeUndefined();
        });

        it('should update workspace currency and distance rates optimistically and succeed', async () => {
            // Given a workspace with distance rates
            const customUnitID = 'unit_123';
            const rateID = 'rate_456';
            const policy = {
                ...createRandomPolicy(0),
                name: 'Workspace',
                outputCurrency: CONST.CURRENCY.USD,
                customUnits: {
                    [customUnitID]: {
                        customUnitID,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                        rates: {
                            [rateID]: {
                                customUnitRateID: rateID,
                                name: 'Default Rate',
                                rate: 50,
                                currency: CONST.CURRENCY.USD,
                            },
                        },
                    },
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When updating the workspace currency
            mockFetch.pause();
            Policy.updateGeneralSettings(policy, policy.name, NEW_CURRENCY);
            await waitForBatchedUpdates();

            // Then optimistic data should be set
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.outputCurrency).toBe(NEW_CURRENCY);
            expect(updatedPolicy?.pendingFields?.outputCurrency).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(updatedPolicy?.errorFields?.outputCurrency).toBeUndefined();

            let updatedRate = updatedPolicy?.customUnits?.[customUnitID]?.rates?.[rateID];
            expect(updatedRate?.currency).toBe(NEW_CURRENCY);
            expect(updatedRate?.pendingFields?.currency).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.outputCurrency).toBeUndefined();

            updatedRate = updatedPolicy?.customUnits?.[customUnitID]?.rates?.[rateID];
            expect(updatedRate?.pendingFields?.currency).toBeUndefined();
        });

        it('should revert workspace currency update when fail', async () => {
            // Given a workspace with distance rates
            const customUnitID = 'unit_123';
            const rateID = 'rate_456';
            const policy = {
                ...createRandomPolicy(0),
                name: 'Workspace',
                outputCurrency: CONST.CURRENCY.USD,
                customUnits: {
                    [customUnitID]: {
                        customUnitID,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                        rates: {
                            [rateID]: {
                                customUnitRateID: rateID,
                                name: 'Default Rate',
                                rate: 50,
                                currency: CONST.CURRENCY.USD,
                            },
                        },
                    },
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When updating the workspace currency but fail
            mockFetch.fail();
            Policy.updateGeneralSettings(policy, policy.name, NEW_CURRENCY);
            await waitForBatchedUpdates();

            // Then the currency should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.outputCurrency).toBe(policy.outputCurrency);
            expect(updatedPolicy?.pendingFields?.outputCurrency).toBeUndefined();
            expect(updatedPolicy?.errorFields?.outputCurrency).not.toBeUndefined();

            const updatedRate = updatedPolicy?.customUnits?.[customUnitID]?.rates?.[rateID];
            expect(updatedRate?.currency).toBe(policy.outputCurrency);
            expect(updatedRate?.pendingFields?.currency).toBeUndefined();
            expect(updatedRate?.errorFields?.currency).not.toBeUndefined();
        });
    });

    describe('updateAddress', () => {
        it('should send discrete address fields with UPDATE_POLICY_ADDRESS', async () => {
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const policyID = Policy.generatePolicyID();

            Policy.updateAddress(policyID, {
                addressStreet: '123 Main St',
                addressStreet2: 'Suite 200',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94102',
                country: 'US',
            });
            await waitForBatchedUpdates();

            const apiCallArgs = apiWriteSpy.mock.calls.find((call) => call.at(0) === WRITE_COMMANDS.UPDATE_POLICY_ADDRESS);
            expect(apiCallArgs).toBeDefined();

            const params = apiCallArgs?.[1] as Record<string, string>;
            expect(params).toEqual(
                expect.objectContaining({
                    policyID,
                    addressStreet: '123 Main St',
                    addressStreet2: 'Suite 200',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94102',
                    country: 'US',
                }),
            );
            expect(params).not.toHaveProperty('data[addressStreet]');
            expect(params).not.toHaveProperty('data[city]');
            expect(params).not.toHaveProperty('data[state]');
            expect(params).not.toHaveProperty('data[zipCode]');
            expect(params).not.toHaveProperty('data[country]');

            apiWriteSpy.mockRestore();
        });

        it('should send an empty second line when addressStreet2 is missing', async () => {
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const policyID = Policy.generatePolicyID();

            Policy.updateAddress(policyID, {
                addressStreet: '123 Main St',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94102',
                country: 'US',
            });
            await waitForBatchedUpdates();

            const apiCallArgs = apiWriteSpy.mock.calls.find((call) => call.at(0) === WRITE_COMMANDS.UPDATE_POLICY_ADDRESS);
            expect(apiCallArgs).toBeDefined();

            const params = apiCallArgs?.[1] as Record<string, string>;
            expect(params.addressStreet2).toBe('');

            apiWriteSpy.mockRestore();
        });
    });

    describe('setPolicyReimbursableMode', () => {
        it('should update reimbursable mode to REIMBURSABLE_DEFAULT optimistically and succeed', async () => {
            // Given a workspace with default reimbursable as false and disabled as true
            const policy = {
                ...createRandomPolicy(0),
                defaultReimbursable: false,
                disabledFields: {
                    reimbursable: true,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When updating the reimbursable mode to REIMBURSABLE_DEFAULT
            mockFetch.pause();
            Policy.setPolicyReimbursableMode(policy.id, CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.REIMBURSABLE_DEFAULT, policy.defaultReimbursable, policy.disabledFields.reimbursable);
            await waitForBatchedUpdates();

            // Then defaultReimbursable is updated to true and disabledFields.reimbursable is updated to false
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.defaultReimbursable).toBe(true);
            expect(updatedPolicy?.disabledFields?.reimbursable).toBe(false);
            expect(updatedPolicy?.pendingFields?.defaultReimbursable).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(updatedPolicy?.pendingFields?.disabledFields).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.defaultReimbursable).toBeUndefined();
            expect(updatedPolicy?.pendingFields?.disabledFields).toBeUndefined();
            expect(updatedPolicy?.errorFields).toBeUndefined();
        });

        it('should update reimbursable mode to NON_REIMBURSABLE_DEFAULT optimistically and succeed', async () => {
            // Given a workspace with default reimbursable as true and disabled as true
            const policy = {
                ...createRandomPolicy(0),
                defaultReimbursable: true,
                disabledFields: {
                    reimbursable: true,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When updating the reimbursable mode to NON_REIMBURSABLE_DEFAULT
            mockFetch.pause();
            Policy.setPolicyReimbursableMode(
                policy.id,
                CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.NON_REIMBURSABLE_DEFAULT,
                policy.defaultReimbursable,
                policy.disabledFields.reimbursable,
            );
            await waitForBatchedUpdates();

            // Then defaultReimbursable is updated to false and disabledFields.reimbursable is updated to false
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.defaultReimbursable).toBe(false);
            expect(updatedPolicy?.disabledFields?.reimbursable).toBe(false);
            expect(updatedPolicy?.pendingFields?.defaultReimbursable).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(updatedPolicy?.pendingFields?.disabledFields).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.defaultReimbursable).toBeUndefined();
            expect(updatedPolicy?.pendingFields?.disabledFields).toBeUndefined();
            expect(updatedPolicy?.errorFields).toBeUndefined();
        });

        it('should update reimbursable mode to ALWAYS_REIMBURSABLE optimistically and succeed', async () => {
            // Given a workspace with default reimbursable as false and disabled as false
            const policy = {
                ...createRandomPolicy(0),
                defaultReimbursable: false,
                disabledFields: {
                    reimbursable: false,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When updating the reimbursable mode to ALWAYS_REIMBURSABLE
            mockFetch.pause();
            Policy.setPolicyReimbursableMode(policy.id, CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.ALWAYS_REIMBURSABLE, policy.defaultReimbursable, policy.disabledFields.reimbursable);
            await waitForBatchedUpdates();

            // Then defaultReimbursable is updated to true and disabledFields.reimbursable is updated to true
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.defaultReimbursable).toBe(true);
            expect(updatedPolicy?.disabledFields?.reimbursable).toBe(true);
            expect(updatedPolicy?.pendingFields?.defaultReimbursable).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(updatedPolicy?.pendingFields?.disabledFields).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.defaultReimbursable).toBeUndefined();
            expect(updatedPolicy?.pendingFields?.disabledFields).toBeUndefined();
            expect(updatedPolicy?.errorFields).toBeUndefined();
        });

        it('should update reimbursable mode to ALWAYS_NON_REIMBURSABLE optimistically and succeed', async () => {
            // Given a workspace with default reimbursable as true and disabled as false
            const policy = {
                ...createRandomPolicy(0),
                defaultReimbursable: true,
                disabledFields: {
                    reimbursable: false,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When updating the reimbursable mode to ALWAYS_NON_REIMBURSABLE
            mockFetch.pause();
            Policy.setPolicyReimbursableMode(
                policy.id,
                CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.ALWAYS_NON_REIMBURSABLE,
                policy.defaultReimbursable,
                policy.disabledFields.reimbursable,
            );
            await waitForBatchedUpdates();

            // Then defaultReimbursable is updated to false and disabledFields.reimbursable is updated to true
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.defaultReimbursable).toBe(false);
            expect(updatedPolicy?.disabledFields?.reimbursable).toBe(true);
            expect(updatedPolicy?.pendingFields?.defaultReimbursable).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(updatedPolicy?.pendingFields?.disabledFields).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.defaultReimbursable).toBeUndefined();
            expect(updatedPolicy?.pendingFields?.disabledFields).toBeUndefined();
            expect(updatedPolicy?.errorFields).toBeUndefined();
        });

        it('should revert reimbursable mode update when fail', async () => {
            // Given a workspace with default reimbursable as true
            const policy = {
                ...createRandomPolicy(0),
                defaultReimbursable: true,
                disabledFields: {
                    reimbursable: false,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When updating the reimbursable mode and fails
            mockFetch.fail();
            Policy.setPolicyReimbursableMode(
                policy.id,
                CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES.NON_REIMBURSABLE_DEFAULT,
                policy.defaultReimbursable,
                policy.disabledFields.reimbursable,
            );
            await waitForBatchedUpdates();

            // Then defaultReimbursable is reverted to true and disabledFields.reimbursable is reverted to false
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.defaultReimbursable).toBe(true);
            expect(updatedPolicy?.disabledFields?.reimbursable).toBe(false);
            expect(updatedPolicy?.pendingFields?.defaultReimbursable).toBeUndefined();
            expect(updatedPolicy?.pendingFields?.disabledFields).toBeUndefined();
            expect(updatedPolicy?.errorFields?.defaultReimbursable).not.toBeUndefined();
        });
    });

    describe('leaveWorkspace', () => {
        it("should remove all non-owned workspace chats and keep the user's own workspace chat when leaving a workspace", async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            const policyID = Policy.generatePolicyID();
            const policy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                name: WORKSPACE_NAME,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await waitForBatchedUpdates();

            const ownWorkspaceChat: Report = {
                ...createRandomReport(100, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: '100',
                policyID,
                ownerAccountID: ESH_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const nonOwnedWorkspaceChat1: Report = {
                ...createRandomReport(101, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: '101',
                policyID,
                ownerAccountID: ESH_ACCOUNT_ID + 1,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const nonOwnedWorkspaceChat2: Report = {
                ...createRandomReport(102, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: '102',
                policyID,
                ownerAccountID: ESH_ACCOUNT_ID + 2,
                type: CONST.REPORT.TYPE.CHAT,
            };
            const nonOwnedWorkspaceChats = [nonOwnedWorkspaceChat1, nonOwnedWorkspaceChat2];

            const getAllWorkspaceReportsSpy = jest.spyOn(ReportUtils, 'getAllWorkspaceReports').mockReturnValue([ownWorkspaceChat, ...nonOwnedWorkspaceChats]);
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            Policy.leaveWorkspace(ESH_ACCOUNT_ID, ESH_EMAIL, policy);
            await waitForBatchedUpdates();

            expect(apiWriteSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.LEAVE_POLICY,
                expect.objectContaining({
                    policyID,
                    email: ESH_EMAIL,
                }),
                expect.anything(),
            );

            const writeOptions = apiWriteSpy.mock.calls.at(0)?.at(2) as {
                optimisticData?: Array<{key?: string; value?: Record<string, unknown> | null}>;
                successData?: Array<{key?: string; value?: Record<string, unknown> | null}>;
                failureData?: Array<{key?: string; value?: Record<string, unknown> | null}>;
            };

            expect(writeOptions?.optimisticData).toEqual(
                expect.arrayContaining(
                    nonOwnedWorkspaceChats.map((workspaceChat) =>
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceChat.reportID}`,
                            value: expect.objectContaining({
                                reportID: null,
                                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                                participants: {
                                    [ESH_ACCOUNT_ID]: {
                                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                                    },
                                },
                            }),
                        }),
                    ),
                ),
            );

            const removedWorkspaceChatUpdates = (writeOptions?.optimisticData ?? []).filter((update) => (update.value as {reportID?: string | null} | undefined)?.reportID === null);
            expect(removedWorkspaceChatUpdates).toHaveLength(nonOwnedWorkspaceChats.length);

            expect(writeOptions?.optimisticData).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.REPORT}${ownWorkspaceChat.reportID}`,
                        value: expect.objectContaining({
                            reportID: null,
                        }),
                    }),
                ]),
            );

            expect(writeOptions?.optimisticData).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${ownWorkspaceChat.reportID}`,
                        value: expect.objectContaining({
                            private_isArchived: expect.any(String) as unknown as string,
                        }),
                    }),
                ]),
            );

            expect(writeOptions?.successData).toEqual(
                expect.arrayContaining(
                    nonOwnedWorkspaceChats.map((workspaceChat) =>
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceChat.reportID}`,
                            value: null,
                        }),
                    ),
                ),
            );
            expect(writeOptions?.failureData).toEqual(
                expect.arrayContaining(
                    nonOwnedWorkspaceChats.map((workspaceChat) =>
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceChat.reportID}`,
                            value: workspaceChat,
                        }),
                    ),
                ),
            );

            apiWriteSpy.mockRestore();
            getAllWorkspaceReportsSpy.mockRestore();
        });

        it('should use explicit currentUserAccountID for pendingChatMembers instead of Onyx session', async () => {
            // Set Onyx session to a DIFFERENT accountID to verify the explicit parameter is used
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            const policy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                name: WORKSPACE_NAME,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await waitForBatchedUpdates();

            // Use a non-expense-chat report so it goes through the else branch where pendingChatMembers is set
            const workspaceChat: Report = {
                ...createRandomReport(100, undefined),
                reportID: '100',
                policyID,
                type: CONST.REPORT.TYPE.CHAT,
            };

            const getAllWorkspaceReportsSpy = jest.spyOn(ReportUtils, 'getAllWorkspaceReports').mockReturnValue([workspaceChat]);
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const customAccountID = 999;
            const customEmail = 'custom@example.com';

            Policy.leaveWorkspace(customAccountID, customEmail, policy);
            await waitForBatchedUpdates();

            const writeOptions = apiWriteSpy.mock.calls.at(0)?.at(2) as {
                optimisticData?: Array<{key?: string; value?: Record<string, unknown> | null}>;
            };

            // Verify pendingChatMembers uses the explicit customAccountID, not the Onyx session accountID
            const metadataUpdate = (writeOptions?.optimisticData ?? []).find((update) => (update.key ?? '').startsWith(ONYXKEYS.COLLECTION.REPORT_METADATA));
            const pendingMembers = (metadataUpdate?.value as {pendingChatMembers?: Array<{accountID: string}>})?.pendingChatMembers ?? [];

            expect(pendingMembers).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        accountID: String(customAccountID),
                    }),
                ]),
            );

            // Verify that the Onyx session accountID is NOT used
            const usesOnyxSessionAccountID = pendingMembers.some((member) => member.accountID === String(ESH_ACCOUNT_ID));
            expect(usesOnyxSessionAccountID).toBe(false);

            apiWriteSpy.mockRestore();
            getAllWorkspaceReportsSpy.mockRestore();
        });
    });

    describe('createDraftInitialWorkspace', () => {
        it('creates a policy draft with disabled workflows when onboarding choice does not enable workflows', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();

            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE}, WORKSPACE_NAME, ESH_ACCOUNT_ID, ESH_EMAIL, policyID, false, CONST.CURRENCY.EUR);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(draft?.areWorkflowsEnabled).toBe(false);
            expect(draft?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
            expect(draft?.harvesting?.enabled).toBe(true);
            expect(draft?.outputCurrency).toBe(CONST.CURRENCY.EUR);
        });

        it('should set owner and ownerAccountID from explicit parameters', async () => {
            // Set Onyx session to a DIFFERENT accountID/email to verify the explicit parameters are used
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const customAccountID = 999;
            const customEmail = 'custom@example.com';
            const policyID = Policy.generatePolicyID();

            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}, WORKSPACE_NAME, customAccountID, customEmail, policyID);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            // Verify owner and ownerAccountID use the explicit parameters, not the Onyx session
            expect(draft?.owner).toBe(customEmail);
            expect(draft?.ownerAccountID).toBe(customAccountID);

            // Verify that the Onyx session values are NOT used
            expect(draft?.owner).not.toBe(ESH_EMAIL);
            expect(draft?.ownerAccountID).not.toBe(ESH_ACCOUNT_ID);
        });

        it('should set approver from explicit currentUserEmail parameter', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const customAccountID = 888;
            const customEmail = 'approver@example.com';
            const policyID = Policy.generatePolicyID();

            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}, WORKSPACE_NAME, customAccountID, customEmail, policyID);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(draft?.approver).toBe(customEmail);
            expect(draft?.approver).not.toBe(ESH_EMAIL);
        });

        it('should set employeeList using explicit currentUserEmail parameter', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const customAccountID = 777;
            const customEmail = 'employee@example.com';
            const policyID = Policy.generatePolicyID();

            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}, WORKSPACE_NAME, customAccountID, customEmail, policyID);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            // Verify the employeeList uses the explicit email parameter
            expect(draft?.employeeList?.[customEmail]).toBeDefined();
            expect(draft?.employeeList?.[customEmail]?.email).toBe(customEmail);
            expect(draft?.employeeList?.[customEmail]?.submitsTo).toBe(customEmail);
            expect(draft?.employeeList?.[customEmail]?.role).toBe(CONST.POLICY.ROLE.ADMIN);

            // Verify the Onyx session email is NOT used in employeeList
            expect(draft?.employeeList?.[ESH_EMAIL]).toBeUndefined();
        });
    });

    describe('createDraftWorkspace', () => {
        it('sets key defaults and related drafts when onboarding choice enables workflows', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            const params = Policy.createDraftWorkspace(
                {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                WORKSPACE_NAME,
                ESH_ACCOUNT_ID,
                ESH_EMAIL,
                ESH_EMAIL,
                true,
                policyID,
                CONST.CURRENCY.USD,
            );
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(draft?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.BASIC);
            expect(draft?.areWorkflowsEnabled).toBe(true);
            expect(draft?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE);
            expect(draft?.outputCurrency).toBe(CONST.CURRENCY.USD);
            expect(draft?.employeeList?.[ESH_EMAIL]?.role).toBe(CONST.POLICY.ROLE.ADMIN);
            expect(draft?.chatReportIDAdmins).toBe(params.adminsChatReportID);

            // Report draft should be set for the expense chat
            const expenseReportDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${params.expenseChatReportID}`);
            expect(expenseReportDraft).toBeTruthy();

            // Default categories draft should be created and enabled
            const categoriesDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${policyID}`);

            expect(categoriesDraft && Object.keys(categoriesDraft).length > 0).toBe(true);
            expect(Object.values(categoriesDraft ?? {}).every((c) => c.enabled === true)).toBe(true);
        });

        it('disables workflows and sets approval to OPTIONAL when onboarding choice does not enable workflows', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            Policy.createDraftWorkspace({choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE}, WORKSPACE_NAME, ESH_ACCOUNT_ID, ESH_EMAIL, ESH_EMAIL, false, policyID, CONST.CURRENCY.EUR);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(draft?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.OPTIONAL);
            expect(draft?.areWorkflowsEnabled).toBe(false);
            expect(draft?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
            expect(draft?.harvesting?.enabled).toBe(true);
            expect(draft?.outputCurrency).toBe(CONST.CURRENCY.EUR);
        });

        it('should set owner, ownerAccountID, approver, and employeeList from explicit parameters instead of Onyx session', async () => {
            // Set Onyx session to a DIFFERENT accountID/email to verify the explicit parameters are used
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const customAccountID = 999;
            const customEmail = 'custom@example.com';
            const policyID = Policy.generatePolicyID();

            Policy.createDraftWorkspace({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}, WORKSPACE_NAME, customAccountID, customEmail, customEmail, false, policyID);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            // Verify explicit params are used, not the Onyx session values
            expect(draft?.owner).toBe(customEmail);
            expect(draft?.ownerAccountID).toBe(customAccountID);
            expect(draft?.approver).toBe(customEmail);
            expect(draft?.employeeList?.[customEmail]).toEqual({
                submitsTo: customEmail,
                email: customEmail,
                role: CONST.POLICY.ROLE.ADMIN,
                errors: {},
            });

            // Verify the Onyx session values are NOT used
            expect(draft?.owner).not.toBe(ESH_EMAIL);
            expect(draft?.ownerAccountID).not.toBe(ESH_ACCOUNT_ID);
            expect(draft?.employeeList?.[ESH_EMAIL]).toBeUndefined();
        });
    });

    describe('upgradeToCorporate', () => {
        it('upgradeToCorporate should not alter initial values of autoReporting and autoReportingFrequency', async () => {
            const autoReporting = true;
            const autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
            // Given that a policy has autoReporting initially set to true and autoReportingFrequency set to instant.
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                autoReporting,
                autoReportingFrequency,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When a policy is upgradeToCorporate
            Policy.upgradeToCorporate(fakePolicy);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            // Then the policy autoReporting and autoReportingFrequency should equal the initial value.
            expect(policy?.autoReporting).toBe(autoReporting);
            expect(policy?.autoReportingFrequency).toBe(autoReportingFrequency);
        });

        it('upgradeToCorporate should set eReceipts to true when outputCurrency is USD', async () => {
            // Given a policy with USD currency
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                outputCurrency: CONST.CURRENCY.USD,
                eReceipts: false,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When upgrading to corporate
            Policy.upgradeToCorporate(fakePolicy);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            // Then eReceipts should be enabled
            expect(policy?.eReceipts).toBe(true);
        });

        it("upgradeToCorporate shouldn't set eReceipts to true when outputCurrency is not USD", async () => {
            // Given a policy with non-USD currency
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                outputCurrency: CONST.CURRENCY.EUR,
                eReceipts: false,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When upgrading to corporate
            Policy.upgradeToCorporate(fakePolicy);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.eReceipts).toBe(fakePolicy.eReceipts);
        });
    });

    describe('downgradeToTeam', () => {
        it('should downgrade to team optimistically and succeed', async () => {
            // Given a policy with type corporate
            const policyID = '1';
            const fakePolicy = {
                id: policyID,
                type: CONST.POLICY.TYPE.CORPORATE,
                isAttendeeTrackingEnabled: true,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When downgradeToTeam is called
            mockFetch.pause();
            Policy.downgradeToTeam(policyID, fakePolicy.type, fakePolicy.isAttendeeTrackingEnabled);
            await waitForBatchedUpdates();

            // Then type should be team optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.type).toBe(CONST.POLICY.TYPE.TEAM);
            expect(updatedPolicy?.isPendingDowngrade).toBe(true);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // And the success data should clear the pending downgrade
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.isPendingDowngrade).toBe(false);
        });

        it('should revert downgrade when fail', async () => {
            // Given a policy with type corporate
            const policyID = '1';
            const fakePolicy = {
                id: policyID,
                type: CONST.POLICY.TYPE.CORPORATE,
                isAttendeeTrackingEnabled: true,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When downgradeToTeam is called and fails
            mockFetch.fail();
            Policy.downgradeToTeam(policyID, fakePolicy.type, fakePolicy.isAttendeeTrackingEnabled);
            await waitForBatchedUpdates();

            // Then type should be reverted to corporate
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.type).toBe(CONST.POLICY.TYPE.CORPORATE);
            expect(updatedPolicy?.isPendingDowngrade).toBe(false);
        });
    });

    describe('enablePolicyRules', () => {
        it('should not reset preventSelfApproval when the rule feature is turned off', async () => {
            (fetch as MockFetch)?.pause?.();
            Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                areRulesEnabled: true,
                preventSelfApproval: true,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            // Disable the rule feature
            Policy.enablePolicyRules(fakePolicy, false);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            // preventSelfApproval should not be reset since it's not part of Rules
            expect(policy?.preventSelfApproval).toBeTruthy();
            expect(policy?.areRulesEnabled).toBeFalsy();
            expect(policy?.pendingFields?.areRulesEnabled).toEqual(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            (fetch as MockFetch)?.resume?.();
            await waitForBatchedUpdates();

            policy = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            // Check if the pending action is cleared
            expect(policy?.pendingFields?.areRulesEnabled).toBeFalsy();
        });
    });

    describe('setWorkspaceApprovalMode', () => {
        it('should not change employee list when disabling approval', async () => {
            (fetch as MockFetch)?.pause?.();
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});

            const policyID = Policy.generatePolicyID();
            const employeeList = {
                [ESH_EMAIL]: {
                    email: ESH_EMAIL,
                    submitsTo: ESH_EMAIL,
                    role: CONST.POLICY.ROLE.ADMIN,
                },
                [EMPLOYEE_EMAIL]: {
                    email: EMPLOYEE_EMAIL,
                    submitsTo: ESH_EMAIL,
                    role: CONST.POLICY.ROLE.USER,
                },
            };

            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
                employeeList,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.OPTIONAL);
            expect(policy?.employeeList).toEqual(employeeList);
            expect(policy?.pendingFields?.approvalMode).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            (fetch as MockFetch)?.resume?.();
            await waitForBatchedUpdates();

            policy = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.pendingFields?.approvalMode).toBeFalsy();
            expect(policy?.employeeList).toEqual(employeeList);
            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.OPTIONAL);
        });

        it('should optimistically refresh next steps for submitted expense reports when changing approval mode', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const buildNextStepNewSpy = jest
                .spyOn(require('@libs/NextStepUtils'), 'buildNextStepNew')
                // eslint-disable-next-line @typescript-eslint/no-deprecated -- This test covers legacy NextStep optimistic updates which still use the deprecated type.
                .mockReturnValue({type: 'neutral', icon: CONST.NEXT_STEP.ICONS.CHECKMARK, message: [{text: 'Mock next step'}]} as never);

            const getAllPolicyReportsSpy = jest.spyOn(ReportUtils, 'getAllPolicyReports');
            const isExpenseReportSpy = jest.spyOn(ReportUtils, 'isExpenseReport');
            const hasViolationsSpy = jest.spyOn(ReportUtils, 'hasViolations');

            const policyID = Policy.generatePolicyID();
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            const submittedExpenseReport1 = {reportID: '100', policyID, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED} as unknown as Report;
            const submittedExpenseReport2 = {reportID: '101', policyID, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED} as unknown as Report;
            getAllPolicyReportsSpy.mockReturnValue([submittedExpenseReport1, submittedExpenseReport2]);
            isExpenseReportSpy.mockReturnValue(true);
            hasViolationsSpy.mockReturnValue(false);

            const nextStepKey1 = `${ONYXKEYS.COLLECTION.NEXT_STEP}${submittedExpenseReport1.reportID}` as const;
            const nextStepKey2 = `${ONYXKEYS.COLLECTION.NEXT_STEP}${submittedExpenseReport2.reportID}` as const;
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- We need a minimal ReportNextStepDeprecated shape to simulate rollback on failure.
            const currentNextStep1 = {type: 'neutral', icon: CONST.NEXT_STEP.ICONS.CHECKMARK, message: [{text: 'Old next step 1'}]} as never;
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- We need a minimal ReportNextStepDeprecated shape to simulate rollback on failure.
            const currentNextStep2 = {type: 'neutral', icon: CONST.NEXT_STEP.ICONS.CHECKMARK, message: [{text: 'Old next step 2'}]} as never;

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, ESH_ACCOUNT_ID, ESH_EMAIL, {
                reportNextSteps: {
                    [nextStepKey1]: currentNextStep1,
                    [nextStepKey2]: currentNextStep2,
                },
                transactionViolations: {},
                betas: [],
            });
            await waitForBatchedUpdates();

            expect(apiWriteSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.DISABLE_POLICY_APPROVALS,
                expect.anything(),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({onyxMethod: Onyx.METHOD.MERGE, key: nextStepKey1}),
                        expect.objectContaining({onyxMethod: Onyx.METHOD.MERGE, key: nextStepKey2}),
                    ]),
                    failureData: expect.arrayContaining([
                        expect.objectContaining({onyxMethod: Onyx.METHOD.MERGE, key: nextStepKey1, value: currentNextStep1}),
                        expect.objectContaining({onyxMethod: Onyx.METHOD.MERGE, key: nextStepKey2, value: currentNextStep2}),
                    ]),
                }),
            );

            expect(buildNextStepNewSpy).toHaveBeenCalledTimes(2);

            apiWriteSpy.mockRestore();
            buildNextStepNewSpy.mockRestore();
            getAllPolicyReportsSpy.mockRestore();
            isExpenseReportSpy.mockRestore();
            hasViolationsSpy.mockRestore();
        });

        it('should pass currentUserAccountID and currentUserEmail to hasViolations and buildNextStepNew', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const buildNextStepNewSpy = jest
                .spyOn(require('@libs/NextStepUtils'), 'buildNextStepNew')
                // eslint-disable-next-line @typescript-eslint/no-deprecated -- This test covers legacy NextStep optimistic updates which still use the deprecated type.
                .mockReturnValue({type: 'neutral', icon: CONST.NEXT_STEP.ICONS.CHECKMARK, message: [{text: 'Mock next step'}]} as never);

            const getAllPolicyReportsSpy = jest.spyOn(ReportUtils, 'getAllPolicyReports');
            const isExpenseReportSpy = jest.spyOn(ReportUtils, 'isExpenseReport');
            const hasViolationsSpy = jest.spyOn(ReportUtils, 'hasViolations').mockReturnValue(false);

            const policyID = Policy.generatePolicyID();
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            const submittedReport = {reportID: '200', policyID, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED} as unknown as Report;
            getAllPolicyReportsSpy.mockReturnValue([submittedReport]);
            isExpenseReportSpy.mockReturnValue(true);

            const customAccountID = 999;
            const customEmail = 'custom@example.com';

            const nextStepKey = `${ONYXKEYS.COLLECTION.NEXT_STEP}${submittedReport.reportID}` as const;
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- We need a minimal ReportNextStepDeprecated shape for the test.
            const currentNextStep = {type: 'neutral', icon: CONST.NEXT_STEP.ICONS.CHECKMARK, message: [{text: 'Old next step'}]} as never;

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, customAccountID, customEmail, {
                reportNextSteps: {
                    [nextStepKey]: currentNextStep,
                },
                transactionViolations: {},
                betas: [],
            });
            await waitForBatchedUpdates();

            // Verify hasViolations received the custom accountID and email
            expect(hasViolationsSpy).toHaveBeenCalledWith(
                submittedReport.reportID,
                expect.anything(),
                customAccountID,
                customEmail,
                undefined,
                undefined,
                expect.anything(),
                expect.anything(),
            );

            // Verify buildNextStepNew received the custom accountID and email
            expect(buildNextStepNewSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    currentUserAccountIDParam: customAccountID,
                    currentUserEmailParam: customEmail,
                }),
            );

            apiWriteSpy.mockRestore();
            buildNextStepNewSpy.mockRestore();
            getAllPolicyReportsSpy.mockRestore();
            isExpenseReportSpy.mockRestore();
            hasViolationsSpy.mockRestore();
        });

        it('should not update next steps when additionalData is not provided', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const buildNextStepNewSpy = jest.spyOn(require('@libs/NextStepUtils'), 'buildNextStepNew');
            const getAllPolicyReportsSpy = jest.spyOn(ReportUtils, 'getAllPolicyReports');

            const policyID = Policy.generatePolicyID();
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            expect(getAllPolicyReportsSpy).not.toHaveBeenCalled();
            expect(buildNextStepNewSpy).not.toHaveBeenCalled();

            const writeOptions = apiWriteSpy.mock.calls.at(0)?.at(2) as {optimisticData?: Array<{key?: string}>; failureData?: Array<{key?: string}>} | undefined;
            expect(writeOptions).toBeTruthy();
            expect((writeOptions?.optimisticData ?? []).some((u) => (u?.key ?? '').startsWith(ONYXKEYS.COLLECTION.NEXT_STEP))).toBe(false);
            expect((writeOptions?.failureData ?? []).some((u) => (u?.key ?? '').startsWith(ONYXKEYS.COLLECTION.NEXT_STEP))).toBe(false);

            apiWriteSpy.mockRestore();
            buildNextStepNewSpy.mockRestore();
            getAllPolicyReportsSpy.mockRestore();
        });

        it('should optimistically clear forwardsTo and overLimitForwardsTo when switching to OPTIONAL mode', async () => {
            (fetch as MockFetch)?.pause?.();
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});

            const policyID = Policy.generatePolicyID();
            const employeeList = {
                [ESH_EMAIL]: {
                    email: ESH_EMAIL,
                    submitsTo: ESH_EMAIL,
                    forwardsTo: EMPLOYEE_EMAIL,
                    overLimitForwardsTo: EMPLOYEE_EMAIL,
                    role: CONST.POLICY.ROLE.ADMIN,
                },
                [EMPLOYEE_EMAIL]: {
                    email: EMPLOYEE_EMAIL,
                    submitsTo: ESH_EMAIL,
                    forwardsTo: ESH_EMAIL,
                    role: CONST.POLICY.ROLE.USER,
                },
            };

            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
                employeeList,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            // forwardsTo and overLimitForwardsTo should be cleared
            expect(policy?.employeeList?.[ESH_EMAIL]?.forwardsTo).toBe('');
            expect(policy?.employeeList?.[ESH_EMAIL]?.overLimitForwardsTo).toBe('');
            // submitsTo should be set to the policy owner
            expect(policy?.employeeList?.[ESH_EMAIL]?.submitsTo).toBe(ESH_EMAIL);

            expect(policy?.employeeList?.[EMPLOYEE_EMAIL]?.forwardsTo).toBe('');
            // submitsTo should be set to the policy owner
            expect(policy?.employeeList?.[EMPLOYEE_EMAIL]?.submitsTo).toBe(ESH_EMAIL);
            // overLimitForwardsTo was not set, so it should remain undefined
            expect(policy?.employeeList?.[EMPLOYEE_EMAIL]?.overLimitForwardsTo).toBeUndefined();

            expect(policy?.pendingFields?.approvalMode).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            (fetch as MockFetch)?.resume?.();
        });

        it('should call DISABLE_POLICY_APPROVALS when switching to OPTIONAL mode', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const policyID = Policy.generatePolicyID();
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.DISABLE_POLICY_APPROVALS, expect.objectContaining({policyID}), expect.anything());

            apiWriteSpy.mockRestore();
        });

        it('should call SET_WORKSPACE_APPROVAL_MODE when switching to non-OPTIONAL mode', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const policyID = Policy.generatePolicyID();
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.SET_WORKSPACE_APPROVAL_MODE, expect.objectContaining({policyID}), expect.anything());

            apiWriteSpy.mockRestore();
        });

        it('should not modify employee list when switching to non-OPTIONAL mode', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            const policyID = Policy.generatePolicyID();
            const employeeList = {
                [ESH_EMAIL]: {
                    email: ESH_EMAIL,
                    submitsTo: ESH_EMAIL,
                    forwardsTo: EMPLOYEE_EMAIL,
                    overLimitForwardsTo: EMPLOYEE_EMAIL,
                    role: CONST.POLICY.ROLE.ADMIN,
                },
                [EMPLOYEE_EMAIL]: {
                    email: EMPLOYEE_EMAIL,
                    submitsTo: ESH_EMAIL,
                    forwardsTo: ESH_EMAIL,
                    role: CONST.POLICY.ROLE.USER,
                },
            };

            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
                employeeList,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            // optimisticMembersState should be empty for non-OPTIONAL mode
            const writeOptions = apiWriteSpy.mock.calls.at(0)?.at(2) as {optimisticData?: Array<{key?: string; value?: Record<string, unknown>}>} | undefined;
            const policyOptimisticData = writeOptions?.optimisticData?.find((u) => u?.key === `${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(policyOptimisticData?.value?.employeeList).toEqual({});

            apiWriteSpy.mockRestore();
        });

        it('should restore original employee list on API failure when switching to OPTIONAL mode', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});

            const policyID = Policy.generatePolicyID();
            const employeeList = {
                [ESH_EMAIL]: {
                    email: ESH_EMAIL,
                    submitsTo: ESH_EMAIL,
                    forwardsTo: EMPLOYEE_EMAIL,
                    overLimitForwardsTo: EMPLOYEE_EMAIL,
                    role: CONST.POLICY.ROLE.ADMIN,
                },
                [EMPLOYEE_EMAIL]: {
                    email: EMPLOYEE_EMAIL,
                    submitsTo: ESH_EMAIL,
                    forwardsTo: ESH_EMAIL,
                    role: CONST.POLICY.ROLE.USER,
                },
            };

            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
                employeeList,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // Simulate API failure
            mockFetch?.fail?.();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            // On failure, employee list should be restored to original
            expect(policy?.employeeList).toEqual(employeeList);
            // Approval mode should revert to original
            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.ADVANCED);
            // Pending field should be cleared
            expect(policy?.pendingFields?.approvalMode).toBeFalsy();
            // Error field should be set
            expect(policy?.errorFields?.approvalMode).toBeTruthy();

            mockFetch?.succeed?.();
        });

        it('should only update employees that have submitsTo, forwardsTo, or overLimitForwardsTo set', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const employeeWithNoForwarding = 'noforward@example.com';

            const policyID = Policy.generatePolicyID();
            const employeeList = {
                [ESH_EMAIL]: {
                    email: ESH_EMAIL,
                    submitsTo: ESH_EMAIL,
                    forwardsTo: EMPLOYEE_EMAIL,
                    role: CONST.POLICY.ROLE.ADMIN,
                },
                [employeeWithNoForwarding]: {
                    email: employeeWithNoForwarding,
                    role: CONST.POLICY.ROLE.USER,
                },
            };

            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
                employeeList,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            const writeOptions = apiWriteSpy.mock.calls.at(0)?.at(2) as
                | {
                      optimisticData?: Array<{key?: string; value?: {employeeList?: Record<string, unknown>}}>;
                  }
                | undefined;
            const policyOptimisticData = writeOptions?.optimisticData?.find((u) => u?.key === `${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            const optimisticEmployeeList = policyOptimisticData?.value?.employeeList as Record<string, Record<string, unknown>> | undefined;

            // Employee with submitsTo and forwardsTo should be updated
            expect(optimisticEmployeeList?.[ESH_EMAIL]).toBeDefined();
            expect(optimisticEmployeeList?.[ESH_EMAIL]?.submitsTo).toBe(ESH_EMAIL);
            expect(optimisticEmployeeList?.[ESH_EMAIL]?.forwardsTo).toBe('');

            // Employee with no forwarding fields should not be in the updates
            expect(optimisticEmployeeList?.[employeeWithNoForwarding]).toBeUndefined();

            apiWriteSpy.mockRestore();
        });

        it('should set submitsTo to policy owner for all employees when switching to OPTIONAL', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const differentApprover = 'manager@example.com';

            const policyID = Policy.generatePolicyID();
            const employeeList = {
                [EMPLOYEE_EMAIL]: {
                    email: EMPLOYEE_EMAIL,
                    submitsTo: differentApprover,
                    forwardsTo: differentApprover,
                    role: CONST.POLICY.ROLE.USER,
                },
            };

            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
                employeeList,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            const writeOptions = apiWriteSpy.mock.calls.at(0)?.at(2) as
                | {
                      optimisticData?: Array<{key?: string; value?: {employeeList?: Record<string, Record<string, unknown>>}}>;
                  }
                | undefined;
            const policyOptimisticData = writeOptions?.optimisticData?.find((u) => u?.key === `${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            const optimisticEmployeeList = policyOptimisticData?.value?.employeeList;

            // submitsTo should be set to the policy owner (ESH_EMAIL), not the previous approver
            expect(optimisticEmployeeList?.[EMPLOYEE_EMAIL]?.submitsTo).toBe(ESH_EMAIL);
            expect(optimisticEmployeeList?.[EMPLOYEE_EMAIL]?.forwardsTo).toBe('');

            apiWriteSpy.mockRestore();
        });

        it('should preserve preventSelfApproval value and pending state when switching from OPTIONAL to BASIC', async () => {
            (fetch as MockFetch)?.pause?.();
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});

            const policyID = Policy.generatePolicyID();
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
                preventSelfApproval: true,
                pendingFields: {
                    preventSelfApproval: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.BASIC);
            expect(policy?.preventSelfApproval).toBe(true);
            expect(policy?.pendingFields?.approvalMode).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(policy?.pendingFields?.preventSelfApproval).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

            (fetch as MockFetch)?.resume?.();
            await waitForBatchedUpdates();

            policy = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.BASIC);
            expect(policy?.preventSelfApproval).toBe(true);
            expect(policy?.pendingFields?.approvalMode).toBeFalsy();
            expect(policy?.pendingFields?.preventSelfApproval).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
        });

        it('should preserve preventSelfApproval value and pending state when switching to OPTIONAL while preventSelfApproval is disabled', async () => {
            (fetch as MockFetch)?.pause?.();
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});

            const policyID = Policy.generatePolicyID();
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
                preventSelfApproval: false,
                pendingFields: {
                    preventSelfApproval: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.OPTIONAL);
            expect(policy?.preventSelfApproval).toBe(false);
            expect(policy?.pendingFields?.approvalMode).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(policy?.pendingFields?.preventSelfApproval).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

            (fetch as MockFetch)?.resume?.();
            await waitForBatchedUpdates();

            policy = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.OPTIONAL);
            expect(policy?.preventSelfApproval).toBe(false);
            expect(policy?.pendingFields?.approvalMode).toBeFalsy();
            expect(policy?.pendingFields?.preventSelfApproval).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
        });

        it('should disable preventSelfApproval and set its pending state when switching to OPTIONAL while preventSelfApproval is enabled', async () => {
            (fetch as MockFetch)?.pause?.();
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});

            const policyID = Policy.generatePolicyID();
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
                preventSelfApproval: true,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            let policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.OPTIONAL);
            expect(policy?.preventSelfApproval).toBe(false);
            expect(policy?.pendingFields?.approvalMode).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(policy?.pendingFields?.preventSelfApproval).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            (fetch as MockFetch)?.resume?.();
            await waitForBatchedUpdates();

            policy = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.OPTIONAL);
            expect(policy?.preventSelfApproval).toBe(false);
            expect(policy?.pendingFields?.approvalMode).toBeFalsy();
            expect(policy?.pendingFields?.preventSelfApproval).toBeFalsy();
        });

        it('should roll back preventSelfApproval value and pending state when switching to OPTIONAL fails', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});

            const policyID = Policy.generatePolicyID();
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                approver: ESH_EMAIL,
                owner: ESH_EMAIL,
                preventSelfApproval: true,
                pendingFields: {
                    preventSelfApproval: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            mockFetch?.fail?.();

            Policy.setWorkspaceApprovalMode(fakePolicy, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, ESH_ACCOUNT_ID, ESH_EMAIL);
            await waitForBatchedUpdates();

            const policy: OnyxEntry<PolicyType> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (workspace) => {
                        Onyx.disconnect(connection);
                        resolve(workspace);
                    },
                });
            });

            expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.BASIC);
            expect(policy?.preventSelfApproval).toBe(true);
            expect(policy?.pendingFields?.approvalMode).toBeFalsy();
            expect(policy?.pendingFields?.preventSelfApproval).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(policy?.errorFields?.approvalMode).toBeTruthy();

            mockFetch?.succeed?.();
        });
    });

    describe('deleteWorkspace', () => {
        it('should apply failure data when deleteWorkspace fails', async () => {
            // Given a policy
            const fakePolicy = createRandomPolicy(0);
            const fakeReport = {
                ...createRandomReport(0, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                policyName: fakePolicy.name,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);

            // When deleting a workspace fails
            mockFetch?.fail?.();
            Policy.deleteWorkspace({
                policies: {[`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`]: fakePolicy},
                policyID: fakePolicy.id,
                personalPolicyID: undefined,
                activePolicyID: undefined,
                policyName: fakePolicy.name,
                lastAccessedWorkspacePolicyID: undefined,
                policyCardFeeds: undefined,
                reportsToArchive: [fakeReport],
                transactionViolations: undefined,
                reimbursementAccountError: {},
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
                currentUserAccountID: ESH_ACCOUNT_ID,
                accountIDToLogin: {},
            });

            await waitForBatchedUpdates();

            // Then it should apply the correct failure data
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.pendingAction).toBeUndefined();
                        expect(policy?.avatarURL).toBe(fakePolicy.avatarURL);
                        resolve();
                    },
                });
            });

            // Unarchive the report (report key)
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.stateNum).toBe(fakeReport.stateNum);
                        expect(report?.statusNum).toBe(fakeReport.statusNum);
                        expect(report?.policyName).toBe(fakeReport.policyName);
                        expect(report?.oldPolicyName).toBe(fakePolicy.name);
                        resolve();
                    },
                });
            });

            // Unarchive the report (reportNameValuePairs key)
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${fakeReport.reportID}`,
                    callback: (reportNameValuePairs) => {
                        Onyx.disconnect(connection);
                        expect(reportNameValuePairs?.private_isArchived).toBeUndefined();
                        resolve();
                    },
                });
            });

            // Restore the reimbursement account errors
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    callback: (reimbursementAccount) => {
                        Onyx.disconnect(connection);
                        expect(reimbursementAccount?.errors).not.toBeUndefined();
                        resolve();
                    },
                });
            });
        });

        it('should remove violation from expense report', async () => {
            const policyID = '123';
            const expenseChatReportID = '1';
            const expenseReportID = '2';
            const transactionID = '3';
            const expenseChatReport = {
                ...createRandomReport(Number(expenseChatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                policyID,
                iouReportID: expenseReportID,
            } as Report;
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`, expenseChatReport);

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                reportID: expenseReportID,
                transactionID,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [
                {name: 'cashExpenseWithNoReceipt', type: CONST.VIOLATION_TYPES.VIOLATION},
                {name: 'hold', type: CONST.VIOLATION_TYPES.WARNING},
            ]);

            Policy.deleteWorkspace({
                policies: {},
                policyID,
                personalPolicyID: undefined,
                activePolicyID: undefined,
                policyName: 'test',
                lastAccessedWorkspacePolicyID: undefined,
                policyCardFeeds: undefined,
                reportsToArchive: [expenseChatReport],
                transactionViolations: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    transactionViolations_3: [
                        {name: 'cashExpenseWithNoReceipt', type: CONST.VIOLATION_TYPES.VIOLATION},
                        {name: 'hold', type: CONST.VIOLATION_TYPES.WARNING},
                    ],
                },
                reimbursementAccountError: undefined,
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
                currentUserAccountID: ESH_ACCOUNT_ID,
                accountIDToLogin: {},
            });

            await waitForBatchedUpdates();

            const violations = await new Promise<OnyxEntry<TransactionViolations>>((resolve) => {
                Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                    callback: resolve,
                });
            });

            expect(violations?.every((violation) => violation.type !== CONST.VIOLATION_TYPES.VIOLATION)).toBe(true);
        });

        it('should update active policy ID to most recently created group policy when deleting the active policy', async () => {
            const personalPolicy = createRandomPolicy(1, CONST.POLICY.TYPE.PERSONAL);
            personalPolicy.created = '2020-01-01 10:00:00';
            personalPolicy.pendingAction = null;

            const randomGroupPolicy = createRandomPolicy(2, CONST.POLICY.TYPE.TEAM);
            randomGroupPolicy.created = '2021-01-01 10:00:00';
            personalPolicy.pendingAction = null;

            const randomGroupPolicy2 = createRandomPolicy(3, CONST.POLICY.TYPE.CORPORATE);
            randomGroupPolicy2.created = '2022-01-01 10:00:00';
            randomGroupPolicy2.pendingAction = null;

            const mostRecentlyCreatedGroupPolicy = createRandomPolicy(0, CONST.POLICY.TYPE.TEAM);
            mostRecentlyCreatedGroupPolicy.created = '3000-01-01 10:00:00';
            mostRecentlyCreatedGroupPolicy.pendingAction = null;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${personalPolicy.id}`, personalPolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${randomGroupPolicy.id}`, randomGroupPolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${randomGroupPolicy2.id}`, randomGroupPolicy2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mostRecentlyCreatedGroupPolicy.id}`, mostRecentlyCreatedGroupPolicy);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, randomGroupPolicy.id);
            await waitForBatchedUpdates();

            Policy.deleteWorkspace({
                policies: {
                    [`${ONYXKEYS.COLLECTION.POLICY}${personalPolicy.id}`]: personalPolicy,
                    [`${ONYXKEYS.COLLECTION.POLICY}${randomGroupPolicy.id}`]: randomGroupPolicy,
                    [`${ONYXKEYS.COLLECTION.POLICY}${randomGroupPolicy2.id}`]: randomGroupPolicy2,
                    [`${ONYXKEYS.COLLECTION.POLICY}${mostRecentlyCreatedGroupPolicy.id}`]: mostRecentlyCreatedGroupPolicy,
                },
                policyID: randomGroupPolicy.id,
                personalPolicyID: personalPolicy.id,
                activePolicyID: randomGroupPolicy.id,
                policyName: randomGroupPolicy.name,
                lastAccessedWorkspacePolicyID: undefined,
                policyCardFeeds: undefined,
                reportsToArchive: [],
                transactionViolations: undefined,
                reimbursementAccountError: undefined,
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
                currentUserAccountID: ESH_ACCOUNT_ID,
                accountIDToLogin: {},
            });
            await waitForBatchedUpdates();

            const activePolicyID: OnyxEntry<string> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
                    callback: (policyID) => {
                        Onyx.disconnect(connection);
                        resolve(policyID);
                    },
                });
            });

            expect(activePolicyID).toBe(mostRecentlyCreatedGroupPolicy.id);
        });

        it('should reset lastAccessedWorkspacePolicyID when deleting the last accessed workspace', async () => {
            const policyToDelete = createRandomPolicy(0, CONST.POLICY.TYPE.TEAM);
            const lastAccessedWorkspacePolicyID = policyToDelete.id;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyToDelete.id}`, policyToDelete);
            await Onyx.merge(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, lastAccessedWorkspacePolicyID);
            await waitForBatchedUpdates();

            Policy.deleteWorkspace({
                policies: {[`${ONYXKEYS.COLLECTION.POLICY}${policyToDelete.id}`]: policyToDelete},
                policyID: policyToDelete.id,
                personalPolicyID: undefined,
                activePolicyID: undefined,
                policyName: policyToDelete.name,
                lastAccessedWorkspacePolicyID,
                policyCardFeeds: undefined,
                reportsToArchive: [],
                transactionViolations: undefined,
                reimbursementAccountError: undefined,
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
                currentUserAccountID: ESH_ACCOUNT_ID,
                accountIDToLogin: {},
            });
            await waitForBatchedUpdates();

            const lastAccessedWorkspacePolicyIDAfterDelete: OnyxEntry<string> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID,
                    callback: (policyID) => {
                        Onyx.disconnect(connection);
                        resolve(policyID);
                    },
                });
            });

            expect(lastAccessedWorkspacePolicyIDAfterDelete).toBeUndefined();
        });

        it('should not reset lastAccessedWorkspacePolicyID when deleting a different workspace', async () => {
            const policyToDelete = createRandomPolicy(0, CONST.POLICY.TYPE.TEAM);
            const differentPolicy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM);
            const lastAccessedWorkspacePolicyID = differentPolicy.id;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyToDelete.id}`, policyToDelete);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${differentPolicy.id}`, differentPolicy);
            await Onyx.merge(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, lastAccessedWorkspacePolicyID);
            await waitForBatchedUpdates();

            Policy.deleteWorkspace({
                policies: {[`${ONYXKEYS.COLLECTION.POLICY}${policyToDelete.id}`]: policyToDelete},
                policyID: policyToDelete.id,
                personalPolicyID: undefined,
                activePolicyID: undefined,
                policyName: policyToDelete.name,
                lastAccessedWorkspacePolicyID,
                policyCardFeeds: undefined,
                reportsToArchive: [],
                transactionViolations: undefined,
                reimbursementAccountError: undefined,
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
                currentUserAccountID: ESH_ACCOUNT_ID,
                accountIDToLogin: {},
            });
            await waitForBatchedUpdates();

            const lastAccessedWorkspacePolicyIDAfterDelete: OnyxEntry<string> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID,
                    callback: (policyID) => {
                        Onyx.disconnect(connection);
                        resolve(policyID);
                    },
                });
            });

            expect(lastAccessedWorkspacePolicyIDAfterDelete).toBe(lastAccessedWorkspacePolicyID);
        });

        it('should use accountIDToLogin to resolve owner email in closed report action', async () => {
            const ownerAccountID = 42;
            const ownerLogin = 'owner@example.com';
            const fakePolicy = createRandomPolicy(0);
            const fakeReport = {
                ...createRandomReport(0, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                ownerAccountID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                policyName: fakePolicy.name,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);

            Policy.deleteWorkspace({
                policies: {[`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`]: fakePolicy},
                policyID: fakePolicy.id,
                personalPolicyID: undefined,
                activePolicyID: undefined,
                policyName: fakePolicy.name,
                lastAccessedWorkspacePolicyID: undefined,
                policyCardFeeds: undefined,
                reportsToArchive: [fakeReport],
                transactionViolations: undefined,
                reimbursementAccountError: undefined,
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
                currentUserAccountID: ESH_ACCOUNT_ID,
                accountIDToLogin: {[ownerAccountID]: ownerLogin},
            });

            await waitForBatchedUpdates();

            // Then the closed report action should contain the owner's login from accountIDToLogin
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}` as const);
            const closedAction = Object.values(reportActions ?? {}).find((action) => action && 'actionName' in action && action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
            expect(closedAction).toBeDefined();
            const message = closedAction && 'message' in closedAction && Array.isArray(closedAction.message) ? closedAction.message.at(0) : undefined;
            expect(message?.text).toBe(ownerLogin);
        });

        it('should use fake owner email when ownerAccountID is fake', async () => {
            const fakePolicy = createRandomPolicy(0);
            const fakeReport = {
                ...createRandomReport(0, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                ownerAccountID: CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                policyName: fakePolicy.name,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);

            Policy.deleteWorkspace({
                policies: {[`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`]: fakePolicy},
                policyID: fakePolicy.id,
                personalPolicyID: undefined,
                activePolicyID: undefined,
                policyName: fakePolicy.name,
                lastAccessedWorkspacePolicyID: undefined,
                policyCardFeeds: undefined,
                reportsToArchive: [fakeReport],
                transactionViolations: undefined,
                reimbursementAccountError: undefined,
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
                currentUserAccountID: ESH_ACCOUNT_ID,
                accountIDToLogin: {},
            });

            await waitForBatchedUpdates();

            // Then the closed report action should use the fake owner email
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}` as const);
            const closedAction = Object.values(reportActions ?? {}).find((action) => action && 'actionName' in action && action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
            expect(closedAction).toBeDefined();
            const message = closedAction && 'message' in closedAction && Array.isArray(closedAction.message) ? closedAction.message.at(0) : undefined;
            expect(message?.text).toBe(CONST.POLICY.OWNER_EMAIL_FAKE);
        });

        it('should fall back to empty string when accountIDToLogin has no entry for ownerAccountID', async () => {
            const ownerAccountID = 99;
            const fakePolicy = createRandomPolicy(0);
            const fakeReport = {
                ...createRandomReport(0, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                ownerAccountID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                policyName: fakePolicy.name,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);

            Policy.deleteWorkspace({
                policies: {[`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`]: fakePolicy},
                policyID: fakePolicy.id,
                personalPolicyID: undefined,
                activePolicyID: undefined,
                policyName: fakePolicy.name,
                lastAccessedWorkspacePolicyID: undefined,
                policyCardFeeds: undefined,
                reportsToArchive: [fakeReport],
                transactionViolations: undefined,
                reimbursementAccountError: undefined,
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
                currentUserAccountID: ESH_ACCOUNT_ID,
                accountIDToLogin: {},
            });

            await waitForBatchedUpdates();

            // Then the closed report action should have an empty string for the email
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}` as const);
            const closedAction = Object.values(reportActions ?? {}).find((action) => action && 'actionName' in action && action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
            expect(closedAction).toBeDefined();
            const message = closedAction && 'message' in closedAction && Array.isArray(closedAction.message) ? closedAction.message.at(0) : undefined;
            expect(message?.text).toBe('');
        });
    });

    describe('leaveWorkspace', () => {
        it('should leave workspace and archive reports', async () => {
            // Given a policy and a report in Onyx
            const policy = createRandomPolicy(1);
            const report = {
                ...createRandomReport(1, undefined),
                policyID: policy.id,
            };

            // Set initial state in Onyx
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            // When leaveWorkspace is called
            Policy.leaveWorkspace(1, 'esh@gmail.com', policy);

            await waitForBatchedUpdates();

            // Then the policy should be removed
            const policyAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(policyAfter).toBeFalsy();

            // And the report should be closed and archived
            const reportAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`);
            expect(reportAfter).toMatchObject({
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            });

            const reportNameValuePairsAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`);
            expect(reportNameValuePairsAfter?.private_isArchived).toBeTruthy();

            const reportMetadataAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`);
            expect(reportMetadataAfter?.pendingChatMembers).toBeFalsy();
        });

        it('should do nothing when policy is null', async () => {
            const policy = createRandomPolicy(1);
            const report = {
                ...createRandomReport(1, undefined),
                policyID: policy.id,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await waitForBatchedUpdates();

            Policy.leaveWorkspace(ESH_ACCOUNT_ID, ESH_EMAIL, policy);
            await waitForBatchedUpdates();

            // The policy should be removed
            const policyAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(policyAfter).toBeFalsy();

            // The report should be closed and archived
            const reportAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`);
            expect(reportAfter).toMatchObject({
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            });
        });
    });

    describe('generateDefaultWorkspaceName', () => {
        beforeAll(() => {
            Onyx.set(ONYXKEYS.COLLECTION.POLICY, {});
        });

        it('should generate a workspace name based on the email domain when the domain is not public', () => {
            const domain = 'example.com';
            const displayNameForWorkspace = Str.UCFirst(domain.split('.').at(0) ?? '');

            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_NON_PUBLIC_DOMAIN_EMAIL, undefined, TestHelper.translateLocal);
            expect(workspaceName).toBe(TestHelper.translateLocal('workspace.new.workspaceName', displayNameForWorkspace));
        });

        it('should generate a workspace name based on the display name when the domain is public and display name is available', () => {
            const displayNameForWorkspace = Str.UCFirst(TEST_DISPLAY_NAME);

            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL, undefined, TestHelper.translateLocal);
            expect(workspaceName).toBe(TestHelper.translateLocal('workspace.new.workspaceName', displayNameForWorkspace));
        });

        it('should generate a workspace name based on the username when the domain is public and display name is not available', () => {
            const emailParts = TEST_EMAIL_2.split('@');
            const username = emailParts.at(0) ?? '';
            const displayNameForWorkspace = Str.UCFirst(username);

            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: '',
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL_2, undefined, TestHelper.translateLocal);
            expect(workspaceName).toBe(TestHelper.translateLocal('workspace.new.workspaceName', displayNameForWorkspace));
        });

        it('should generate a workspace name with an incremented number when there are existing policies with similar names', async () => {
            const existingPolicies = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.PERSONAL, `${TEST_DISPLAY_NAME}'s Workspace`),
                ...createRandomPolicy(0, CONST.POLICY.TYPE.PERSONAL, `${TEST_DISPLAY_NAME}'s Workspace 1`),
            };

            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });

            await Onyx.set(ONYXKEYS.COLLECTION.POLICY, existingPolicies);

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL, 1, TestHelper.translateLocal);
            expect(workspaceName).toBe(TestHelper.translateLocal('workspace.new.workspaceName', TEST_DISPLAY_NAME, 2));
        });

        it('should return "My Group Workspace" when the domain is SMS', () => {
            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_SMS_DOMAIN_EMAIL, undefined, TestHelper.translateLocal);
            expect(workspaceName).toBe(TestHelper.translateLocal('workspace.new.myGroupWorkspace', {}));
        });

        it('should generate a workspace name with an incremented number even if previous workspaces were created in english lang', async () => {
            await Onyx.set(ONYXKEYS.COLLECTION.POLICY, {});
            await IntlStore.load(CONST.LOCALES.ES);
            const existingPolicies = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.PERSONAL, `${TEST_DISPLAY_NAME}'s Workspace`),
                ...createRandomPolicy(0, CONST.POLICY.TYPE.PERSONAL, `${TEST_DISPLAY_NAME}'s Workspace 1`),
            };

            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });

            jest.spyOn(Str, 'UCFirst').mockReturnValue(TEST_DISPLAY_NAME);

            await Onyx.set(ONYXKEYS.COLLECTION.POLICY, existingPolicies);

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL, 1, TestHelper.translateLocal);
            expect(workspaceName).toBe(TestHelper.translateLocal('workspace.new.workspaceName', TEST_DISPLAY_NAME, 2));
        });
    });

    describe('joinAccessiblePolicy', () => {
        afterEach(() => {
            mockFetch?.resume?.();
        });

        it('correctly implements RedBrickRoad error handling for joinAccessiblePolicy when the request fails', async () => {
            const policyID = 'policy123';

            mockFetch.pause?.();

            // Call joinAccessiblePolicy
            joinAccessiblePolicy(policyID);
            await waitForBatchedUpdates();

            // Simulate network failure
            mockFetch.fail?.();
            await (mockFetch.resume?.() as Promise<unknown>);
            await waitForBatchedUpdates();

            // Verify error handling after failure - focus on policy join member error
            const policyJoinData = await new Promise<OnyxEntry<PolicyJoinMember>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_JOIN_MEMBER}${policyID}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });

            // The policy join should have the genericAdd error
            expect(policyJoinData?.errors).toBeTruthy();
            expect(Object.values(policyJoinData?.errors ?? {}).at(0)).toEqual(TestHelper.translateLocal('workspace.people.error.genericAdd'));

            mockFetch.succeed?.();
        });
    });

    describe('askToJoinPolicy', () => {
        afterEach(() => {
            mockFetch?.resume?.();
        });

        it('correctly implements RedBrickRoad error handling for askToJoinPolicy when the request fails', async () => {
            const policyID = 'policy123';

            mockFetch.pause?.();

            // Call askToJoinPolicy
            askToJoinPolicy(policyID);
            await waitForBatchedUpdates();

            // Simulate network failure
            mockFetch.fail?.();
            await (mockFetch.resume?.() as Promise<unknown>);
            await waitForBatchedUpdates();

            // Verify error handling after failure - focus on policy join member error
            const policyJoinData = await new Promise<OnyxEntry<PolicyJoinMember>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_JOIN_MEMBER}${policyID}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });

            // The policy join should have the genericAdd error
            expect(policyJoinData?.errors).toBeTruthy();
            expect(Object.values(policyJoinData?.errors ?? {}).at(0)).toEqual(TestHelper.translateLocal('workspace.people.error.genericAdd'));

            mockFetch.succeed?.();
        });
    });

    describe('setPolicyMaxExpenseAmountNoItemizedReceipt', () => {
        it('should set itemized receipt required amount', async () => {
            const fakePolicy = createRandomPolicy(0);
            const testAmount = '50.00';
            const expectedBackendAmount = 5000; // $50.00 in cents

            mockFetch?.pause?.();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Policy.setPolicyMaxExpenseAmountNoItemizedReceipt(fakePolicy.id, testAmount, undefined);
            await waitForBatchedUpdates();

            // Check optimistic data
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.maxExpenseAmountNoItemizedReceipt).toBe(expectedBackendAmount);
                        expect(policy?.pendingFields?.maxExpenseAmountNoItemizedReceipt).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        resolve();
                    },
                });
            });

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Check success data
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.pendingFields?.maxExpenseAmountNoItemizedReceipt).toBeFalsy();
                        expect(policy?.errorFields?.maxExpenseAmountNoItemizedReceipt).toBeFalsy();
                        resolve();
                    },
                });
            });
        });

        it('should disable itemized receipt requirement when empty string is passed', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.maxExpenseAmountNoItemizedReceipt = 7500;

            mockFetch?.pause?.();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Policy.setPolicyMaxExpenseAmountNoItemizedReceipt(fakePolicy.id, '', fakePolicy.maxExpenseAmountNoItemizedReceipt);
            await waitForBatchedUpdates();

            // Check optimistic data - should set to DISABLED_MAX_EXPENSE_VALUE
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.maxExpenseAmountNoItemizedReceipt).toBe(CONST.DISABLED_MAX_EXPENSE_VALUE);
                        expect(policy?.pendingFields?.maxExpenseAmountNoItemizedReceipt).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        resolve();
                    },
                });
            });

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
        });
    });

    describe('setPolicyMaxExpenseAmountNoReceipt', () => {
        it('should set max expense amount no receipt optimistically and succeed', async () => {
            // Given a policy with a max expense amount no receipt
            const policyID = '1';
            const initialMaxExpenseAmountNoReceipt = 5000;
            const fakePolicy = {
                id: policyID,
                maxExpenseAmountNoReceipt: initialMaxExpenseAmountNoReceipt,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyMaxExpenseAmountNoReceipt is called with a new amount
            mockFetch.pause();
            const newMaxExpenseAmountNoReceipt = '100.00';
            const expectedBackendAmount = 10000; // $100.00 in cents
            Policy.setPolicyMaxExpenseAmountNoReceipt(policyID, newMaxExpenseAmountNoReceipt, initialMaxExpenseAmountNoReceipt);
            await waitForBatchedUpdates();

            // Then the max expense amount no receipt should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.maxExpenseAmountNoReceipt).toBe(expectedBackendAmount);
            expect(updatedPolicy?.pendingFields?.maxExpenseAmountNoReceipt).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.pendingFields?.maxExpenseAmountNoReceipt).toBeUndefined();
        });

        it('should revert max expense amount no receipt when fail', async () => {
            // Given a policy with a max expense amount no receipt
            const policyID = '1';
            const initialMaxExpenseAmountNoReceipt = 5000;
            const fakePolicy = {
                id: policyID,
                maxExpenseAmountNoReceipt: initialMaxExpenseAmountNoReceipt,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyMaxExpenseAmountNoReceipt is called and fails
            mockFetch.fail();
            const newMaxExpenseAmountNoReceipt = '100.00';
            Policy.setPolicyMaxExpenseAmountNoReceipt(policyID, newMaxExpenseAmountNoReceipt, initialMaxExpenseAmountNoReceipt);
            await waitForBatchedUpdates();

            // Then the max expense amount no receipt should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.maxExpenseAmountNoReceipt).toBe(initialMaxExpenseAmountNoReceipt);
            expect(updatedPolicy?.errorFields?.maxExpenseAmountNoReceipt).toBeDefined();
        });
    });

    describe('setPolicyMaxExpenseAmount', () => {
        it('should set max expense amount optimistically and succeed', async () => {
            // Given a policy with a default max expense amount
            const policyID = '1';
            const initialMaxExpenseAmount = 5000;
            const fakePolicy = {
                id: policyID,
                maxExpenseAmount: initialMaxExpenseAmount,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyMaxExpenseAmount is called with a new amount
            mockFetch.pause();
            const newMaxExpenseAmount = '150.00';
            const expectedBackendAmount = 15000; // $150.00 in cents
            Policy.setPolicyMaxExpenseAmount(policyID, newMaxExpenseAmount, initialMaxExpenseAmount);
            await waitForBatchedUpdates();

            // Then the max expense amount should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.maxExpenseAmount).toBe(expectedBackendAmount);
            expect(updatedPolicy?.pendingFields?.maxExpenseAmount).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(updatedPolicy?.errorFields?.maxExpenseAmount).toBeUndefined();

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.pendingFields?.maxExpenseAmount).toBeUndefined();
            expect(updatedPolicy?.errorFields?.maxExpenseAmount).toBeUndefined();
        });

        it('should disable max expense amount when empty string is passed', async () => {
            // Given a policy with a max expense amount set
            const policyID = '1';
            const initialMaxExpenseAmount = 5000;
            const fakePolicy = {
                id: policyID,
                maxExpenseAmount: initialMaxExpenseAmount,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyMaxExpenseAmount is called with an empty string
            mockFetch.pause();
            Policy.setPolicyMaxExpenseAmount(policyID, '', initialMaxExpenseAmount);
            await waitForBatchedUpdates();

            // Then the max expense amount should be set to DISABLED value optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.maxExpenseAmount).toBe(CONST.DISABLED_MAX_EXPENSE_VALUE);
            expect(updatedPolicy?.pendingFields?.maxExpenseAmount).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.pendingFields?.maxExpenseAmount).toBeUndefined();
        });

        it('should revert max expense amount when fail', async () => {
            // Given a policy with an initial max expense amount
            const policyID = '1';
            const initialMaxExpenseAmount = 5000;
            const fakePolicy = {
                id: policyID,
                maxExpenseAmount: initialMaxExpenseAmount,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyMaxExpenseAmount is called and fails
            mockFetch.fail();
            const newMaxExpenseAmount = '150.00';
            Policy.setPolicyMaxExpenseAmount(policyID, newMaxExpenseAmount, initialMaxExpenseAmount);
            await waitForBatchedUpdates();

            // Then the max expense amount should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.maxExpenseAmount).toBe(initialMaxExpenseAmount);
            expect(updatedPolicy?.pendingFields?.maxExpenseAmount).toBeUndefined();
            expect(updatedPolicy?.errorFields?.maxExpenseAmount).toBeDefined();
        });
    });

    describe('setWorkspaceReimbursement', () => {
        const FAKE_POLICY_ID = 'FAKE_POLICY';
        const FAKE_REIMBURSER_EMAIL = 'admin@example.com';
        const FAKE_BANK_ACCOUNT_ID = 12345;
        const FAKE_ACCOUNT_NUMBER = '****1234';
        const FAKE_ADDRESS_NAME = 'Test Bank Account';
        const FAKE_BANK_NAME = 'Test Bank';
        const FAKE_BANK_STATE = 'OPEN';

        afterEach(() => {
            mockFetch?.resume?.();
        });

        it('sets optimistic data with bank account details on the policy', async () => {
            (fetch as MockFetch)?.pause?.();

            const fakePolicy = createRandomPolicy(0);
            fakePolicy.id = FAKE_POLICY_ID;
            fakePolicy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
            fakePolicy.achAccount = undefined;
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceReimbursement({
                policyID: FAKE_POLICY_ID,
                currentAchAccount: fakePolicy.achAccount,
                currentReimbursementChoice: fakePolicy.reimbursementChoice,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                bankAccountID: FAKE_BANK_ACCOUNT_ID,
                reimburserEmail: FAKE_REIMBURSER_EMAIL,
                accountNumber: FAKE_ACCOUNT_NUMBER,
                addressName: FAKE_ADDRESS_NAME,
                bankName: FAKE_BANK_NAME,
                state: FAKE_BANK_STATE,
            });
            await waitForBatchedUpdates();

            const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}`);
            expect(policy?.reimbursementChoice).toBe(CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES);
            expect(policy?.isLoadingWorkspaceReimbursement).toBe(true);
            expect(policy?.reimburser).toBe(FAKE_REIMBURSER_EMAIL);
            expect(policy?.achAccount?.bankAccountID).toBe(FAKE_BANK_ACCOUNT_ID);
            expect(policy?.achAccount?.accountNumber).toBe(FAKE_ACCOUNT_NUMBER);
            expect(policy?.achAccount?.addressName).toBe(FAKE_ADDRESS_NAME);
            expect(policy?.achAccount?.bankName).toBe(FAKE_BANK_NAME);
            expect(policy?.achAccount?.state).toBe(FAKE_BANK_STATE);
            expect(policy?.achAccount?.reimburser).toBe(FAKE_REIMBURSER_EMAIL);
            expect(policy?.errorFields?.reimbursementChoice).toBeFalsy();
            expect(policy?.pendingFields?.reimbursementChoice).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
        });

        it('clears loading and pending state on success', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.id = FAKE_POLICY_ID;
            fakePolicy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceReimbursement({
                policyID: FAKE_POLICY_ID,
                currentAchAccount: fakePolicy.achAccount,
                currentReimbursementChoice: fakePolicy.reimbursementChoice,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                bankAccountID: FAKE_BANK_ACCOUNT_ID,
                reimburserEmail: FAKE_REIMBURSER_EMAIL,
            });
            await waitForBatchedUpdates();

            const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}`);
            expect(policy?.isLoadingWorkspaceReimbursement).toBe(false);
            expect(policy?.pendingFields?.reimbursementChoice).toBeFalsy();
            expect(policy?.errorFields?.reimbursementChoice).toBeFalsy();
        });

        it('restores original policy values on failure, including bank account details', async () => {
            (fetch as MockFetch)?.fail?.();

            const fakePolicy = createRandomPolicy(0);
            fakePolicy.id = FAKE_POLICY_ID;
            fakePolicy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
            fakePolicy.achAccount = {
                reimburser: FAKE_REIMBURSER_EMAIL,
                bankAccountID: FAKE_BANK_ACCOUNT_ID,
                accountNumber: FAKE_ACCOUNT_NUMBER,
                addressName: FAKE_ADDRESS_NAME,
                bankName: FAKE_BANK_NAME,
                routingNumber: '111000025',
                state: FAKE_BANK_STATE,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceReimbursement({
                policyID: FAKE_POLICY_ID,
                currentAchAccount: fakePolicy.achAccount,
                currentReimbursementChoice: fakePolicy.reimbursementChoice,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                bankAccountID: FAKE_BANK_ACCOUNT_ID,
                reimburserEmail: FAKE_REIMBURSER_EMAIL,
                accountNumber: FAKE_ACCOUNT_NUMBER,
                addressName: FAKE_ADDRESS_NAME,
                bankName: FAKE_BANK_NAME,
                state: FAKE_BANK_STATE,
            });
            await waitForBatchedUpdates();

            const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}`);
            expect(policy?.isLoadingWorkspaceReimbursement).toBe(false);
            expect(policy?.reimbursementChoice).toBe(CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO);
            expect(policy?.achAccount?.reimburser).toBe(FAKE_REIMBURSER_EMAIL);
            expect(policy?.achAccount?.bankAccountID).toBe(FAKE_BANK_ACCOUNT_ID);
            expect(policy?.achAccount?.accountNumber).toBe(FAKE_ACCOUNT_NUMBER);
            expect(policy?.achAccount?.addressName).toBe(FAKE_ADDRESS_NAME);
            expect(policy?.achAccount?.bankName).toBe(FAKE_BANK_NAME);
            expect(policy?.achAccount?.state).toBe(FAKE_BANK_STATE);
            expect(policy?.errorFields?.reimbursementChoice).toBeDefined();
            expect(policy?.pendingFields?.reimbursementChoice).toBeFalsy();

            (fetch as MockFetch)?.succeed?.();
        });

        it('updates NVP_LAST_PAYMENT_METHOD when shouldUpdateLastPaymentMethod is true and no existing method', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.id = FAKE_POLICY_ID;
            fakePolicy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceReimbursement({
                policyID: FAKE_POLICY_ID,
                currentAchAccount: fakePolicy.achAccount,
                currentReimbursementChoice: fakePolicy.reimbursementChoice,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                bankAccountID: FAKE_BANK_ACCOUNT_ID,
                reimburserEmail: FAKE_REIMBURSER_EMAIL,
                shouldUpdateLastPaymentMethod: true,
            });
            await waitForBatchedUpdates();

            const lastPaymentMethod = await getOnyxValue(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
            expect(lastPaymentMethod?.[FAKE_POLICY_ID]).toEqual(
                expect.objectContaining({
                    expense: {
                        name: CONST.IOU.PAYMENT_TYPE.VBBA,
                        bankAccountID: FAKE_BANK_ACCOUNT_ID,
                    },
                    lastUsed: {
                        name: CONST.IOU.PAYMENT_TYPE.VBBA,
                        bankAccountID: FAKE_BANK_ACCOUNT_ID,
                    },
                }),
            );
        });

        it('does not update NVP_LAST_PAYMENT_METHOD when existing payment method is present', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.id = FAKE_POLICY_ID;
            fakePolicy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceReimbursement({
                policyID: FAKE_POLICY_ID,
                currentAchAccount: fakePolicy.achAccount,
                currentReimbursementChoice: fakePolicy.reimbursementChoice,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                bankAccountID: FAKE_BANK_ACCOUNT_ID,
                reimburserEmail: FAKE_REIMBURSER_EMAIL,
                lastPaymentMethod: {
                    lastUsed: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                    iou: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                    expense: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                    invoice: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                },
                shouldUpdateLastPaymentMethod: true,
            });
            await waitForBatchedUpdates();

            const lastPaymentMethod = await getOnyxValue(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
            // When an existing lastPaymentMethod.expense.name exists, the success data should NOT update NVP_LAST_PAYMENT_METHOD
            expect(lastPaymentMethod?.[FAKE_POLICY_ID]).toBeUndefined();
        });

        it('sends the correct API params', async () => {
            const fakePolicy = createRandomPolicy(0);
            fakePolicy.id = FAKE_POLICY_ID;
            fakePolicy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${FAKE_POLICY_ID}`, fakePolicy);
            await waitForBatchedUpdates();

            Policy.setWorkspaceReimbursement({
                policyID: FAKE_POLICY_ID,
                currentAchAccount: fakePolicy.achAccount,
                currentReimbursementChoice: fakePolicy.reimbursementChoice,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                bankAccountID: FAKE_BANK_ACCOUNT_ID,
                reimburserEmail: FAKE_REIMBURSER_EMAIL,
                accountNumber: FAKE_ACCOUNT_NUMBER,
                addressName: FAKE_ADDRESS_NAME,
                bankName: FAKE_BANK_NAME,
                state: FAKE_BANK_STATE,
            });
            await waitForBatchedUpdates();

            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.SET_WORKSPACE_REIMBURSEMENT, 1);
            // FormData serializes all values to strings
            const calls = TestHelper.getFetchMockCalls(WRITE_COMMANDS.SET_WORKSPACE_REIMBURSEMENT);
            expect(calls).toHaveLength(1);
            const call = calls.at(0);
            const body = (call?.at(1) as RequestInit)?.body;
            const params = body instanceof FormData ? Object.fromEntries(body as unknown as Iterable<[string, string]>) : {};
            expect(params).toEqual(
                expect.objectContaining({
                    policyID: FAKE_POLICY_ID,
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                    bankAccountID: String(FAKE_BANK_ACCOUNT_ID),
                }),
            );
        });
    });

    describe('enablePolicyTaxes', () => {
        it('should enable policy taxes optimistically and succeed', async () => {
            // Given a policy with taxes disabled
            const policyID = '1';
            const fakePolicy = {
                id: policyID,
                tax: {
                    trackingEnabled: false,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When enablePolicyTaxes is called to enable taxes
            mockFetch.pause();
            Policy.enablePolicyTaxes(policyID, true, undefined);
            await waitForBatchedUpdates();

            // Then the policy tax tracking should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.tax?.trackingEnabled).toBe(true);
            expect(updatedPolicy?.pendingFields?.tax).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            // And taxRates should be updated with default taxes
            expect(updatedPolicy?.taxRates?.taxes).toBeDefined();

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // And the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.pendingFields?.tax).toBeUndefined();
            for (const tax of Object.values(updatedPolicy?.taxRates?.taxes ?? {})) {
                expect(tax.pendingAction).toBeUndefined();
            }
        });

        it('should revert policy taxes when fail', async () => {
            // Given a policy with taxes disabled
            const policyID = '1';
            const fakePolicy = {
                id: policyID,
                tax: {
                    trackingEnabled: false,
                },
                taxRates: {},
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When enablePolicyTaxes is called and fails
            mockFetch.fail();
            Policy.enablePolicyTaxes(policyID, true, undefined);
            await waitForBatchedUpdates();

            // Then the policy tax tracking should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.tax?.trackingEnabled).toBe(false);
            expect(updatedPolicy?.pendingFields?.tax).toBeUndefined();
            expect(updatedPolicy?.taxRates).toBeUndefined();
        });
    });
    describe('enablePolicyWorkflows', () => {
        it('should enable policy workflows optimistically and succeed', async () => {
            // Given a policy with workflows disabled
            const policyID = '1';
            const fakePolicy = {
                id: policyID,
                areWorkflowsEnabled: false,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When enablePolicyWorkflows is called to enable workflows
            mockFetch.pause();
            Policy.enablePolicyWorkflows(policyID, true, undefined, undefined, undefined, undefined);
            await waitForBatchedUpdates();

            // Then workflows should be enabled optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.areWorkflowsEnabled).toBe(true);
            expect(updatedPolicy?.pendingFields?.areWorkflowsEnabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // And the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.pendingFields?.areWorkflowsEnabled).toBeUndefined();
        });

        it('should revert policy workflows when fail', async () => {
            // Given a policy with workflows enabled
            const policyID = '1';
            const fakePolicy = {
                id: policyID,
                areWorkflowsEnabled: true,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                autoReporting: true,
                harvesting: {enabled: true, jobID: 123},
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When enablePolicyWorkflows is called to disable workflows and fails
            mockFetch.fail();
            Policy.enablePolicyWorkflows(policyID, false, fakePolicy.approvalMode, fakePolicy.autoReporting, fakePolicy.harvesting, fakePolicy.reimbursementChoice);
            await waitForBatchedUpdates();

            // Then workflows should be reverted to enabled and other fields restored
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.areWorkflowsEnabled).toBe(true);
            expect(updatedPolicy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.ADVANCED);
            expect(updatedPolicy?.autoReporting).toBe(true);
            expect(updatedPolicy?.harvesting?.enabled).toBe(true);
            expect(updatedPolicy?.reimbursementChoice).toBe(CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES);
            expect(updatedPolicy?.pendingFields?.areWorkflowsEnabled).toBeUndefined();
        });
    });
    describe('enableDistanceRequestTax', () => {
        it('should enable distance request tax optimistically and succeed', async () => {
            // Given a policy with a custom unit and tax disabled
            const policyID = '1';
            const customUnitID = 'unit_1';
            const customUnitName = 'Distance';
            const initialAttributes = {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, taxEnabled: false};
            const fakePolicy = {
                id: policyID,
                customUnits: {
                    [customUnitID]: {
                        customUnitID,
                        name: customUnitName,
                        attributes: initialAttributes,
                    },
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When enableDistanceRequestTax is called to enable tax
            mockFetch.pause();
            const newAttributes = {...initialAttributes, taxEnabled: true};
            Policy.enableDistanceRequestTax(policyID, customUnitName, customUnitID, newAttributes, initialAttributes);
            await waitForBatchedUpdates();

            // Then taxEnabled should be true optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.customUnits?.[customUnitID]?.attributes?.taxEnabled).toBe(true);
            expect(updatedPolicy?.customUnits?.[customUnitID]?.pendingFields?.taxEnabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // And the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.customUnits?.[customUnitID]?.pendingFields?.taxEnabled).toBeUndefined();
        });

        it('should revert distance request tax when fail', async () => {
            // Given a policy with a custom unit and tax enabled
            const policyID = '1';
            const customUnitID = 'unit_1';
            const customUnitName = 'Distance';
            const initialAttributes = {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, taxEnabled: true};
            const fakePolicy = {
                id: policyID,
                customUnits: {
                    [customUnitID]: {
                        customUnitID,
                        name: customUnitName,
                        attributes: initialAttributes,
                    },
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When enableDistanceRequestTax is called to disable tax and fails
            mockFetch.fail();
            const newAttributes = {...initialAttributes, taxEnabled: false};
            Policy.enableDistanceRequestTax(policyID, customUnitName, customUnitID, newAttributes, initialAttributes);
            await waitForBatchedUpdates();

            // Then taxEnabled should be reverted to true
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.customUnits?.[customUnitID]?.attributes?.taxEnabled).toBe(true);
        });
    });

    describe('updateInvoiceCompanyName', () => {
        it('should update invoice company name optimistically and succeed', async () => {
            // Given a policy with an invoice company name
            const policyID = '1';
            const initialCompanyName = 'Initial Corp';
            const fakePolicy = {
                id: policyID,
                invoice: {
                    companyName: initialCompanyName,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When updateInvoiceCompanyName is called
            mockFetch.pause();
            const newCompanyName = 'New Corp';
            Policy.updateInvoiceCompanyName(policyID, newCompanyName, initialCompanyName);
            await waitForBatchedUpdates();

            // Then companyName should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.invoice?.companyName).toBe(newCompanyName);
            expect(updatedPolicy?.invoice?.pendingFields?.companyName).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // And the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.invoice?.pendingFields?.companyName).toBeUndefined();
        });

        it('should revert invoice company name when fail', async () => {
            // Given a policy with an invoice company name
            const policyID = '1';
            const initialCompanyName = 'Initial Corp';
            const fakePolicy = {
                id: policyID,
                invoice: {
                    companyName: initialCompanyName,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When updateInvoiceCompanyName is called and fails
            mockFetch.fail();
            const newCompanyName = 'New Corp';
            Policy.updateInvoiceCompanyName(policyID, newCompanyName, initialCompanyName);
            await waitForBatchedUpdates();

            // Then companyName should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.invoice?.companyName).toBe(initialCompanyName);
            expect(updatedPolicy?.invoice?.pendingFields?.companyName).toBeUndefined();
        });
    });

    describe('updateInvoiceCompanyWebsite', () => {
        it('should update invoice company website optimistically and succeed', async () => {
            // Given a policy with an invoice company website
            const policyID = '1';
            const initialWebsite = 'https://initial.com';
            const fakePolicy = {
                id: policyID,
                invoice: {
                    companyWebsite: initialWebsite,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When updateInvoiceCompanyWebsite is called
            mockFetch.pause();
            const newWebsite = 'https://new.com';
            Policy.updateInvoiceCompanyWebsite(policyID, newWebsite, initialWebsite);
            await waitForBatchedUpdates();

            // Then companyWebsite should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.invoice?.companyWebsite).toBe(newWebsite);
            expect(updatedPolicy?.invoice?.pendingFields?.companyWebsite).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // And the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.invoice?.pendingFields?.companyWebsite).toBeUndefined();
        });

        it('should revert invoice company website when fail', async () => {
            // Given a policy with an invoice company website
            const policyID = '1';
            const initialWebsite = 'https://initial.com';
            const fakePolicy = {
                id: policyID,
                invoice: {
                    companyWebsite: initialWebsite,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When updateInvoiceCompanyWebsite is called and fails
            mockFetch.fail();
            const newWebsite = 'https://new.com';
            Policy.updateInvoiceCompanyWebsite(policyID, newWebsite, initialWebsite);
            await waitForBatchedUpdates();

            // Then companyWebsite should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.invoice?.companyWebsite).toBe(initialWebsite);
            expect(updatedPolicy?.invoice?.pendingFields?.companyWebsite).toBeUndefined();
        });
    });

    describe('setWorkspaceAutoReportingFrequency', () => {
        it('should update auto reporting frequency optimistically and succeed', async () => {
            // Given a workspace with immediate reporting frequency
            const policy = {
                ...createRandomPolicy(0),
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                harvesting: {enabled: true},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            mockFetch.pause();

            // When setting auto reporting frequency to monthly
            Policy.setWorkspaceAutoReportingFrequency(policy.id, CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY, policy.autoReportingFrequency, policy.harvesting);

            // Then optimistic data should be set in Onyx
            await waitForBatchedUpdates();
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY);
            expect(updatedPolicy?.pendingFields?.autoReportingFrequency).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.autoReportingFrequency).toBeUndefined();
        });

        it('should revert auto reporting frequency when fail', async () => {
            // Given a workspace with immediate reporting frequency
            const policy = {
                ...createRandomPolicy(0),
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                harvesting: {enabled: true},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When setting auto reporting frequency to monthly but fail
            mockFetch.fail();
            Policy.setWorkspaceAutoReportingFrequency(policy.id, CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY, policy.autoReportingFrequency, policy.harvesting);
            await waitForBatchedUpdates();

            // Then the frequency should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE);
            expect(updatedPolicy?.pendingFields?.autoReportingFrequency).toBeUndefined();
            expect(updatedPolicy?.errorFields?.autoReportingFrequency).toBeTruthy();
        });
    });

    describe('setWorkspaceAutoReportingMonthlyOffset', () => {
        it('should update auto reporting monthly offset optimistically and succeed', async () => {
            // Given a workspace with offset 1
            const policy = {
                ...createRandomPolicy(0),
                autoReportingOffset: 1,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            mockFetch.pause();

            // When setting auto reporting offset to 2
            Policy.setWorkspaceAutoReportingMonthlyOffset(policy.id, 2, policy.autoReportingOffset);

            // Then optimistic data should be set in Onyx
            await waitForBatchedUpdates();
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoReportingOffset).toBe(2);
            expect(updatedPolicy?.pendingFields?.autoReportingOffset).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.autoReportingOffset).toBeUndefined();
        });

        it('should revert auto reporting monthly offset when fail', async () => {
            // Given a workspace with offset 1
            const policy = {
                ...createRandomPolicy(0),
                autoReportingOffset: 1,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When setting auto reporting offset to 2 but fail
            mockFetch.fail();
            Policy.setWorkspaceAutoReportingMonthlyOffset(policy.id, 2, policy.autoReportingOffset);
            await waitForBatchedUpdates();

            // Then the offset should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoReportingOffset).toBe(1);
            expect(updatedPolicy?.pendingFields?.autoReportingOffset).toBeUndefined();
            expect(updatedPolicy?.errorFields?.autoReportingOffset).toBeTruthy();
        });
    });

    describe('setWorkspacePayer', () => {
        it('should update workspace payer optimistically and succeed', async () => {
            // Given a workspace with a payer
            const policy = {
                ...createRandomPolicy(0),
                reimburser: 'old@test.com',
                achAccount: {reimburser: 'old@test.com'},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            mockFetch.pause();

            // When setting workspace payer to new@test.com
            Policy.setWorkspacePayer(policy.id, 'new@test.com', policy.reimburser);

            // Then optimistic data should be set in Onyx
            await waitForBatchedUpdates();
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.reimburser).toBe('new@test.com');
            expect(updatedPolicy?.achAccount?.reimburser).toBe('new@test.com');
            expect(updatedPolicy?.pendingFields?.reimburser).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.reimburser).toBeUndefined();
        });

        it('should revert workspace payer when fail', async () => {
            // Given a workspace with a payer
            const policy = {
                ...createRandomPolicy(0),
                reimburser: 'old@test.com',
                achAccount: {reimburser: 'old@test.com'},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When setting workspace payer to new@test.com but fail
            mockFetch.fail();
            Policy.setWorkspacePayer(policy.id, 'new@test.com', policy.reimburser);
            await waitForBatchedUpdates();

            // Then the payer should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.achAccount?.reimburser).toBe('old@test.com');
            expect(updatedPolicy?.pendingFields?.reimburser).toBeUndefined();
            expect(updatedPolicy?.errorFields?.reimburser).toBeTruthy();
        });
    });

    describe('setPolicyPreventSelfApproval', () => {
        it('should update prevent self approval optimistically and succeed', async () => {
            // Given a workspace with prevent self approval disabled
            const policy = {
                ...createRandomPolicy(0),
                preventSelfApproval: false,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            mockFetch.pause();

            // When enabling prevent self approval
            Policy.setPolicyPreventSelfApproval(policy.id, true, policy.preventSelfApproval);

            // Then optimistic data should be set in Onyx
            await waitForBatchedUpdates();
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.preventSelfApproval).toBe(true);
            expect(updatedPolicy?.pendingFields?.preventSelfApproval).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.preventSelfApproval).toBeUndefined();
        });

        it('should revert prevent self approval when fail', async () => {
            // Given a workspace with prevent self approval disabled
            const policy = {
                ...createRandomPolicy(0),
                preventSelfApproval: false,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When enabling prevent self approval but fail
            mockFetch.fail();
            Policy.setPolicyPreventSelfApproval(policy.id, true, policy.preventSelfApproval);
            await waitForBatchedUpdates();

            // Then it should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.preventSelfApproval).toBe(false);
            expect(updatedPolicy?.pendingFields?.preventSelfApproval).toBeUndefined();
            expect(updatedPolicy?.errorFields?.preventSelfApproval).toBeTruthy();
        });
    });

    describe('setPolicyAutomaticApprovalLimit', () => {
        it('should update automatic approval limit optimistically and succeed', async () => {
            // Given a workspace with auto approval limit 100
            const policy = {
                ...createRandomPolicy(0),
                autoApproval: {limit: 10000},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            mockFetch.pause();

            // When setting automatic approval limit to 200
            Policy.setPolicyAutomaticApprovalLimit(policy.id, '200', policy.autoApproval.limit);

            // Then optimistic data should be set in Onyx
            await waitForBatchedUpdates();
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoApproval?.limit).toBe(20000);
            expect(updatedPolicy?.autoApproval?.pendingFields?.limit).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoApproval?.pendingFields?.limit).toBeUndefined();
        });

        it('should revert automatic approval limit when fail', async () => {
            // Given a workspace with auto approval limit 100
            const policy = {
                ...createRandomPolicy(0),
                autoApproval: {limit: 10000},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When setting automatic approval limit to 200 but fail
            mockFetch.fail();
            Policy.setPolicyAutomaticApprovalLimit(policy.id, '200', policy.autoApproval.limit);
            await waitForBatchedUpdates();

            // Then it should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoApproval?.limit).toBe(10000);
            expect(updatedPolicy?.autoApproval?.pendingFields?.limit).toBeUndefined();
            expect(updatedPolicy?.errorFields?.autoApproval).toBeTruthy();
        });
    });

    describe('setPolicyAutomaticApprovalRate', () => {
        it('should update automatic approval rate optimistically and succeed', async () => {
            // Given a workspace with auto approval audit rate 0.5
            const policy = {
                ...createRandomPolicy(0),
                autoApproval: {auditRate: 0.5},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            mockFetch.pause();

            // When setting automatic approval rate to 80%
            Policy.setPolicyAutomaticApprovalRate(policy.id, '80', policy.autoApproval.auditRate);

            // Then optimistic data should be set in Onyx
            await waitForBatchedUpdates();
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoApproval?.auditRate).toBe(0.8);
            expect(updatedPolicy?.autoApproval?.pendingFields?.auditRate).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoApproval?.pendingFields?.auditRate).toBeUndefined();
        });

        it('should revert automatic approval rate when fail', async () => {
            // Given a workspace with auto approval audit rate 0.5
            const policy = {
                ...createRandomPolicy(0),
                autoApproval: {auditRate: 0.5},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When setting automatic approval rate to 80% but fail
            mockFetch.fail();
            Policy.setPolicyAutomaticApprovalRate(policy.id, '80', policy.autoApproval.auditRate);
            await waitForBatchedUpdates();

            // Then it should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoApproval?.auditRate).toBe(0.5);
            expect(updatedPolicy?.autoApproval?.pendingFields?.auditRate).toBeUndefined();
            expect(updatedPolicy?.errorFields?.autoApproval).toBeTruthy();
        });
    });

    describe('enableAutoApprovalOptions', () => {
        it('should enable auto approval options optimistically and succeed', async () => {
            // Given a workspace with auto approval options disabled
            const policy = {
                ...createRandomPolicy(0),
                shouldShowAutoApprovalOptions: false,
                autoApproval: {limit: 0, auditRate: 0},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            mockFetch.pause();

            // When enabling auto approval options
            Policy.enableAutoApprovalOptions(policy.id, true, policy.shouldShowAutoApprovalOptions, policy.autoApproval.limit, policy.autoApproval.auditRate);

            // Then optimistic data should be set in Onyx
            await waitForBatchedUpdates();
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.shouldShowAutoApprovalOptions).toBe(true);
            expect(updatedPolicy?.autoApproval?.limit).toBe(CONST.POLICY.AUTO_APPROVE_REPORTS_UNDER_SUGGESTED_CENTS);
            expect(updatedPolicy?.autoApproval?.auditRate).toBe(CONST.POLICY.RANDOM_AUDIT_SUGGESTED_PERCENTAGE);
            expect(updatedPolicy?.pendingFields?.shouldShowAutoApprovalOptions).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.shouldShowAutoApprovalOptions).toBeUndefined();
        });

        it('should revert auto approval options when fail', async () => {
            // Given a workspace with auto approval options disabled
            const policy = {
                ...createRandomPolicy(0),
                shouldShowAutoApprovalOptions: false,
                autoApproval: {limit: 0, auditRate: 0},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When enabling auto approval options but fail
            mockFetch.fail();
            Policy.enableAutoApprovalOptions(policy.id, true, policy.shouldShowAutoApprovalOptions, policy.autoApproval.limit, policy.autoApproval.auditRate);
            await waitForBatchedUpdates();

            // Then it should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.shouldShowAutoApprovalOptions).toBe(false);
            expect(updatedPolicy?.autoApproval?.limit).toBe(0);
            expect(updatedPolicy?.autoApproval?.auditRate).toBe(0);
            expect(updatedPolicy?.pendingFields?.shouldShowAutoApprovalOptions).toBeUndefined();
        });
    });

    describe('setPolicyAutoReimbursementLimit', () => {
        it('should update auto reimbursement limit optimistically and succeed', async () => {
            // Given a workspace with auto reimbursement limit 100
            const policy = {
                ...createRandomPolicy(0),
                autoReimbursement: {limit: 10000},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            mockFetch.pause();

            // When setting auto reimbursement limit to 200
            Policy.setPolicyAutoReimbursementLimit(policy.id, '200', policy.autoReimbursement.limit);

            // Then optimistic data should be set in Onyx
            await waitForBatchedUpdates();
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoReimbursement?.limit).toBe(20000);
            expect(updatedPolicy?.autoReimbursement?.pendingFields?.limit).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoReimbursement?.pendingFields?.limit).toBeUndefined();
        });

        it('should revert auto reimbursement limit when fail', async () => {
            // Given a workspace with auto reimbursement limit 100
            const policy = {
                ...createRandomPolicy(0),
                autoReimbursement: {limit: 10000},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When setting auto reimbursement limit to 200 but fail
            mockFetch.fail();
            Policy.setPolicyAutoReimbursementLimit(policy.id, '200', policy.autoReimbursement.limit);
            await waitForBatchedUpdates();

            // Then it should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.autoReimbursement?.limit).toBe(10000);
            expect(updatedPolicy?.autoReimbursement?.pendingFields?.limit).toBeUndefined();
            expect(updatedPolicy?.errorFields?.autoReimbursement).toBeTruthy();
        });
    });

    describe('enablePolicyAutoReimbursementLimit', () => {
        it('should enable auto reimbursement limit option optimistically and succeed', async () => {
            // Given a workspace with auto reimbursement limit option disabled
            const policy = {
                ...createRandomPolicy(0),
                shouldShowAutoReimbursementLimitOption: false,
                autoReimbursement: {limit: 0},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            mockFetch.pause();

            // When enabling auto reimbursement limit option
            Policy.enablePolicyAutoReimbursementLimit(policy.id, true, policy.shouldShowAutoReimbursementLimitOption, policy.autoReimbursement.limit);

            // Then optimistic data should be set in Onyx
            await waitForBatchedUpdates();
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.shouldShowAutoReimbursementLimitOption).toBe(true);
            expect(updatedPolicy?.autoReimbursement?.limit).toBe(CONST.POLICY.AUTO_REIMBURSEMENT_LIMIT_SUGGESTED_CENTS);
            expect(updatedPolicy?.pendingFields?.shouldShowAutoReimbursementLimitOption).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then pendingFields should be cleared
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.pendingFields?.shouldShowAutoReimbursementLimitOption).toBeUndefined();
        });

        it('should revert auto reimbursement limit option when fail', async () => {
            // Given a workspace with auto reimbursement limit option disabled
            const policy = {
                ...createRandomPolicy(0),
                shouldShowAutoReimbursementLimitOption: false,
                autoReimbursement: {limit: 0},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When enabling auto reimbursement limit option but fail
            mockFetch.fail();
            Policy.enablePolicyAutoReimbursementLimit(policy.id, true, policy.shouldShowAutoReimbursementLimitOption, policy.autoReimbursement.limit);
            await waitForBatchedUpdates();

            // Then it should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);
            expect(updatedPolicy?.shouldShowAutoReimbursementLimitOption).toBe(false);
            expect(updatedPolicy?.autoReimbursement?.limit).toBe(0);
            expect(updatedPolicy?.pendingFields?.shouldShowAutoReimbursementLimitOption).toBeUndefined();
        });
    });

    describe('createPolicyExpenseChats', () => {
        it('should create optimistic expense chat reports for new members with correct participants and currentUserAccountID', async () => {
            const policyID = 'testPolicyID';
            const newMemberEmail = 'newmember@example.com';
            const newMemberAccountID = 42;

            // Given a signed-in user session
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            // When creating policy expense chats for a new member
            const result = Policy.createPolicyExpenseChats(policyID, {[newMemberEmail]: newMemberAccountID});

            // Then optimistic data should be generated
            expect(result.onyxOptimisticData.length).toBeGreaterThan(0);

            // Then a report creation entry should exist for the new member
            const reportCreationEntry = result.reportCreationData[newMemberEmail];
            expect(reportCreationEntry).toBeTruthy();
            expect(reportCreationEntry.reportID).toBeTruthy();
            expect(reportCreationEntry.reportActionID).toBeTruthy();

            // Then the optimistic report should have the correct participants (session user + new member)
            const reportOnyxData = result.onyxOptimisticData.find((data) => data.key === `${ONYXKEYS.COLLECTION.REPORT}${reportCreationEntry.reportID}`);
            expect(reportOnyxData).toBeTruthy();

            const reportValue = reportOnyxData?.value as Report;
            expect(reportValue?.participants).toBeTruthy();
            expect(reportValue?.participants?.[ESH_ACCOUNT_ID]).toBeTruthy();
            expect(reportValue?.participants?.[newMemberAccountID]).toBeTruthy();

            // Then the chat type should be policy expense chat
            expect(reportValue?.chatType).toBe(CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
            expect(reportValue?.policyID).toBe(policyID);

            // Then the owner should be the new member
            expect(reportValue?.ownerAccountID).toBe(newMemberAccountID);

            // Then workspace chat participants should not have roles assigned (roles are only for non-workspace chats)
            expect(reportValue?.participants?.[ESH_ACCOUNT_ID]?.role).toBeUndefined();
            expect(reportValue?.participants?.[newMemberAccountID]?.role).toBeUndefined();

            // Then the new member's notification preference should be overridden to ALWAYS (submitter visibility)
            expect(reportValue?.participants?.[newMemberAccountID]?.notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS);
        });

        it('should reuse existing chat report if one already exists for the member', async () => {
            const policyID = 'testPolicyID';
            const existingMemberEmail = 'existing@example.com';
            const existingMemberAccountID = 99;
            const existingReportID = 'existingReport123';

            // Given a signed-in user session
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});

            // Given an existing policy expense chat for this member
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${existingReportID}`, {
                reportID: existingReportID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID,
                ownerAccountID: existingMemberAccountID,
                participants: {
                    [ESH_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                    [existingMemberAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            });
            await waitForBatchedUpdates();

            // When creating policy expense chats for the existing member
            const result = Policy.createPolicyExpenseChats(policyID, {[existingMemberEmail]: existingMemberAccountID});

            // Then the existing report should be reused (no new reportActionID)
            const reportCreationEntry = result.reportCreationData[existingMemberEmail];
            expect(reportCreationEntry).toBeTruthy();
            expect(reportCreationEntry.reportID).toBe(existingReportID);
            expect(reportCreationEntry.reportActionID).toBeUndefined();
        });
    });
    describe('setPolicyCustomTaxName', () => {
        it('should set custom tax name optimistically and succeed', async () => {
            // Given a policy with a custom tax name
            const policyID = '1';
            const initialTaxName = 'Initial Tax Name';
            const fakePolicy = {
                id: policyID,
                taxRates: {
                    name: initialTaxName,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyCustomTaxName is called with a new name
            mockFetch.pause();
            const newTaxName = 'New Tax Name';
            Policy.setPolicyCustomTaxName(policyID, newTaxName, initialTaxName);
            await waitForBatchedUpdates();

            // Then the tax name should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.taxRates?.name).toBe(newTaxName);
            expect(updatedPolicy?.taxRates?.pendingFields?.name).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.taxRates?.pendingFields?.name).toBeUndefined();
        });

        it('should revert custom tax name when fail', async () => {
            // Given a policy with a custom tax name
            const policyID = '1';
            const initialTaxName = 'Initial Tax Name';
            const fakePolicy = {
                id: policyID,
                taxRates: {
                    name: initialTaxName,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyCustomTaxName is called and fails
            mockFetch.fail();
            const newTaxName = 'New Tax Name';
            Policy.setPolicyCustomTaxName(policyID, newTaxName, initialTaxName);
            await waitForBatchedUpdates();

            // Then the tax name should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.taxRates?.name).toBe(initialTaxName);
            expect(updatedPolicy?.taxRates?.errorFields?.name).toBeDefined();
        });
    });

    describe('setWorkspaceCurrencyDefault', () => {
        it('should set workspace currency default optimistically and succeed', async () => {
            // Given a policy with a default currency tax code
            const policyID = '1';
            const initialTaxCode = 'id_TAX_RATE_1';
            const fakePolicy = {
                id: policyID,
                taxRates: {
                    defaultExternalID: initialTaxCode,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setWorkspaceCurrencyDefault is called with a new tax code
            mockFetch.pause();
            const newTaxCode = 'id_TAX_RATE_2';
            Policy.setWorkspaceCurrencyDefault(policyID, newTaxCode, initialTaxCode);
            await waitForBatchedUpdates();

            // Then the default external ID should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.taxRates?.defaultExternalID).toBe(newTaxCode);
            expect(updatedPolicy?.taxRates?.pendingFields?.defaultExternalID).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.taxRates?.pendingFields?.defaultExternalID).toBeUndefined();
        });

        it('should revert workspace currency default when fail', async () => {
            // Given a policy with a default currency tax code
            const policyID = '1';
            const initialTaxCode = 'id_TAX_RATE_1';
            const fakePolicy = {
                id: policyID,
                taxRates: {
                    defaultExternalID: initialTaxCode,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setWorkspaceCurrencyDefault is called and fails
            mockFetch.fail();
            const newTaxCode = 'id_TAX_RATE_2';
            Policy.setWorkspaceCurrencyDefault(policyID, newTaxCode, initialTaxCode);
            await waitForBatchedUpdates();

            // Then the default external ID should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.taxRates?.defaultExternalID).toBe(initialTaxCode);
            expect(updatedPolicy?.taxRates?.errorFields?.defaultExternalID).toBeDefined();
        });
    });

    describe('setForeignCurrencyDefault', () => {
        it('should set foreign currency default optimistically and succeed', async () => {
            // Given a policy with a foreign currency default tax code
            const policyID = '1';
            const initialTaxCode = 'id_TAX_RATE_1';
            const fakePolicy = {
                id: policyID,
                taxRates: {
                    foreignTaxDefault: initialTaxCode,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setForeignCurrencyDefault is called with a new tax code
            mockFetch.pause();
            const newTaxCode = 'id_TAX_RATE_2';
            Policy.setForeignCurrencyDefault(policyID, newTaxCode, initialTaxCode);
            await waitForBatchedUpdates();

            // Then the foreign tax default should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.taxRates?.foreignTaxDefault).toBe(newTaxCode);
            expect(updatedPolicy?.taxRates?.pendingFields?.foreignTaxDefault).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.taxRates?.pendingFields?.foreignTaxDefault).toBeUndefined();
        });

        it('should revert foreign currency default when fail', async () => {
            // Given a policy with a foreign currency default tax code
            const policyID = '1';
            const initialTaxCode = 'id_TAX_RATE_1';
            const fakePolicy = {
                id: policyID,
                taxRates: {
                    foreignTaxDefault: initialTaxCode,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setForeignCurrencyDefault is called and fails
            mockFetch.fail();
            const newTaxCode = 'id_TAX_RATE_2';
            Policy.setForeignCurrencyDefault(policyID, newTaxCode, initialTaxCode);
            await waitForBatchedUpdates();

            // Then the foreign tax default should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.taxRates?.foreignTaxDefault).toBe(initialTaxCode);
            expect(updatedPolicy?.taxRates?.errorFields?.foreignTaxDefault).toBeDefined();
        });
    });

    describe('setPolicyProhibitedExpense', () => {
        it('should enable prohibited expense optimistically and succeed', async () => {
            // Given a policy with prohibited expenses
            const policyID = '1';
            const currentProhibitedExpenses = {
                alcohol: false,
                meals: false,
            };
            const fakePolicy = {
                id: policyID,
                prohibitedExpenses: currentProhibitedExpenses,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyProhibitedExpense is called to enable alcohol
            mockFetch.pause();
            Policy.setPolicyProhibitedExpense(policyID, 'alcohol', currentProhibitedExpenses);
            await waitForBatchedUpdates();

            // Then the prohibited expense should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.prohibitedExpenses?.alcohol).toBe(true);
            expect(updatedPolicy?.prohibitedExpenses?.pendingFields?.alcohol).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.prohibitedExpenses?.alcohol).toBe(true);
            expect(updatedPolicy?.prohibitedExpenses?.pendingFields?.alcohol).toBeUndefined();
        });

        it('should revert prohibited expense when fail', async () => {
            // Given a policy with prohibited expenses
            const policyID = '1';
            const currentProhibitedExpenses = {
                alcohol: false,
                meals: false,
            };
            const fakePolicy = {
                id: policyID,
                prohibitedExpenses: currentProhibitedExpenses,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyProhibitedExpense is called and fails
            mockFetch.fail();
            Policy.setPolicyProhibitedExpense(policyID, 'alcohol', currentProhibitedExpenses);
            await waitForBatchedUpdates();

            // Then the prohibited expense should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.prohibitedExpenses?.alcohol).toBe(false);
            expect(updatedPolicy?.errorFields?.prohibitedExpenses).toBeDefined();
        });
    });

    describe('setPolicyMaxExpenseAge', () => {
        it('should set max expense age optimistically and succeed', async () => {
            // Given a policy with a max expense age
            const policyID = '1';
            const initialMaxExpenseAge = 30;
            const fakePolicy = {
                id: policyID,
                maxExpenseAge: initialMaxExpenseAge,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyMaxExpenseAge is called with a new age
            mockFetch.pause();
            const newMaxExpenseAge = '60';
            const expectedAge = 60;
            Policy.setPolicyMaxExpenseAge(policyID, newMaxExpenseAge, initialMaxExpenseAge);
            await waitForBatchedUpdates();

            // Then the max expense age should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.maxExpenseAge).toBe(expectedAge);
            expect(updatedPolicy?.pendingFields?.maxExpenseAge).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.pendingFields?.maxExpenseAge).toBeUndefined();
        });

        it('should disable max expense age when empty string is passed', async () => {
            // Given a policy with a max expense age
            const policyID = '1';
            const initialMaxExpenseAge = 30;
            const fakePolicy = {
                id: policyID,
                maxExpenseAge: initialMaxExpenseAge,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyMaxExpenseAge is called with empty string
            mockFetch.pause();
            Policy.setPolicyMaxExpenseAge(policyID, '', initialMaxExpenseAge);
            await waitForBatchedUpdates();

            // Then the max expense age should be set to DISABLED value
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.maxExpenseAge).toBe(CONST.DISABLED_MAX_EXPENSE_VALUE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.pendingFields?.maxExpenseAge).toBeUndefined();
        });

        it('should revert max expense age when fail', async () => {
            // Given a policy with a max expense age
            const policyID = '1';
            const initialMaxExpenseAge = 30;
            const fakePolicy = {
                id: policyID,
                maxExpenseAge: initialMaxExpenseAge,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyMaxExpenseAge is called and fails
            mockFetch.fail();
            const newMaxExpenseAge = '60';
            Policy.setPolicyMaxExpenseAge(policyID, newMaxExpenseAge, initialMaxExpenseAge);
            await waitForBatchedUpdates();

            // Then the max expense age should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.maxExpenseAge).toBe(initialMaxExpenseAge);
            expect(updatedPolicy?.errorFields?.maxExpenseAge).toBeDefined();
        });
    });

    describe('setPolicyBillableMode', () => {
        it('should enable billable mode optimistically and succeed', async () => {
            // Given a policy with billable mode disabled
            const policyID = '1';
            const initialDefaultBillable = false;
            const initialDefaultBillableDisabled = true;
            const fakePolicy = {
                id: policyID,
                defaultBillable: initialDefaultBillable,
                disabledFields: {
                    defaultBillable: initialDefaultBillableDisabled,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyBillableMode is called to enable billable mode
            mockFetch.pause();
            Policy.setPolicyBillableMode(policyID, true, initialDefaultBillable, initialDefaultBillableDisabled);
            await waitForBatchedUpdates();

            // Then the billable mode should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.defaultBillable).toBe(true);
            expect(updatedPolicy?.disabledFields?.defaultBillable).toBe(false);
            expect(updatedPolicy?.pendingFields?.defaultBillable).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.pendingFields?.defaultBillable).toBeUndefined();
        });

        it('should revert billable mode when fail', async () => {
            // Given a policy with billable mode enabled
            const policyID = '1';
            const initialDefaultBillable = true;
            const initialDefaultBillableDisabled = false;
            const fakePolicy = {
                id: policyID,
                defaultBillable: initialDefaultBillable,
                disabledFields: {
                    defaultBillable: initialDefaultBillableDisabled,
                },
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyBillableMode is called and fails
            mockFetch.fail();
            Policy.setPolicyBillableMode(policyID, false, initialDefaultBillable, initialDefaultBillableDisabled);
            await waitForBatchedUpdates();

            // Then the billable mode should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.defaultBillable).toBe(initialDefaultBillable);
            expect(updatedPolicy?.disabledFields?.defaultBillable).toBe(initialDefaultBillableDisabled);
            expect(updatedPolicy?.errorFields?.defaultBillable).toBeDefined();
        });
    });

    describe('setWorkspaceEReceiptsEnabled', () => {
        it('should enable e-receipts optimistically and succeed', async () => {
            // Given a policy with e-receipts disabled
            const policyID = '1';
            const initialEnabled = false;
            const fakePolicy = {
                id: policyID,
                eReceipts: initialEnabled,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setWorkspaceEReceiptsEnabled is called to enable e-receipts
            mockFetch.pause();
            Policy.setWorkspaceEReceiptsEnabled(policyID, true, initialEnabled);
            await waitForBatchedUpdates();

            // Then e-receipts should be enabled optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.eReceipts).toBe(true);
            expect(updatedPolicy?.pendingFields?.eReceipts).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.pendingFields?.eReceipts).toBeFalsy();
        });

        it('should revert e-receipts when fail', async () => {
            // Given a policy with e-receipts enabled
            const policyID = '1';
            const initialEnabled = true;
            const fakePolicy = {
                id: policyID,
                eReceipts: initialEnabled,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setWorkspaceEReceiptsEnabled is called and fails
            mockFetch.fail();
            Policy.setWorkspaceEReceiptsEnabled(policyID, false, initialEnabled);
            await waitForBatchedUpdates();

            // Then e-receipts should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.eReceipts).toBe(initialEnabled);
        });
    });

    describe('setPolicyAttendeeTrackingEnabled', () => {
        it('should enable attendee tracking optimistically and succeed', async () => {
            // Given a policy with attendee tracking disabled
            const policyID = '1';
            const initialIsAttendeeTrackingEnabled = false;
            const fakePolicy = {
                id: policyID,
                isAttendeeTrackingEnabled: initialIsAttendeeTrackingEnabled,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyAttendeeTrackingEnabled is called to enable attendee tracking
            mockFetch.pause();
            Policy.setPolicyAttendeeTrackingEnabled(policyID, true, initialIsAttendeeTrackingEnabled);
            await waitForBatchedUpdates();

            // Then attendee tracking should be enabled optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.isAttendeeTrackingEnabled).toBe(true);
            expect(updatedPolicy?.pendingFields?.isAttendeeTrackingEnabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.pendingFields?.isAttendeeTrackingEnabled).toBeFalsy();
        });

        it('should revert attendee tracking when fail', async () => {
            // Given a policy with attendee tracking enabled
            const policyID = '1';
            const initialIsAttendeeTrackingEnabled = true;
            const fakePolicy = {
                id: policyID,
                isAttendeeTrackingEnabled: initialIsAttendeeTrackingEnabled,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await waitForBatchedUpdates();

            // When setPolicyAttendeeTrackingEnabled is called and fails
            mockFetch.fail();
            Policy.setPolicyAttendeeTrackingEnabled(policyID, false, initialIsAttendeeTrackingEnabled);
            await waitForBatchedUpdates();

            // Then attendee tracking should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.isAttendeeTrackingEnabled).toBe(initialIsAttendeeTrackingEnabled);
            expect(updatedPolicy?.errorFields?.isAttendeeTrackingEnabled).toBeDefined();
        });
    });

    describe('updateMemberCustomField', () => {
        it('should update member custom field optimistically and succeed', async () => {
            // Given a policy with an employee and a custom field value
            const policyID = '1';
            const employeeLogin = 'employee@example.com';
            const customFieldType = 'customField1';
            const initialValue = 'New York';
            const fakePolicy = {
                id: policyID,
                employeeList: {
                    [employeeLogin]: {
                        email: employeeLogin,
                        role: 'user',
                    },
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When updateMemberCustomField is called to update the custom field
            mockFetch.pause();
            const newValue = 'San Francisco';
            Policy.updateMemberCustomField(policyID, employeeLogin, customFieldType, newValue, initialValue);
            await waitForBatchedUpdates();

            // Then the custom field should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.employeeList?.[employeeLogin]?.[CONST.CUSTOM_FIELD_KEYS[customFieldType]]).toBe(newValue);
            expect(updatedPolicy?.employeeList?.[employeeLogin]?.pendingFields?.[CONST.CUSTOM_FIELD_KEYS[customFieldType]]).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.employeeList?.[employeeLogin]?.pendingFields?.[CONST.CUSTOM_FIELD_KEYS[customFieldType]]).toBeUndefined();
        });

        it('should revert member custom field when fail', async () => {
            // Given a policy with an employee and a custom field value
            const policyID = '1';
            const employeeLogin = 'employee@example.com';
            const customFieldType = 'customField1';
            const initialValue = 'New York';
            const fakePolicy = {
                id: policyID,
                employeeList: {
                    [employeeLogin]: {
                        email: employeeLogin,
                        role: 'user',
                        [customFieldType]: initialValue,
                    },
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When updateMemberCustomField is called and fails
            mockFetch.fail();
            const newValue = 'San Francisco';
            Policy.updateMemberCustomField(policyID, employeeLogin, customFieldType, newValue, initialValue);
            await waitForBatchedUpdates();

            // Then the custom field should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.employeeList?.[employeeLogin]?.[CONST.CUSTOM_FIELD_KEYS[customFieldType]]).toBe(initialValue);
        });
    });

    describe('setWorkspaceDefaultSpendCategory', () => {
        it('should set default spend category optimistically and succeed', async () => {
            // Given a policy with a default spend category
            const policyID = '1';
            const groupID = 'group_1';
            const initialCategory = 'Travel';
            const mccGroup = {
                [groupID]: {
                    category: initialCategory,
                    groupID,
                },
            };
            const fakePolicy = {
                id: policyID,
                mccGroup,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When setWorkspaceDefaultSpendCategory is called with a new category
            mockFetch.pause();
            const newCategory = 'Meals';
            Policy.setWorkspaceDefaultSpendCategory(policyID, groupID, newCategory, mccGroup);
            await waitForBatchedUpdates();

            // Then the category should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.mccGroup?.[groupID]?.category).toBe(newCategory);
            expect(updatedPolicy?.mccGroup?.[groupID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then the success data should clear the pending action
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.mccGroup?.[groupID]?.pendingAction).toBeUndefined();
        });

        it('should revert default spend category when fail', async () => {
            // Given a policy with a default spend category
            const policyID = '1';
            const groupID = 'group_1';
            const initialCategory = 'Travel';
            const mccGroup = {
                [groupID]: {
                    category: initialCategory,
                    groupID,
                },
            };
            const fakePolicy = {
                id: policyID,
                mccGroup,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When setWorkspaceDefaultSpendCategory is called and fails
            mockFetch.fail();
            const newCategory = 'Meals';
            Policy.setWorkspaceDefaultSpendCategory(policyID, groupID, newCategory, mccGroup);
            await waitForBatchedUpdates();

            // Then the category should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.mccGroup?.[groupID]?.category).toBe(initialCategory);
            expect(updatedPolicy?.mccGroup?.[groupID]?.pendingAction).toBeUndefined();
        });
    });

    describe('disableWorkspaceBillableExpenses', () => {
        it('should disable billable expenses optimistically and succeed', async () => {
            // Given a policy with billable expenses enabled
            const policyID = '1';
            const initiallyDisabled = false;
            const fakePolicy = {
                id: policyID,
                disabledFields: {
                    defaultBillable: initiallyDisabled,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When disableWorkspaceBillableExpenses is called
            mockFetch.pause();
            Policy.disableWorkspaceBillableExpenses(policyID);
            await waitForBatchedUpdates();

            // Then billable expenses should be disabled optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.disabledFields?.defaultBillable).toBe(true);
            expect(updatedPolicy?.pendingFields?.disabledFields).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.disabledFields?.defaultBillable).toBe(true);
            expect(updatedPolicy?.pendingFields?.disabledFields).toBeUndefined();
        });

        it('should revert billable expenses disable when fail', async () => {
            // Given a policy with billable expenses enabled
            const policyID = '1';
            const initiallyDisabled = false;
            const fakePolicy = {
                id: policyID,
                disabledFields: {
                    defaultBillable: initiallyDisabled,
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When disableWorkspaceBillableExpenses is called and fails
            mockFetch.fail();
            Policy.disableWorkspaceBillableExpenses(policyID);
            await waitForBatchedUpdates();

            // Then the billable expense disable should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.disabledFields?.defaultBillable).toBe(initiallyDisabled);
            expect(updatedPolicy?.pendingFields?.disabledFields).toBeUndefined();
        });
    });

    describe('setPolicyDefaultReportTitle', () => {
        it('should set default report title optimistically and succeed', async () => {
            // Given a policy with a default report title field
            const policyID = '1';
            const initialTitle = 'Expense Report';
            const currentReportTitleField: PolicyReportField = {
                name: 'title',
                defaultValue: initialTitle,
                fieldID: CONST.POLICY.FIELDS.FIELD_LIST_TITLE,
                orderWeight: 0,
                type: CONST.REPORT_FIELD_TYPES.FORMULA,
                deletable: true,
                values: [],
                keys: [],
                externalIDs: [],
                disabledOptions: [],
                isTax: false,
            };
            const fakePolicy = {
                id: policyID,
                fieldList: {
                    [CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {
                        defaultValue: initialTitle,
                    },
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When setPolicyDefaultReportTitle is called with a new title
            mockFetch.pause();
            const newTitle = 'Company Reimbursement';
            Policy.setPolicyDefaultReportTitle(policyID, newTitle, currentReportTitleField);
            await waitForBatchedUpdates();

            // Then the default report title should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.defaultValue).toBe(newTitle);
            expect(updatedPolicy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.pendingFields?.defaultValue).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.pendingFields?.defaultValue).toBeUndefined();
        });

        it('should revert default report title when fail', async () => {
            // Given a policy with a default report title field
            const policyID = '1';
            const initialTitle = 'Expense Report';
            const currentReportTitleField: PolicyReportField = {
                name: 'title',
                defaultValue: initialTitle,
                fieldID: CONST.POLICY.FIELDS.FIELD_LIST_TITLE,
                orderWeight: 0,
                type: CONST.REPORT_FIELD_TYPES.FORMULA,
                deletable: true,
                values: [],
                keys: [],
                externalIDs: [],
                disabledOptions: [],
                isTax: false,
            };
            const fakePolicy = {
                id: policyID,
                fieldList: {
                    [CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {
                        defaultValue: initialTitle,
                    },
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When setPolicyDefaultReportTitle is called and fails
            mockFetch.fail();
            const newTitle = 'Company Reimbursement';
            Policy.setPolicyDefaultReportTitle(policyID, newTitle, currentReportTitleField);
            await waitForBatchedUpdates();

            // Then the default report title should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.defaultValue).toBe(initialTitle);
            expect(updatedPolicy?.errorFields?.fieldList).toBeDefined();
        });
    });

    describe('setPolicyPreventMemberCreatedTitle', () => {
        it('should prevent member created title optimistically and succeed', async () => {
            // Given a policy with member-created titles allowed
            const policyID = '1';
            const initialDeletable = true;
            const currentReportTitleField: PolicyReportField = {
                name: 'title',
                defaultValue: 'Expense Report',
                fieldID: CONST.POLICY.FIELDS.FIELD_LIST_TITLE,
                orderWeight: 0,
                type: CONST.REPORT_FIELD_TYPES.FORMULA,
                deletable: initialDeletable,
                values: [],
                keys: [],
                externalIDs: [],
                disabledOptions: [],
                isTax: false,
            };
            const fakePolicy = {
                id: policyID,
                fieldList: {
                    [CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {
                        deletable: initialDeletable,
                    },
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When setPolicyPreventMemberCreatedTitle is called to enforce naming
            mockFetch.pause();
            Policy.setPolicyPreventMemberCreatedTitle(policyID, true, currentReportTitleField);
            await waitForBatchedUpdates();

            // Then member-created titles should be prevented optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.deletable).toBe(false);
            expect(updatedPolicy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.pendingFields?.deletable).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.pendingFields?.deletable).toBeUndefined();
        });

        it('should revert prevent member created title when fail', async () => {
            // Given a policy with member-created titles prevented
            const policyID = '1';
            const initialDeletable = false;
            const currentReportTitleField: PolicyReportField = {
                name: 'title',
                defaultValue: 'Expense Report',
                fieldID: CONST.POLICY.FIELDS.FIELD_LIST_TITLE,
                orderWeight: 0,
                type: CONST.REPORT_FIELD_TYPES.FORMULA,
                deletable: initialDeletable,
                values: [],
                keys: [],
                externalIDs: [],
                disabledOptions: [],
                isTax: false,
            };
            const fakePolicy = {
                id: policyID,
                fieldList: {
                    [CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {
                        deletable: initialDeletable,
                    },
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When setPolicyPreventMemberCreatedTitle is called and fails
            mockFetch.fail();
            Policy.setPolicyPreventMemberCreatedTitle(policyID, false, currentReportTitleField);
            await waitForBatchedUpdates();

            // Then the deletable flag should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.deletable).toBe(initialDeletable);
            expect(updatedPolicy?.errorFields?.fieldList).toBeDefined();
        });
    });

    describe('updateCustomRules', () => {
        it('should update custom rules optimistically and succeed', async () => {
            // Given a policy with custom rules
            const policyID = '1';
            const initialRules = 'Old rule text';
            const fakePolicy = {
                id: policyID,
                customRules: initialRules,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When updateCustomRules is called with new rules
            mockFetch.pause();
            const newRules = 'New rule text with details';
            Policy.updateCustomRules(policyID, newRules, initialRules);
            await waitForBatchedUpdates();

            // Then custom rules should be updated optimistically
            let updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.customRules).toBe(newRules);
            expect(updatedPolicy?.pendingFields?.customRules).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // When the fetch resumes and succeeds
            await mockFetch.resume();

            // Then the success data should clear the pending fields
            updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.pendingFields?.customRules).toBeUndefined();
        });

        it('should revert custom rules when fail', async () => {
            // Given a policy with custom rules
            const policyID = '1';
            const initialRules = 'Old rule text';
            const fakePolicy = {
                id: policyID,
                customRules: initialRules,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            // When updateCustomRules is called and fails
            mockFetch.fail();
            const newRules = 'New rule text with details';
            Policy.updateCustomRules(policyID, newRules, initialRules);
            await waitForBatchedUpdates();

            // Then custom rules should be reverted
            const updatedPolicy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
            expect(updatedPolicy?.customRules).toBe(initialRules);
            expect(updatedPolicy?.errorFields?.customRules).toBeDefined();
        });
    });

    describe('buildOptimisticDistanceRateCustomUnits', () => {
        it('returns custom units with the provided currency', () => {
            const result = Policy.buildOptimisticDistanceRateCustomUnits('EUR');

            expect(result.outputCurrency).toBe('EUR');
            expect(result.customUnitID).toBeDefined();
            expect(result.customUnitRateID).toBeDefined();

            const unit = result.customUnits[result.customUnitID];
            expect(unit).toBeDefined();
            expect(unit.name).toBe(CONST.CUSTOM_UNITS.NAME_DISTANCE);
            expect(unit.attributes).toEqual({unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES});

            const rate = unit.rates[result.customUnitRateID];
            expect(rate).toBeDefined();
            expect(rate.name).toBe(CONST.CUSTOM_UNITS.DEFAULT_RATE);
            expect(rate.rate).toBe(CONST.CUSTOM_UNITS.MILEAGE_IRS_RATE * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET);
            expect(rate.enabled).toBe(true);
            expect(rate.currency).toBe('EUR');
        });

        it('falls back to USD when no currency is provided and no personal details exist', () => {
            const result = Policy.buildOptimisticDistanceRateCustomUnits();

            expect(result.outputCurrency).toBe(CONST.CURRENCY.USD);
            const rate = result.customUnits[result.customUnitID].rates[result.customUnitRateID];
            expect(rate.currency).toBe(CONST.CURRENCY.USD);
        });

        it('generates unique IDs for customUnitID and customUnitRateID', () => {
            const result1 = Policy.buildOptimisticDistanceRateCustomUnits('USD');
            const result2 = Policy.buildOptimisticDistanceRateCustomUnits('USD');

            expect(result1.customUnitID).not.toBe(result2.customUnitID);
            expect(result1.customUnitRateID).not.toBe(result2.customUnitRateID);
        });

        it('uses empty string currency and falls back properly', () => {
            const result = Policy.buildOptimisticDistanceRateCustomUnits('');

            // Empty string is falsy, so it should fall back
            expect(result.outputCurrency).toBe(CONST.CURRENCY.USD);
        });
    });

    describe('createDraftInitialWorkspace', () => {
        it('creates a draft workspace with correct default values', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}, WORKSPACE_NAME, ESH_ACCOUNT_ID, ESH_EMAIL, policyID, false, 'USD');
            await waitForBatchedUpdates();

            const policyDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(policyDraft).toBeDefined();
            expect(policyDraft?.id).toBe(policyID);
            expect(policyDraft?.name).toBe(WORKSPACE_NAME);
            expect(policyDraft?.type).toBe(CONST.POLICY.TYPE.TEAM);
            expect(policyDraft?.role).toBe(CONST.POLICY.ROLE.ADMIN);
            expect(policyDraft?.outputCurrency).toBe('USD');
            expect(policyDraft?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(policyDraft?.isPolicyExpenseChatEnabled).toBe(true);
            expect(policyDraft?.areCategoriesEnabled).toBe(true);
            expect(policyDraft?.areCompanyCardsEnabled).toBe(true);
            expect(policyDraft?.areExpensifyCardsEnabled).toBe(false);
            expect(policyDraft?.makeMeAdmin).toBe(false);
            expect(policyDraft?.defaultBillable).toBe(false);
            expect(policyDraft?.defaultReimbursable).toBe(true);
            expect(policyDraft?.requiresCategory).toBe(true);
        });

        it('enables workflows by default for MANAGE_TEAM choice', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}, WORKSPACE_NAME, ESH_ACCOUNT_ID, ESH_EMAIL, policyID, false, 'USD');
            await waitForBatchedUpdates();

            const policyDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(policyDraft?.areWorkflowsEnabled).toBe(true);
            expect(policyDraft?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE);
            expect(policyDraft?.harvesting?.enabled).toBe(false);
        });

        it('disables workflows for non-MANAGE_TEAM choices', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND}, WORKSPACE_NAME, ESH_ACCOUNT_ID, ESH_EMAIL, policyID, false, 'USD');
            await waitForBatchedUpdates();

            const policyDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(policyDraft?.areWorkflowsEnabled).toBe(false);
            expect(policyDraft?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
            expect(policyDraft?.harvesting?.enabled).toBe(true);
        });

        it('uses makeMeAdmin when specified', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}, WORKSPACE_NAME, ESH_ACCOUNT_ID, ESH_EMAIL, policyID, true, 'USD');
            await waitForBatchedUpdates();

            const policyDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(policyDraft?.makeMeAdmin).toBe(true);
        });

        it('creates a CORPORATE type workspace when specified', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            Policy.createDraftInitialWorkspace(
                {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                WORKSPACE_NAME,
                ESH_ACCOUNT_ID,
                ESH_EMAIL,
                policyID,
                false,
                'USD',
                undefined,
                CONST.POLICY.TYPE.CORPORATE,
            );
            await waitForBatchedUpdates();

            const policyDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(policyDraft?.type).toBe(CONST.POLICY.TYPE.CORPORATE);
        });

        it('sets custom units with the provided currency', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}, WORKSPACE_NAME, ESH_ACCOUNT_ID, ESH_EMAIL, policyID, false, 'GBP');
            await waitForBatchedUpdates();

            const policyDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(policyDraft?.outputCurrency).toBe('GBP');
            expect(policyDraft?.customUnits).toBeDefined();

            const customUnitKeys = Object.keys(policyDraft?.customUnits ?? {});
            expect(customUnitKeys).toHaveLength(1);

            const unit = policyDraft?.customUnits?.[customUnitKeys.at(0) ?? ''];
            expect(unit?.name).toBe(CONST.CUSTOM_UNITS.NAME_DISTANCE);

            const rateKeys = Object.keys(unit?.rates ?? {});
            expect(rateKeys).toHaveLength(1);

            const rate = unit?.rates?.[rateKeys.at(0) ?? ''];
            expect(rate?.currency).toBe('GBP');
            expect(rate?.enabled).toBe(true);
        });

        it('enables workflows for LOOKING_AROUND choice', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND}, WORKSPACE_NAME, ESH_ACCOUNT_ID, ESH_EMAIL, policyID, false, 'USD');
            await waitForBatchedUpdates();

            const policyDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(policyDraft?.areWorkflowsEnabled).toBe(true);
            expect(policyDraft?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE);
        });

        it('sets avatar URL when file is provided', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            const fakeFile = {uri: 'file://test-avatar.png', name: 'test-avatar.png'} as File;
            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}, WORKSPACE_NAME, ESH_ACCOUNT_ID, ESH_EMAIL, policyID, false, 'USD', fakeFile);
            await waitForBatchedUpdates();

            const policyDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(policyDraft?.avatarURL).toBe('file://test-avatar.png');
            expect(policyDraft?.originalFileName).toBe('test-avatar.png');
        });
    });

    describe('createWorkspaceFromIOUPayment', () => {
        it('should set ownerAccountID from explicit currentUserAccountID parameter', async () => {
            // Set Onyx session to a DIFFERENT accountID to verify the explicit parameter is used
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const customAccountID = 999;
            const customEmail = 'custom@example.com';
            const iouReportOwnerEmail = 'owner@example.com';
            const employeeAccountID = 200;

            const iouReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: '500',
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: employeeAccountID,
                chatReportID: '501',
                policyID: 'oldPolicyID',
                currency: CONST.CURRENCY.USD,
                total: 1000,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
            await waitForBatchedUpdates();

            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const isIOUReportUsingReportSpy = jest.spyOn(ReportUtils, 'isIOUReportUsingReport').mockReturnValue(true);

            // eslint-disable-next-line @typescript-eslint/naming-convention
            const mockTranslate = ((key: string) => key) as unknown as Parameters<typeof Policy.createWorkspaceFromIOUPayment>[8];
            Policy.createWorkspaceFromIOUPayment(iouReport, undefined, customAccountID, customEmail, iouReportOwnerEmail, undefined, CONST.CURRENCY.USD, undefined, mockTranslate, {});
            await waitForBatchedUpdates();

            const writeOptions = apiWriteSpy.mock.calls.at(0)?.at(2) as {
                optimisticData?: Array<{key?: string; value?: Record<string, unknown> | null}>;
            };

            // Find the policy optimistic data entry
            const policyOptimisticUpdate = (writeOptions?.optimisticData ?? []).find(
                (update) => (update.key ?? '').startsWith(ONYXKEYS.COLLECTION.POLICY) && (update.value as {ownerAccountID?: number})?.ownerAccountID !== undefined,
            );

            // Verify ownerAccountID uses the explicit parameter, not the Onyx session
            expect((policyOptimisticUpdate?.value as {ownerAccountID?: number})?.ownerAccountID).toBe(customAccountID);
            expect((policyOptimisticUpdate?.value as {owner?: string})?.owner).toBe(customEmail);

            // Verify that the Onyx session accountID is NOT used
            expect((policyOptimisticUpdate?.value as {ownerAccountID?: number})?.ownerAccountID).not.toBe(ESH_ACCOUNT_ID);

            apiWriteSpy.mockRestore();
            isIOUReportUsingReportSpy.mockRestore();
        });

        it('should return undefined for non-IOU reports', () => {
            const nonIOUReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: '600',
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            // eslint-disable-next-line @typescript-eslint/naming-convention
            const mockTranslate = ((key: string) => key) as unknown as Parameters<typeof Policy.createWorkspaceFromIOUPayment>[8];
            const result = Policy.createWorkspaceFromIOUPayment(
                nonIOUReport,
                undefined,
                ESH_ACCOUNT_ID,
                ESH_EMAIL,
                'owner@example.com',
                undefined,
                CONST.CURRENCY.USD,
                undefined,
                mockTranslate,
                {},
            );
            expect(result).toBeUndefined();
        });

        it('should use reportActionsList parameter instead of deprecated Onyx connection', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const employeeAccountID = 300;
            const iouReportOwnerEmail = 'employee@example.com';

            const existingChatReportID = '700';

            // Create a report preview action for the existing chat
            const reportPreviewAction: ReportAction = {
                reportActionID: 'previewAction1',
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                childReportID: 'childReport1',
                created: '2024-01-01',
                message: [],
            };

            // Pass reportActionsList explicitly - this should be used instead of the deprecated Onyx connection
            const reportActionsList = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingChatReportID}`]: {
                    [reportPreviewAction.reportActionID]: reportPreviewAction,
                },
            };

            const iouReport: Report = {
                ...createRandomReport(1, undefined),
                reportID: '800',
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: employeeAccountID,
                chatReportID: '801',
                policyID: 'oldPolicyID',
                currency: CONST.CURRENCY.USD,
                total: 2000,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
            await waitForBatchedUpdates();

            const isIOUReportUsingReportSpy = jest.spyOn(ReportUtils, 'isIOUReportUsingReport').mockReturnValue(true);
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

            // eslint-disable-next-line @typescript-eslint/naming-convention
            const mockTranslate = ((key: string) => key) as unknown as Parameters<typeof Policy.createWorkspaceFromIOUPayment>[8];
            const result = Policy.createWorkspaceFromIOUPayment(
                iouReport,
                undefined,
                ESH_ACCOUNT_ID,
                ESH_EMAIL,
                iouReportOwnerEmail,
                undefined,
                CONST.CURRENCY.USD,
                undefined,
                mockTranslate,
                reportActionsList,
            );

            // Verify the function returns a valid result (not undefined)
            expect(result).toBeDefined();
            expect(result?.policyID).toBeDefined();
            expect(result?.workspaceChatReportID).toBeDefined();

            apiWriteSpy.mockRestore();
            isIOUReportUsingReportSpy.mockRestore();
        });
    });
});
