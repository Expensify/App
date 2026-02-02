import {Str} from 'expensify-common';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {WRITE_COMMANDS} from '@libs/API/types';
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
import type {Onboarding, PolicyJoinMember, Policy as PolicyType, Report, ReportAction, ReportActions, TransactionViolations} from '@src/types/onyx';
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
            // Enable the suggestedFollowups beta so tasks are skipped in favor of backend-generated followups
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.SUGGESTED_FOLLOWUPS]);
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
            const expectedSignOffMessagesCount = 0;
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
    });

    describe('createDraftInitialWorkspace', () => {
        it('creates a policy draft with disabled workflows when onboarding choice does not enable workflows', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();

            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE}, ESH_EMAIL, WORKSPACE_NAME, policyID, false, CONST.CURRENCY.EUR);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(draft?.areWorkflowsEnabled).toBe(false);
            expect(draft?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
            expect(draft?.harvesting?.enabled).toBe(true);
            expect(draft?.outputCurrency).toBe(CONST.CURRENCY.EUR);
        });

        it('uses generated workspace name when policyName is not provided', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            const expectedName = Policy.generateDefaultWorkspaceName(ESH_EMAIL);

            Policy.createDraftInitialWorkspace({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}, ESH_EMAIL, '', policyID, false);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(draft?.name).toBe(expectedName);
        });
    });

    describe('createDraftWorkspace', () => {
        it('sets key defaults and related drafts when onboarding choice enables workflows', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            const params = Policy.createDraftWorkspace({choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM}, ESH_EMAIL, true, WORKSPACE_NAME, policyID, CONST.CURRENCY.USD);
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
            Policy.createDraftWorkspace({choice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE}, ESH_EMAIL, false, WORKSPACE_NAME, policyID, CONST.CURRENCY.EUR);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`);

            expect(draft?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.OPTIONAL);
            expect(draft?.areWorkflowsEnabled).toBe(false);
            expect(draft?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
            expect(draft?.harvesting?.enabled).toBe(true);
            expect(draft?.outputCurrency).toBe(CONST.CURRENCY.EUR);
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
            Policy.upgradeToCorporate(fakePolicy.id);
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
            Policy.upgradeToCorporate(fakePolicy.id);
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
            Policy.upgradeToCorporate(fakePolicy.id);
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

    describe('disableWorkflows', () => {
        it('disableWorkflow should reset autoReportingFrequency to INSTANT', async () => {
            const autoReporting = true;
            const autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY;
            // Given that a policy has autoReporting initially set to true and autoReportingFrequency set to monthly.
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                autoReporting,
                autoReportingFrequency,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            // When workflows are disabled for the policy
            Policy.enablePolicyWorkflows(fakePolicy.id, false);
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

            // Then the policy autoReportingFrequency should revert to "INSTANT"
            expect(policy?.autoReporting).toBe(false);
            expect(policy?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
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
            Policy.enablePolicyRules(fakePolicy.id, false);
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

            Policy.setWorkspaceApprovalMode(policyID, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL);
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

            Policy.setWorkspaceApprovalMode(policyID, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL, {
                reportNextSteps: {
                    [nextStepKey1]: currentNextStep1,
                    [nextStepKey2]: currentNextStep2,
                },
                transactionViolations: {},
                betas: [],
            });
            await waitForBatchedUpdates();

            expect(apiWriteSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_WORKSPACE_APPROVAL_MODE,
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

            Policy.setWorkspaceApprovalMode(policyID, ESH_EMAIL, CONST.POLICY.APPROVAL_MODE.OPTIONAL);
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
                policyID: fakePolicy.id,
                personalPolicyID: undefined,
                activePolicyID: undefined,
                policyName: fakePolicy.name,
                lastAccessedWorkspacePolicyID: undefined,
                policyCardFeeds: undefined,
                reportsToArchive: [fakeReport],
                transactionViolations: undefined,
                reimbursementAccountError: {},
                bankAccountList: {},
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
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
                bankAccountList: {},
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
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
                policyID: randomGroupPolicy.id,
                personalPolicyID: personalPolicy.id,
                activePolicyID: randomGroupPolicy.id,
                policyName: randomGroupPolicy.name,
                lastAccessedWorkspacePolicyID: undefined,
                policyCardFeeds: undefined,
                reportsToArchive: [],
                transactionViolations: undefined,
                reimbursementAccountError: undefined,
                bankAccountList: {},
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
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
                policyID: policyToDelete.id,
                personalPolicyID: undefined,
                activePolicyID: undefined,
                policyName: policyToDelete.name,
                lastAccessedWorkspacePolicyID,
                policyCardFeeds: undefined,
                reportsToArchive: [],
                transactionViolations: undefined,
                reimbursementAccountError: undefined,
                bankAccountList: {},
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
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
                policyID: policyToDelete.id,
                personalPolicyID: undefined,
                activePolicyID: undefined,
                policyName: policyToDelete.name,
                lastAccessedWorkspacePolicyID,
                policyCardFeeds: undefined,
                reportsToArchive: [],
                transactionViolations: undefined,
                reimbursementAccountError: undefined,
                bankAccountList: {},
                lastUsedPaymentMethods: undefined,
                localeCompare: TestHelper.localeCompare,
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

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_NON_PUBLIC_DOMAIN_EMAIL);
            expect(workspaceName).toBe(TestHelper.translateLocal('workspace.new.workspaceName', {userName: displayNameForWorkspace}));
        });

        it('should generate a workspace name based on the display name when the domain is public and display name is available', () => {
            const displayNameForWorkspace = Str.UCFirst(TEST_DISPLAY_NAME);

            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL);
            expect(workspaceName).toBe(TestHelper.translateLocal('workspace.new.workspaceName', {userName: displayNameForWorkspace}));
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

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL_2);
            expect(workspaceName).toBe(TestHelper.translateLocal('workspace.new.workspaceName', {userName: displayNameForWorkspace}));
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

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL);
            expect(workspaceName).toBe(TestHelper.translateLocal('workspace.new.workspaceName', {userName: TEST_DISPLAY_NAME, workspaceNumber: 2}));
        });

        it('should return "My Group Workspace" when the domain is SMS', () => {
            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_SMS_DOMAIN_EMAIL);
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

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL);
            expect(workspaceName).toBe(TestHelper.translateLocal('workspace.new.workspaceName', {userName: TEST_DISPLAY_NAME, workspaceNumber: 2}));
        });
    });

    describe('enablePolicyWorkflows', () => {
        it('should update delayed submission to instant when disabling the workflows feature', async () => {
            (fetch as MockFetch)?.pause?.();
            Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0, CONST.POLICY.TYPE.TEAM),
                areWorkflowsEnabled: true,
                autoReporting: true,
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
            };
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await waitForBatchedUpdates();

            // Disable the workflow feature
            Policy.enablePolicyWorkflows(fakePolicy.id, false);
            await waitForBatchedUpdates();

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                waitForCollectionCallback: false,
                callback: (policy) => {
                    // Check if the autoReportingFrequency is updated to instant
                    expect(policy?.areWorkflowsEnabled).toBeFalsy();
                    expect(policy?.autoReportingFrequency).toBe(CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
                },
            });

            mockFetch?.resume?.();
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
            Policy.setPolicyMaxExpenseAmountNoItemizedReceipt(fakePolicy.id, testAmount);
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
            Policy.setPolicyMaxExpenseAmountNoItemizedReceipt(fakePolicy.id, '');
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
});
