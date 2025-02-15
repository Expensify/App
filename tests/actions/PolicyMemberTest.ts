import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Member from '@src/libs/actions/Policy/Member';
import * as Policy from '@src/libs/actions/Policy/Policy';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy as PolicyType, Report, ReportAction, ReportMetadata} from '@src/types/onyx';
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

    describe('addMembersToWorkspace', () => {
        it('Add a new member to a workspace', async () => {
            const policyID = '1';
            const defaultApprover = 'approver@gmail.com';
            const newUserEmail = 'user@gmail.com';

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...createRandomPolicy(Number(policyID)),
                approver: defaultApprover,
            });

            mockFetch?.pause?.();
            Member.addMembersToWorkspace({[newUserEmail]: 1234}, 'Welcome', policyID, [], CONST.POLICY.ROLE.USER);

            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        const newEmployee = policy?.employeeList?.[newUserEmail];
                        expect(newEmployee).not.toBeUndefined();
                        expect(newEmployee?.email).toBe(newUserEmail);
                        expect(newEmployee?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                        expect(newEmployee?.role).toBe(CONST.POLICY.ROLE.USER);
                        expect(newEmployee?.submitsTo).toBe(defaultApprover);
                        resolve();
                    },
                });
            });
            await mockFetch?.resume?.();
        });

        it('Add new members with admin/auditor role to the #admins room', async () => {
            // Given a policy and an #admins room
            const policyID = '1';
            const adminRoomID = '1';
            const defaultApprover = 'approver@gmail.com';
            const ownerAccountID = 1;
            const adminAccountID = 1234;
            const adminEmail = 'admin@example.com';
            const auditorAccountID = 1235;
            const auditorEmail = 'auditor@example.com';
            const userAccountID = 1236;
            const userEmail = 'user@example.com';

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...createRandomPolicy(Number(policyID)),
                approver: defaultApprover,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${adminRoomID}`, {
                ...createRandomReport(Number(adminRoomID)),
                policyID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                participants: {
                    [ownerAccountID]: {notificationPreference: 'always'},
                },
            });

            // When adding a new admin, auditor, and user members
            Member.addMembersToWorkspace({[adminEmail]: adminAccountID}, 'Welcome', policyID, [], CONST.POLICY.ROLE.ADMIN);
            Member.addMembersToWorkspace({[auditorEmail]: auditorAccountID}, 'Welcome', policyID, [], CONST.POLICY.ROLE.AUDITOR);
            Member.addMembersToWorkspace({[userEmail]: userAccountID}, 'Welcome', policyID, [], CONST.POLICY.ROLE.USER);

            await waitForBatchedUpdates();

            // Then only the admin and auditor should be added to the #admins room
            const adminRoom = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${adminRoomID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report);
                    },
                });
            });
            expect(adminRoom?.participants?.[adminAccountID]).toBeTruthy();
            expect(adminRoom?.participants?.[auditorAccountID]).toBeTruthy();
            expect(adminRoom?.participants?.[userAccountID]).toBeUndefined();
        });
    });

    describe('removeMembers', () => {
        it('Remove members with admin/auditor role from the #admins room', async () => {
            // Given a policy and an #admins room
            const policyID = '1';
            const adminRoomID = '1';
            const defaultApprover = 'approver@gmail.com';
            const ownerAccountID = 1;
            const ownerEmail = 'owner@gmail.com';
            const adminAccountID = 1234;
            const adminEmail = 'admin@example.com';
            const auditorAccountID = 1235;
            const auditorEmail = 'auditor@example.com';
            const userAccountID = 1236;
            const userEmail = 'user@example.com';

            await Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                [adminAccountID]: {login: adminEmail},
                [auditorAccountID]: {login: auditorEmail},
                [userAccountID]: {login: userEmail},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...createRandomPolicy(Number(policyID)),
                approver: defaultApprover,
                employeeList: {
                    [ownerEmail]: {role: CONST.POLICY.ROLE.ADMIN},
                    [adminEmail]: {role: CONST.POLICY.ROLE.ADMIN},
                    [auditorEmail]: {role: CONST.POLICY.ROLE.AUDITOR},
                    [userEmail]: {role: CONST.POLICY.ROLE.USER},
                },
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${adminRoomID}`, {
                ...createRandomReport(Number(adminRoomID)),
                policyID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                participants: {
                    [ownerAccountID]: {notificationPreference: 'always'},
                    [adminAccountID]: {notificationPreference: 'always'},
                    [auditorAccountID]: {notificationPreference: 'always'},
                    [userAccountID]: {notificationPreference: 'always'},
                },
            });

            // When removing am admin, auditor, and user members
            mockFetch?.pause?.();
            Member.removeMembers([adminAccountID, auditorAccountID, userAccountID], policyID);

            await waitForBatchedUpdates();

            // Then only the admin and auditor should be removed from the #admins room
            const optimisticAdminRoomMetadata = await new Promise<OnyxEntry<ReportMetadata>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${adminRoomID}`,
                    callback: (reportMetadata) => {
                        Onyx.disconnect(connection);
                        resolve(reportMetadata);
                    },
                });
            });
            expect(optimisticAdminRoomMetadata?.pendingChatMembers?.length).toBe(2);
            expect(optimisticAdminRoomMetadata?.pendingChatMembers?.find((pendingMember) => pendingMember.accountID === String(adminAccountID))?.pendingAction).toBe(
                CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            );
            expect(optimisticAdminRoomMetadata?.pendingChatMembers?.find((pendingMember) => pendingMember.accountID === String(auditorAccountID))?.pendingAction).toBe(
                CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            );
            await mockFetch?.resume?.();

            const successAdminRoomMetadata = await new Promise<OnyxEntry<ReportMetadata>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${adminRoomID}`,
                    callback: (reportMetadata) => {
                        Onyx.disconnect(connection);
                        resolve(reportMetadata);
                    },
                });
            });
            expect(successAdminRoomMetadata?.pendingChatMembers).toBeUndefined();
        });
    });
});
