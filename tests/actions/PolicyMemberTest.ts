import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from '@libs/Localize';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Member from '@src/libs/actions/Policy/Member';
import * as Policy from '@src/libs/actions/Policy/Policy';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImportedSpreadsheet, Policy as PolicyType, Report, ReportAction, ReportMetadata} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
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
            const adminRoom: Report = {...createRandomReport(1), chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, policyID: fakePolicy.id};

            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${adminRoom.reportID}`, adminRoom);
            Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {[fakeUser2.accountID]: fakeUser2});
            await waitForBatchedUpdates();
            // When a user's role is set as admin on a policy
            Member.updateWorkspaceMembersRole(fakePolicy.id, [fakeUser2.accountID], CONST.POLICY.ROLE.ADMIN);
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        const employee = policy?.employeeList?.[fakeUser2?.login ?? ''];
                        // Then the policy employee role of the user should be set to admin.
                        expect(employee?.role).toBe(CONST.POLICY.ROLE.ADMIN);

                        resolve();
                    },
                });
            });
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${adminRoom.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve();
                        // Then the user's notification preference on the admin room should be set to always.
                        expect(report?.participants?.[fakeUser2.accountID].notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS);
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
            await waitForBatchedUpdates();
            // When an admin is demoted from their admin role to a user role
            Member.updateWorkspaceMembersRole(fakePolicy.id, [fakeUser2.accountID], CONST.POLICY.ROLE.USER);
            await waitForBatchedUpdates();
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                    waitForCollectionCallback: false,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        resolve();
                        const employee = policy?.employeeList?.[fakeUser2?.login ?? ''];
                        // Then the policy employee role of the user should be set to user.
                        expect(employee?.role).toBe(CONST.POLICY.ROLE.USER);
                    },
                });
            });
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${adminRoom.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve();
                        // Then the user should be removed from the admin room participants list of the policy.
                        expect(report?.participants?.[fakeUser2.accountID]).toBeUndefined();
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
            Member.addMembersToWorkspace({[newUserEmail]: 1234}, 'Welcome', policyID, [], CONST.POLICY.ROLE.USER, TestHelper.formatPhoneNumber);

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
            Member.addMembersToWorkspace({[adminEmail]: adminAccountID}, 'Welcome', policyID, [], CONST.POLICY.ROLE.ADMIN, TestHelper.formatPhoneNumber);
            Member.addMembersToWorkspace({[auditorEmail]: auditorAccountID}, 'Welcome', policyID, [], CONST.POLICY.ROLE.AUDITOR, TestHelper.formatPhoneNumber);
            Member.addMembersToWorkspace({[userEmail]: userAccountID}, 'Welcome', policyID, [], CONST.POLICY.ROLE.USER, TestHelper.formatPhoneNumber);

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

        it('should unarchive existing workspace expense chat and expense report when adding back a member', async () => {
            // Given an archived workspace expense chat and expense report
            const policyID = '1';
            const workspaceReportID = '1';
            const expenseReportID = '2';
            const userAccountID = 1236;
            const userEmail = 'user@example.com';

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${workspaceReportID}`, {
                ...createRandomReport(Number(workspaceReportID)),
                policyID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                ownerAccountID: userAccountID,
            });
            const expenseAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                childReportID: expenseReportID,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceReportID}`, {
                [expenseAction.reportActionID]: expenseAction,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${workspaceReportID}`, {
                private_isArchived: DateUtils.getDBTime(),
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${expenseReportID}`, {
                private_isArchived: DateUtils.getDBTime(),
            });

            // When adding the user to the workspace
            Member.addMembersToWorkspace({[userEmail]: userAccountID}, 'Welcome', policyID, [], CONST.POLICY.ROLE.USER, TestHelper.formatPhoneNumber);

            await waitForBatchedUpdates();

            // Then the member workspace expense chat and expense report should be unarchive optimistically
            const isWorkspaceChatArchived = await new Promise<boolean>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${workspaceReportID}`,
                    callback: (nvp) => {
                        Onyx.disconnect(connection);
                        resolve(!!nvp?.private_isArchived);
                    },
                });
            });
            const isExpenseReportArchived = await new Promise<boolean>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${expenseReportID}`,
                    callback: (nvp) => {
                        Onyx.disconnect(connection);
                        resolve(!!nvp?.private_isArchived);
                    },
                });
            });
            expect(isWorkspaceChatArchived && isExpenseReportArchived).toBe(false);
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

        it('should archive the member expense chat and expense report', async () => {
            // Given a workspace expense chat and expense report
            const policyID = '1';
            const workspaceReportID = '1';
            const expenseReportID = '2';
            const userAccountID = 1236;

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${workspaceReportID}`, {
                ...createRandomReport(Number(workspaceReportID)),
                policyID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                ownerAccountID: userAccountID,
            });
            const expenseAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                childReportID: expenseReportID,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceReportID}`, {
                [expenseAction.reportActionID]: expenseAction,
            });

            // When removing a member from the workspace
            mockFetch?.pause?.();
            Member.removeMembers([userAccountID], policyID);

            await waitForBatchedUpdates();

            // Then the member workspace expense chat and expense report should be archived optimistically
            const isWorkspaceChatArchived = await new Promise<boolean>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${workspaceReportID}`,
                    callback: (nvp) => {
                        Onyx.disconnect(connection);
                        resolve(!!nvp?.private_isArchived);
                    },
                });
            });
            const isExpenseReportArchived = await new Promise<boolean>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${expenseReportID}`,
                    callback: (nvp) => {
                        Onyx.disconnect(connection);
                        resolve(!!nvp?.private_isArchived);
                    },
                });
            });
            expect(isWorkspaceChatArchived && isExpenseReportArchived).toBe(true);
            await mockFetch?.resume?.();
        });
    });

    describe('importPolicyMembers', () => {
        it('should show a "single member added message" when a new member is added', async () => {
            // Given a workspace
            const policyID = '1';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...createRandomPolicy(Number(policyID)),
            });

            // When importing 1 new member to the workspace
            Member.importPolicyMembers(policyID, [{email: 'user@gmail.com', role: 'user'}]);

            await waitForBatchedUpdates();

            const importedSpreadsheet = await new Promise<OnyxEntry<ImportedSpreadsheet>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.IMPORTED_SPREADSHEET,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            // Then it should show the singular member added success message
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(importedSpreadsheet?.importFinalModal.prompt).toBe(translateLocal('spreadsheet.importMembersSuccessfulDescription', {added: 1, updated: 0}));
        });

        it('should show a "multiple members added message" when multiple new members are added', async () => {
            // Given a workspace
            const policyID = '1';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...createRandomPolicy(Number(policyID)),
            });

            // When importing multiple new members to the workspace
            Member.importPolicyMembers(policyID, [
                {email: 'user@gmail.com', role: 'user'},
                {email: 'user2@gmail.com', role: 'user'},
            ]);

            await waitForBatchedUpdates();

            const importedSpreadsheet = await new Promise<OnyxEntry<ImportedSpreadsheet>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.IMPORTED_SPREADSHEET,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            // Then it should show the plural member added success message
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(importedSpreadsheet?.importFinalModal.prompt).toBe(translateLocal('spreadsheet.importMembersSuccessfulDescription', {added: 2, updated: 0}));
        });

        it('should show a "no members added/updated message" when no new members are added or updated', async () => {
            // Given a workspace
            const policyID = '1';
            const userEmail = 'user@gmail.com';
            const userRole = 'user';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [userEmail]: {
                        role: userRole,
                    },
                },
            });

            // When importing 1 existing member to the workspace with the same role
            Member.importPolicyMembers(policyID, [{email: userEmail, role: userRole}]);

            await waitForBatchedUpdates();

            const importedSpreadsheet = await new Promise<OnyxEntry<ImportedSpreadsheet>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.IMPORTED_SPREADSHEET,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            // Then it should show the no member added/updated message
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(importedSpreadsheet?.importFinalModal.prompt).toBe(translateLocal('spreadsheet.importMembersSuccessfulDescription', {added: 0, updated: 0}));
        });

        it('should show a "single member updated message" when a member is updated', async () => {
            // Given a workspace
            const policyID = '1';
            const userEmail = 'user@gmail.com';
            const userRole = 'user';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [userEmail]: {
                        role: userRole,
                    },
                },
            });

            // When importing 1 existing member with a different role
            Member.importPolicyMembers(policyID, [{email: userEmail, role: 'admin'}]);

            await waitForBatchedUpdates();

            const importedSpreadsheet = await new Promise<OnyxEntry<ImportedSpreadsheet>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.IMPORTED_SPREADSHEET,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            // Then it should show the singular member updated success message
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(importedSpreadsheet?.importFinalModal.prompt).toBe(translateLocal('spreadsheet.importMembersSuccessfulDescription', {added: 0, updated: 1}));
        });

        it('should show a "multiple members updated message" when multiple members are updated', async () => {
            // Given a workspace
            const policyID = '1';
            const userEmail = 'user@gmail.com';
            const userRole = 'user';
            const userEmail2 = 'user2@gmail.com';
            const userRole2 = 'user';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [userEmail]: {
                        role: userRole,
                    },
                    [userEmail2]: {
                        role: userRole2,
                    },
                },
            });

            // When importing multiple existing members with a different role
            Member.importPolicyMembers(policyID, [
                {email: userEmail, role: 'admin'},
                {email: userEmail2, role: 'admin'},
            ]);

            await waitForBatchedUpdates();

            const importedSpreadsheet = await new Promise<OnyxEntry<ImportedSpreadsheet>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.IMPORTED_SPREADSHEET,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            // Then it should show the plural member updated success message
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(importedSpreadsheet?.importFinalModal.prompt).toBe(translateLocal('spreadsheet.importMembersSuccessfulDescription', {added: 0, updated: 2}));
        });

        it('should show a "single member added and updated message" when a member is both added and updated', async () => {
            // Given a workspace
            const policyID = '1';
            const userEmail = 'user@gmail.com';
            const userRole = 'user';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [userEmail]: {
                        role: userRole,
                    },
                },
            });

            // When importing 1 new member and 1 existing member with a different role
            Member.importPolicyMembers(policyID, [
                {email: 'new_user@gmail.com', role: 'user'},
                {email: userEmail, role: 'admin'},
            ]);

            await waitForBatchedUpdates();

            const importedSpreadsheet = await new Promise<OnyxEntry<ImportedSpreadsheet>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.IMPORTED_SPREADSHEET,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            // Then it should show the singular member added and updated success message
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(importedSpreadsheet?.importFinalModal.prompt).toBe(translateLocal('spreadsheet.importMembersSuccessfulDescription', {added: 1, updated: 1}));
        });

        it('should show a "multiple members added and updated message" when multiple members are both added and updated', async () => {
            // Given a workspace
            const policyID = '1';
            const userEmail = 'user@gmail.com';
            const userRole = 'user';
            const userEmail2 = 'user2@gmail.com';
            const userRole2 = 'user';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [userEmail]: {
                        role: userRole,
                    },
                    [userEmail2]: {
                        role: userRole2,
                    },
                },
            });

            // When importing multiple new members and multiple existing members with a different role
            Member.importPolicyMembers(policyID, [
                {email: 'new_user@gmail.com', role: 'user'},
                {email: 'new_user2@gmail.com', role: 'user'},
                {email: userEmail, role: 'admin'},
                {email: userEmail2, role: 'admin'},
            ]);

            await waitForBatchedUpdates();

            const importedSpreadsheet = await new Promise<OnyxEntry<ImportedSpreadsheet>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.IMPORTED_SPREADSHEET,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            // Then it should show the plural member added and updated success message
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(importedSpreadsheet?.importFinalModal.prompt).toBe(translateLocal('spreadsheet.importMembersSuccessfulDescription', {added: 2, updated: 2}));
        });
    });
});
