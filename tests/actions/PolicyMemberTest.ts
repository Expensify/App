import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Member from '@src/libs/actions/Policy/Member';
import * as Policy from '@src/libs/actions/Policy/Policy';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy as PolicyType, Report, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import * as TestHelper from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/PolicyMember', () => {
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

    describe('acceptJoinRequest', () => {
        it('Accept user join request to a workspace', async () => {
            const fakePolicy = createRandomPolicy(0);
            const fakeReport: Report = {
                ...createRandomReport(0),
                policyID: fakePolicy.id,
            };
            const fakeReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST,
            } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST>;

            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}`, {
                [fakeReportAction.reportActionID]: fakeReportAction,
            });
            Member.acceptJoinRequest(fakeReport.reportID, fakeReportAction);
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportActions) => {
                        Onyx.disconnect(connection);

                        const reportAction = reportActions?.[fakeReportAction.reportActionID] as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST>;

                        if (!isEmptyObject(reportAction)) {
                            expect(ReportActionsUtils.getOriginalMessage(reportAction)?.choice)?.toBe(CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.ACCEPT);
                            expect(reportAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        }
                        resolve();
                    },
                });
            });
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportActions) => {
                        Onyx.disconnect(connection);

                        const reportAction = reportActions?.[fakeReportAction.reportActionID];

                        if (!isEmptyObject(reportAction)) {
                            expect(reportAction?.pendingAction).toBeFalsy();
                        }
                        resolve();
                    },
                });
            });
        });
    });
    describe('updateWorkspaceMembersRole', () => {
        it('Update member to admin role', async () => {
            const fakeUser2 = createPersonalDetails(2);
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0),
                employeeList: {
                    [fakeUser2.login ?? '']: {
                        email: fakeUser2.login,
                        role: CONST.POLICY.ROLE.USER,
                    },
                },
            };

            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {[fakeUser2.accountID]: fakeUser2});
            await waitForBatchedUpdates();
            Member.updateWorkspaceMembersRole(fakePolicy.id, [fakeUser2.accountID], CONST.POLICY.ROLE.ADMIN);
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        const employee = policy?.employeeList?.[fakeUser2?.login ?? ''];
                        expect(employee?.role).toBe(CONST.POLICY.ROLE.ADMIN);

                        resolve();
                    },
                });
            });
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        const employee = policy?.employeeList?.[fakeUser2?.login ?? ''];
                        expect(employee?.pendingAction).toBeFalsy();
                        resolve();
                    },
                });
            });
        });
    });
    describe('requestWorkspaceOwnerChange', () => {
        it('Change the workspace`s owner', async () => {
            const fakePolicy: PolicyType = createRandomPolicy(0);
            const fakeEmail = 'fake@gmail.com';
            const fakeAccountID = 1;

            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.merge(ONYXKEYS.SESSION, {email: fakeEmail, accountID: fakeAccountID});
            Member.requestWorkspaceOwnerChange(fakePolicy.id);
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.errorFields).toBeFalsy();
                        expect(policy?.isLoading).toBeTruthy();
                        expect(policy?.isChangeOwnerSuccessful).toBeFalsy();
                        expect(policy?.isChangeOwnerFailed).toBeFalsy();
                        resolve();
                    },
                });
            });
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.isLoading).toBeFalsy();
                        expect(policy?.isChangeOwnerSuccessful).toBeTruthy();
                        expect(policy?.isChangeOwnerFailed)?.toBeFalsy();
                        resolve();
                    },
                });
            });
        });
    });
    describe('addBillingCardAndRequestPolicyOwnerChange', () => {
        it('Add billing card and change the workspace`s owner', async () => {
            const fakePolicy: PolicyType = createRandomPolicy(0);
            const fakeEmail = 'fake@gmail.com';
            const fakeCard = {
                cardNumber: '1234567890123456',
                cardYear: '2023',
                cardMonth: '05',
                cardCVV: '123',
                addressName: 'John Doe',
                addressZip: '12345',
                currency: 'USD',
            };
            const fakeAccountID = 1;

            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.merge(ONYXKEYS.SESSION, {email: fakeEmail, accountID: fakeAccountID});
            Policy.addBillingCardAndRequestPolicyOwnerChange(fakePolicy.id, fakeCard);
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.errorFields).toBeFalsy();
                        expect(policy?.isLoading).toBeTruthy();
                        expect(policy?.isChangeOwnerSuccessful).toBeFalsy();
                        expect(policy?.isChangeOwnerFailed).toBeFalsy();
                        resolve();
                    },
                });
            });
            await mockFetch?.resume?.();
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expect(policy?.isLoading).toBeFalsy();
                        expect(policy?.isChangeOwnerSuccessful).toBeTruthy();
                        expect(policy?.isChangeOwnerFailed)?.toBeFalsy();
                        resolve();
                    },
                });
            });
        });
    });
});
