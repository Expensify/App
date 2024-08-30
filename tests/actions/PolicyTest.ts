import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Policy from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy as PolicyType, Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/Report';
import * as TestHelper from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ESH_EMAIL = 'eshgupta1217@gmail.com';
const ESH_ACCOUNT_ID = 1;
const ESH_PARTICIPANT: Participant = {hidden: false};
const WORKSPACE_NAME = "Esh's Workspace";

OnyxUpdateManager();
describe('actions/Policy', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('createWorkspace', () => {
        it('creates a new workspace', async () => {
            (fetch as MockFetch)?.pause?.();
            Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            let adminReportID;
            let announceReportID;
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

            // Three reports should be created: #announce, #admins and expense report
            const workspaceReports = Object.values(allReports ?? {}).filter((report) => report?.policyID === policyID);
            expect(workspaceReports.length).toBe(3);
            workspaceReports.forEach((report) => {
                expect(report?.pendingFields?.addWorkspaceRoom).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                expect(report?.participants).toEqual({[ESH_ACCOUNT_ID]: ESH_PARTICIPANT});
                switch (report?.chatType) {
                    case CONST.REPORT.CHAT_TYPE.POLICY_ADMINS: {
                        adminReportID = report.reportID;
                        break;
                    }
                    case CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE: {
                        announceReportID = report.reportID;
                        break;
                    }
                    case CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT: {
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
            let announceReportActions: ReportAction[] = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceReportID}`] ?? {});
            let expenseReportActions: ReportAction[] = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`] ?? {});
            let workspaceReportActions: ReportAction[] = adminReportActions.concat(announceReportActions, expenseReportActions);
            [adminReportActions, announceReportActions, expenseReportActions].forEach((actions) => {
                expect(actions.length).toBe(1);
            });
            [...adminReportActions, ...announceReportActions, ...expenseReportActions].forEach((reportAction) => {
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
            announceReportActions = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceReportID}`] ?? {});
            expenseReportActions = Object.values(reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`] ?? {});
            workspaceReportActions = adminReportActions.concat(announceReportActions, expenseReportActions);
            workspaceReportActions.forEach((reportAction) => {
                expect(reportAction.pendingAction).toBeFalsy();
            });
        });
    });
});
