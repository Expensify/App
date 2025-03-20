import {Str} from 'expensify-common';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {translateLocal} from '@libs/Localize';
import BaseLocaleListener from '@libs/Localize/LocaleListener/BaseLocaleListener';
// eslint-disable-next-line no-restricted-syntax
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Policy from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy as PolicyType, Report, ReportAction, ReportActions, TransactionViolations} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/Report';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReport from '../utils/collections/reports';
import * as TestHelper from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ESH_EMAIL = 'eshgupta1217@gmail.com';
const ESH_ACCOUNT_ID = 1;
const ESH_PARTICIPANT_ADMINS_ROOM: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
const ESH_PARTICIPANT_EXPENSE_CHAT = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
const WORKSPACE_NAME = "Esh's Workspace";

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
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('createWorkspace', () => {
        it('creates a new workspace', async () => {
            (fetch as MockFetch)?.pause?.();
            Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            const fakePolicy = createRandomPolicy(0, CONST.POLICY.TYPE.PERSONAL);
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.NVP_ACTIVE_POLICY_ID}`, fakePolicy.id);
            await waitForBatchedUpdates();

            let adminReportID;
            let expenseReportID;
            const policyID = Policy.generatePolicyID();

            Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID);
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
            expect(policy?.isPolicyExpenseChatEnabled).toBe(true);
            expect(policy?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(policy?.employeeList).toEqual({[ESH_EMAIL]: {errors: {}, role: CONST.POLICY.ROLE.ADMIN}});
            expect(policy?.mccGroup).toBeDefined();

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
            workspaceReports.forEach((report) => {
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
            });

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

            // Each of the three reports should have a a `CREATED` action.
            let adminReportActions: ReportAction[] = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminReportID}`] ?? {});
            let expenseReportActions: ReportAction[] = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`] ?? {});
            let workspaceReportActions: ReportAction[] = adminReportActions.concat(expenseReportActions);
            expect(expenseReportActions.length).toBe(1);
            [...expenseReportActions].forEach((reportAction) => {
                expect(reportAction.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.CREATED);
                expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                expect(reportAction.actorAccountID).toBe(ESH_ACCOUNT_ID);
            });
            // Created Report Action, MANAGE_TEAM tasks (minus tasks that requires integrations to be enabled) and signoff message
            const manageTeamDefaultTaskCount = CONST.ONBOARDING_MESSAGES[CONST.ONBOARDING_CHOICES.MANAGE_TEAM].tasks.length - 2;
            expect(adminReportActions.length).toBe(2 + manageTeamDefaultTaskCount);
            let createdTaskReportActions = 0;
            let signingOffMessage = 0;
            let taskReportActions = 0;
            adminReportActions.forEach((reportAction) => {
                if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
                    createdTaskReportActions++;
                    expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                    expect(reportAction.actorAccountID).toBe(ESH_ACCOUNT_ID);
                    return;
                }
                if (reportAction.childType === CONST.REPORT.TYPE.TASK) {
                    taskReportActions++;
                    expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                    // we dont check actorAccountID as it will be a random account id for the guide
                    return;
                }
                signingOffMessage++;
            });
            expect(createdTaskReportActions).toBe(1);
            expect(signingOffMessage).toBe(1);
            expect(taskReportActions).toBe(manageTeamDefaultTaskCount);

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
            Object.values(allReports ?? {}).forEach((report) => {
                expect(report?.pendingAction).toBeFalsy();
                expect(report?.pendingFields?.addWorkspaceRoom).toBeFalsy();
            });

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
            workspaceReportActions.forEach((reportAction) => {
                expect(reportAction.pendingAction).toBeFalsy();
            });
        });

        it('create a new workspace with enabled workflows if the onboarding choice is newDotManageTeam or newDotLookingAround', async () => {
            Onyx.merge(`${ONYXKEYS.NVP_INTRO_SELECTED}`, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            // When a new workspace is created with introSelected set to MANAGE_TEAM
            Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID);
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

        it('create a new workspace with disabled workflows if the onboarding choice is not newDotManageTeam or newDotLookingAround', async () => {
            Onyx.merge(`${ONYXKEYS.NVP_INTRO_SELECTED}`, {choice: CONST.ONBOARDING_CHOICES.PERSONAL_SPEND});
            await waitForBatchedUpdates();

            const policyID = Policy.generatePolicyID();
            // When a new workspace is created with introSelected set to PERSONAL_SPEND
            Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID);
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
        it('should disable preventSelfApproval when the rule feature is turned off', async () => {
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

            // Check if the preventSelfApproval is reset to false
            expect(policy?.preventSelfApproval).toBeFalsy();
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

    describe('deleteWorkspace', () => {
        it('should apply failure data when deleteWorkspace fails', async () => {
            // Given a policy
            const fakePolicy = createRandomPolicy(0);
            const fakeReport = {
                ...createRandomReport(0),
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyName: fakePolicy.name,
            };
            const fakeReimbursementAccount = {errors: {}};
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, fakeReimbursementAccount);

            // When deleting a workspace fails
            mockFetch?.fail?.();
            Policy.deleteWorkspace(fakePolicy.id, fakePolicy.name);

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

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseChatReportID}`, {
                ...createRandomReport(Number(expenseChatReportID)),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID,
                iouReportID: expenseReportID,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
                reportID: expenseReportID,
                transactionID,
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [
                {name: 'cashExpenseWithNoReceipt', type: CONST.VIOLATION_TYPES.VIOLATION},
                {name: 'hold', type: CONST.VIOLATION_TYPES.WARNING},
            ]);

            Policy.deleteWorkspace(policyID, 'test');

            await waitForBatchedUpdates();

            const violations = await new Promise<OnyxEntry<TransactionViolations>>((resolve) => {
                Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                    callback: resolve,
                });
            });

            expect(violations?.every((violation) => violation.type !== CONST.VIOLATION_TYPES.VIOLATION)).toBe(true);
        });
    });

    const TEST_EMAIL = 'esh@gmail.com';
    const TEST_EMAIL_2 = 'eshofficial@gmail.com';
    const TEST_ACCOUNT_ID = 1;
    const TEST_DISPLAY_NAME = 'Esh Gupta';
    const TEST_PHONE_NUMBER = '1234567890';
    const TEST_NON_PUBLIC_DOMAIN_EMAIL = 'esh@example.com';
    const TEST_SMS_DOMAIN_EMAIL = 'esh@expensify.sms';

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

            expect(workspaceName).toBe(translateLocal('workspace.new.workspaceName', {userName: displayNameForWorkspace}));
        });

        it('should generate a workspace name based on the display name when the domain is public and display name is available', () => {
            const displayNameForWorkspace = Str.UCFirst(TEST_DISPLAY_NAME);

            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_EMAIL);

            expect(workspaceName).toBe(translateLocal('workspace.new.workspaceName', {userName: displayNameForWorkspace}));
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

            expect(workspaceName).toBe(translateLocal('workspace.new.workspaceName', {userName: displayNameForWorkspace}));
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

            expect(workspaceName).toBe(translateLocal('workspace.new.workspaceName', {userName: TEST_DISPLAY_NAME, workspaceNumber: 2}));
        });

        it('should return "My Group Workspace" when the domain is SMS', () => {
            jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockReturnValue({
                displayName: TEST_DISPLAY_NAME,
                phoneNumber: TEST_PHONE_NUMBER,
                accountID: TEST_ACCOUNT_ID,
            });

            const workspaceName = Policy.generateDefaultWorkspaceName(TEST_SMS_DOMAIN_EMAIL);

            expect(workspaceName).toBe(translateLocal('workspace.new.myGroupWorkspace'));
        });

        it('should generate a workspace name with an incremented number even if previous workspaces were created in english lang', async () => {
            await Onyx.set(ONYXKEYS.COLLECTION.POLICY, {});
            jest.spyOn(BaseLocaleListener, 'getPreferredLocale').mockReturnValue('es');
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

            expect(workspaceName).toBe(translateLocal('workspace.new.workspaceName', {userName: TEST_DISPLAY_NAME, workspaceNumber: 2}));
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
        });
    });
});
