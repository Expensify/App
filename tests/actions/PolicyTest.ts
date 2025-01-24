import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Policy from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy as PolicyType, Report, ReportAction, ReportActions} from '@src/types/onyx';
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

            // Two reports should be created: #admins and expense report
            const workspaceReports = Object.values(allReports ?? {}).filter((report) => report?.policyID === policyID);
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
            [adminReportActions, expenseReportActions].forEach((actions) => {
                expect(actions.length).toBe(1);
            });
            [...adminReportActions, ...expenseReportActions].forEach((reportAction) => {
                expect(reportAction.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.CREATED);
                expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                expect(reportAction.actorAccountID).toBe(ESH_ACCOUNT_ID);
            });

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
    });
});
