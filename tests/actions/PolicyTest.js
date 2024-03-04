import _ from 'lodash';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import OnyxUpdateManager from '../../src/libs/actions/OnyxUpdateManager';
import * as Policy from '../../src/libs/actions/Policy';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ESH_EMAIL = 'eshgupta1217@gmail.com';
const ESH_ACCOUNT_ID = 1;
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
            fetch.pause();
            Onyx.set(ONYXKEYS.SESSION, {email: ESH_EMAIL, accountID: ESH_ACCOUNT_ID});
            await waitForBatchedUpdates();

            let adminReportID;
            let announceReportID;
            let expenseReportID;
            const policyID = Policy.generatePolicyID();

            Policy.createWorkspace(ESH_EMAIL, true, WORKSPACE_NAME, policyID);
            await waitForBatchedUpdates();

            let policy = await new Promise((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    waitForCollectionCallback: true,
                    callback: (workspace) => {
                        Onyx.disconnect(connectionID);
                        resolve(workspace);
                    },
                });
            });

            // check if policy was created with correct values
            expect(policy.id).toBe(policyID);
            expect(policy.name).toBe(WORKSPACE_NAME);
            expect(policy.type).toBe(CONST.POLICY.TYPE.FREE);
            expect(policy.role).toBe(CONST.POLICY.ROLE.ADMIN);
            expect(policy.owner).toBe(ESH_EMAIL);
            expect(policy.isPolicyExpenseChatEnabled).toBe(true);
            expect(policy.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

            const policyMembers = await new Promise((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`,
                    waitForCollectionCallback: true,
                    callback: (members) => {
                        Onyx.disconnect(connectionID);
                        resolve(members);
                    },
                });
            });

            // check if the user was added as an admin to the policy
            expect(policyMembers[ESH_ACCOUNT_ID].role).toBe(CONST.POLICY.ROLE.ADMIN);

            let allReports = await new Promise((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connectionID);
                        resolve(reports);
                    },
                });
            });

            // Three reports should be created: #announce, #admins and expense report
            const workspaceReports = _.filter(allReports, (report) => report.policyID === policyID);
            expect(_.size(workspaceReports)).toBe(3);
            _.forEach(workspaceReports, (report) => {
                expect(report.pendingFields.addWorkspaceRoom).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                expect(report.participantAccountIDs).toEqual([ESH_ACCOUNT_ID]);
                switch (report.chatType) {
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

            let reportActions = await new Promise((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connectionID);
                        resolve(actions);
                    },
                });
            });

            // Each of the three reports should have a a `CREATED` action.
            let adminReportActions = _.values(reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminReportID}`]);
            let announceReportActions = _.values(reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceReportID}`]);
            let expenseReportActions = _.values(reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`]);
            let workspaceReportActions = _.concat(adminReportActions, announceReportActions, expenseReportActions);
            _.forEach([adminReportActions, announceReportActions, expenseReportActions], (actions) => {
                expect(_.size(actions)).toBe(1);
            });
            _.forEach([...adminReportActions, ...announceReportActions, ...expenseReportActions], (reportAction) => {
                expect(reportAction.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.CREATED);
                expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                expect(reportAction.actorAccountID).toBe(ESH_ACCOUNT_ID);
            });

            // Check for success data
            fetch.resume();
            await waitForBatchedUpdates();

            policy = await new Promise((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.POLICY,
                    waitForCollectionCallback: true,
                    callback: (workspace) => {
                        Onyx.disconnect(connectionID);
                        resolve(workspace);
                    },
                });
            });

            // Check if the policy pending action was cleared
            expect(policy.pendingAction).toBeFalsy();

            allReports = await new Promise((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connectionID);
                        resolve(reports);
                    },
                });
            });

            // Check if the report pending action and fields were cleared
            _.forEach(allReports, (report) => {
                expect(report.pendingAction).toBeFalsy();
                expect(report.pendingFields.addWorkspaceRoom).toBeFalsy();
            });

            reportActions = await new Promise((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connectionID);
                        resolve(actions);
                    },
                });
            });

            // Check if the report action pending action was cleared
            adminReportActions = _.values(reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminReportID}`]);
            announceReportActions = _.values(reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceReportID}`]);
            expenseReportActions = _.values(reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`]);
            workspaceReportActions = _.concat(adminReportActions, announceReportActions, expenseReportActions);
            _.forEach(workspaceReportActions, (reportAction) => {
                expect(reportAction.pendingAction).toBeFalsy();
            });
        });
    });
});
