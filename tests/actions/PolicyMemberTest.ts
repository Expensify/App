import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Member from '@src/libs/actions/Policy/Member';
import * as Policy from '@src/libs/actions/Policy/Policy';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImportedSpreadsheet, PolicyEmployeeList, Policy as PolicyType, Report, ReportAction, ReportMetadata} from '@src/types/onyx';
import type {Connections, NetSuiteConnection, NetSuiteConnectionConfig, NetSuiteConnectionData} from '@src/types/onyx/Policy';
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
                ...createRandomReport(0, undefined),
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
            const adminRoom: Report = {...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS), policyID: fakePolicy.id};

            mockFetch?.pause?.();
            Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${adminRoom.reportID}`, adminRoom);
            Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {[fakeUser2.accountID]: fakeUser2});
            await waitForBatchedUpdates();
            // When a user's role is set as admin on a policy
            Member.updateWorkspaceMembersRole(fakePolicy, [fakeUser2.login ?? ''], [fakeUser2.accountID], CONST.POLICY.ROLE.ADMIN);
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
            Member.updateWorkspaceMembersRole(fakePolicy, [fakeUser2.login ?? ''], [fakeUser2.accountID], CONST.POLICY.ROLE.USER);
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
            Member.requestWorkspaceOwnerChange(fakePolicy.id, fakeAccountID, fakeEmail);
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
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                approver: defaultApprover,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

            mockFetch?.pause?.();
            Member.addMembersToWorkspace({[newUserEmail]: 1234}, 'Welcome', policy, [], CONST.POLICY.ROLE.USER, TestHelper.formatPhoneNumber);

            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    waitForCollectionCallback: false,
                    callback: (policyResult) => {
                        Onyx.disconnect(connection);
                        const newEmployee = policyResult?.employeeList?.[newUserEmail];
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
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                approver: defaultApprover,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${adminRoomID}`, {
                ...createRandomReport(Number(adminRoomID), CONST.REPORT.CHAT_TYPE.POLICY_ADMINS),
                policyID,
                participants: {
                    [ownerAccountID]: {notificationPreference: 'always'},
                },
            });
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [auditorAccountID]: {login: auditorEmail},
            });

            // When adding a new admin, auditor, and user members
            mockFetch?.pause?.();
            Member.addMembersToWorkspace({[adminEmail]: adminAccountID}, 'Welcome', policy, [], CONST.POLICY.ROLE.ADMIN, TestHelper.formatPhoneNumber);
            Member.addMembersToWorkspace({[auditorEmail]: auditorAccountID}, 'Welcome', policy, [], CONST.POLICY.ROLE.AUDITOR, TestHelper.formatPhoneNumber);
            Member.addMembersToWorkspace({[userEmail]: userAccountID}, 'Welcome', policy, [], CONST.POLICY.ROLE.USER, TestHelper.formatPhoneNumber);

            await waitForBatchedUpdates();

            // Then only the admin and auditor should be added to the #admins room optimistically
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

            // and removed if the account is optimistic
            await mockFetch?.resume?.();
            const adminRoomSuccess = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${adminRoomID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report);
                    },
                });
            });
            expect(adminRoomSuccess?.participants?.[adminAccountID]).toBeUndefined();
            expect(adminRoomSuccess?.participants?.[auditorAccountID]).toBeTruthy();
        });

        it('should unarchive existing workspace expense chat and expense report when adding back a member', async () => {
            // Given an archived workspace expense chat and expense report
            const policyID = '1';
            const workspaceReportID = '1';
            const expenseReportID = '2';
            const userAccountID = 1236;
            const userEmail = 'user@example.com';
            const policy = createRandomPolicy(Number(policyID));

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${workspaceReportID}`, {
                ...createRandomReport(Number(workspaceReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                policyID,
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
            Member.addMembersToWorkspace({[userEmail]: userAccountID}, 'Welcome', policy, [], CONST.POLICY.ROLE.USER, TestHelper.formatPhoneNumber);

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
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                approver: defaultApprover,
                employeeList: {
                    [ownerEmail]: {role: CONST.POLICY.ROLE.ADMIN},
                    [adminEmail]: {role: CONST.POLICY.ROLE.ADMIN},
                    [auditorEmail]: {role: CONST.POLICY.ROLE.AUDITOR},
                    [userEmail]: {role: CONST.POLICY.ROLE.USER},
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${adminRoomID}`, {
                ...createRandomReport(Number(adminRoomID), CONST.REPORT.CHAT_TYPE.POLICY_ADMINS),
                policyID,
                participants: {
                    [ownerAccountID]: {notificationPreference: 'always'},
                    [adminAccountID]: {notificationPreference: 'always'},
                    [auditorAccountID]: {notificationPreference: 'always'},
                    [userAccountID]: {notificationPreference: 'always'},
                },
            });

            // When removing am admin, auditor, and user members
            mockFetch?.pause?.();
            const memberEmailsToAccountIDs = {
                [adminEmail]: adminAccountID,
                [auditorEmail]: auditorAccountID,
                [userEmail]: userAccountID,
            };
            Member.removeMembers(policy, [adminEmail, auditorEmail, userEmail], memberEmailsToAccountIDs);

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

        it('Change preferred accounting exporter to owner if the members include current preferred exporter', async () => {
            // Given a policy
            const policyID = '1';
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
            const policy: PolicyType = {
                ...createRandomPolicy(Number(policyID)),
                approver: defaultApprover,
                owner: ownerEmail,
                ownerAccountID,
                employeeList: {
                    [ownerEmail]: {role: CONST.POLICY.ROLE.ADMIN},
                    [adminEmail]: {role: CONST.POLICY.ROLE.ADMIN},
                    [auditorEmail]: {role: CONST.POLICY.ROLE.AUDITOR},
                    [userEmail]: {role: CONST.POLICY.ROLE.USER},
                },
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                        verified: true,
                        accountID: '123456',
                        options: {
                            data: {} as NetSuiteConnectionData,
                            config: {
                                exporter: adminEmail,
                            } as NetSuiteConnectionConfig,
                        },
                        lastSync: {
                            errorDate: '',
                            errorMessage: '',
                            isAuthenticationError: false,
                            isConnected: true,
                            isSuccessful: true,
                            source: 'NEWEXPENSIFY',
                            successfulDate: '',
                        },
                    } as NetSuiteConnection,
                } as Connections,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

            // When removing an admin, auditor, and user members
            mockFetch?.pause?.();
            const memberEmailsToAccountIDs = {
                [adminEmail]: adminAccountID,
                [auditorEmail]: auditorAccountID,
                [userEmail]: userAccountID,
            };
            Member.removeMembers(policy, [adminEmail, auditorEmail, userEmail], memberEmailsToAccountIDs);

            await waitForBatchedUpdates();

            const policyConnectionPreferredExporter = await new Promise<string | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (policyResult) => {
                        Onyx.disconnect(connection);
                        resolve(policyResult?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]?.options?.config?.exporter);
                    },
                });
            });

            // Then the preferred exporter is the workspace owner
            expect(policyConnectionPreferredExporter).toBe(ownerEmail);

            await mockFetch?.resume?.();
        });

        it('should archive the member expense chat and expense report', async () => {
            // Given a workspace expense chat and expense report
            const policyID = '1';
            const workspaceReportID = '1';
            const expenseReportID = '2';
            const userAccountID = 1236;
            const userEmail = 'user@example.com';
            const ownerEmail = 'owner@gmail.com';
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [ownerEmail]: {role: CONST.POLICY.ROLE.ADMIN},
                    [userEmail]: {role: CONST.POLICY.ROLE.USER},
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${workspaceReportID}`, {
                ...createRandomReport(Number(workspaceReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                policyID,
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
            Member.removeMembers(policy, [userEmail], {[userEmail]: userAccountID});

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

        it('should preserve pendingAction DELETE when member removal fails', async () => {
            // Given a workspace with a member
            const policyID = '123';
            const userAccountID = 1236;
            const userEmail = 'user@example.com';
            const ownerEmail = 'owner@gmail.com';

            await Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                [userAccountID]: {login: userEmail},
            });
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                owner: ownerEmail,
                employeeList: {
                    [ownerEmail]: {role: CONST.POLICY.ROLE.ADMIN},
                    [userEmail]: {role: CONST.POLICY.ROLE.USER},
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

            // When removing a member and the request fails
            mockFetch?.fail?.();
            Member.removeMembers(policy, [userEmail], {[userEmail]: userAccountID});

            await waitForBatchedUpdates();

            // Then the member should have pendingAction DELETE and errors
            const policyResult = await new Promise<OnyxEntry<PolicyType>>((resolve, reject) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (policyData) => {
                        Onyx.disconnect(connection);
                        if (policyData) {
                            resolve(policyData);
                        } else {
                            reject(new Error('Policy not found'));
                        }
                    },
                });
            });

            const failedMember = policyResult?.employeeList?.[userEmail];
            expect(failedMember?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            expect(failedMember?.errors).toBeTruthy();
            expect(Object.keys(failedMember?.errors ?? {}).length).toBeGreaterThan(0);
        });

        // For more details on what a detached member is, see https://github.com/Expensify/App/issues/75514#issuecomment-3568453686
        it('should remove "detached" members', async () => {
            const policyID = '23456';
            const ownerEmail = 'owner@gmail.com';
            const userEmail = 'user@gmail.com';
            const detachedUserEmail = 'detacheduser@gmail.com';
            const ownerAccountID = 1;
            const userAccountID = 4321;

            await Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                [ownerAccountID]: {login: ownerEmail},
                [userAccountID]: {login: userEmail},
            });

            const policy = {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [ownerEmail]: {role: CONST.POLICY.ROLE.ADMIN},
                    [userEmail]: {role: CONST.POLICY.ROLE.USER},
                    [detachedUserEmail]: {role: CONST.POLICY.ROLE.USER},
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

            Member.removeMembers(policy, [userEmail], {[userEmail]: userAccountID});

            await waitForBatchedUpdates();

            const employeeList = await new Promise<PolicyEmployeeList | undefined>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (policyResult) => {
                        Onyx.disconnect(connection);
                        resolve(policyResult?.employeeList);
                    },
                });
            });

            expect(employeeList?.[userEmail]).toBeUndefined();
            expect(employeeList?.[detachedUserEmail]).toBeUndefined();
            expect(employeeList?.[ownerEmail]).toBeDefined();
        });
    });

    describe('importPolicyMembers', () => {
        it('should show a "single member added message" when a new member is added', async () => {
            // Given a workspace
            const policyID = '1';
            const policy = createRandomPolicy(Number(policyID));

            // When importing 1 new member to the workspace
            Member.importPolicyMembers(policy, [{email: 'user@gmail.com', role: 'user'}]);

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
            expect(importedSpreadsheet?.importFinalModal.promptKey).toBe('spreadsheet.importMembersSuccessfulDescription');
            expect(importedSpreadsheet?.importFinalModal.promptKeyParams).toStrictEqual({added: 1, updated: 0});
        });

        it('should show a "multiple members added message" when multiple new members are added', async () => {
            // Given a workspace
            const policyID = '1';
            const policy = createRandomPolicy(Number(policyID));

            // When importing multiple new members to the workspace
            Member.importPolicyMembers(policy, [
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
            expect(importedSpreadsheet?.importFinalModal.promptKey).toBe('spreadsheet.importMembersSuccessfulDescription');
            expect(importedSpreadsheet?.importFinalModal.promptKeyParams).toStrictEqual({added: 2, updated: 0});
        });

        it('should show a "no members added/updated message" when no new members are added or updated', async () => {
            // Given a workspace
            const policyID = '1';
            const userEmail = 'user@gmail.com';
            const userRole = 'user';
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [userEmail]: {
                        role: userRole,
                    },
                },
            };

            // When importing 1 existing member to the workspace with the same role
            Member.importPolicyMembers(policy, [{email: userEmail, role: userRole}]);

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
            expect(importedSpreadsheet?.importFinalModal.promptKey).toBe('spreadsheet.importMembersSuccessfulDescription');
            expect(importedSpreadsheet?.importFinalModal.promptKeyParams).toStrictEqual({added: 0, updated: 0});
        });

        it('should show a "single member updated message" when a member is updated', async () => {
            // Given a workspace
            const policyID = '1';
            const userEmail = 'user@gmail.com';
            const userRole = 'user';
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [userEmail]: {
                        role: userRole,
                    },
                },
            };

            // When importing 1 existing member with a different role
            Member.importPolicyMembers(policy, [{email: userEmail, role: 'admin'}]);

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
            expect(importedSpreadsheet?.importFinalModal.promptKey).toBe('spreadsheet.importMembersSuccessfulDescription');
            expect(importedSpreadsheet?.importFinalModal.promptKeyParams).toStrictEqual({added: 0, updated: 1});
        });

        it('should show a "multiple members updated message" when multiple members are updated', async () => {
            // Given a workspace
            const policyID = '1';
            const userEmail = 'user@gmail.com';
            const userRole = 'user';
            const userEmail2 = 'user2@gmail.com';
            const userRole2 = 'user';
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [userEmail]: {
                        role: userRole,
                    },
                    [userEmail2]: {
                        role: userRole2,
                    },
                },
            };

            // When importing multiple existing members with a different role
            Member.importPolicyMembers(policy, [
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
            expect(importedSpreadsheet?.importFinalModal.promptKey).toBe('spreadsheet.importMembersSuccessfulDescription');
            expect(importedSpreadsheet?.importFinalModal.promptKeyParams).toStrictEqual({added: 0, updated: 2});
        });

        it('should show a "single member added and updated message" when a member is both added and updated', async () => {
            // Given a workspace
            const policyID = '1';
            const userEmail = 'user@gmail.com';
            const userRole = 'user';
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [userEmail]: {
                        role: userRole,
                    },
                },
            };

            // When importing 1 new member and 1 existing member with a different role
            Member.importPolicyMembers(policy, [
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
            expect(importedSpreadsheet?.importFinalModal.promptKey).toBe('spreadsheet.importMembersSuccessfulDescription');
            expect(importedSpreadsheet?.importFinalModal.promptKeyParams).toStrictEqual({added: 1, updated: 1});
        });

        it('should show a "multiple members added and updated message" when multiple members are both added and updated', async () => {
            // Given a workspace
            const policyID = '1';
            const userEmail = 'user@gmail.com';
            const userRole = 'user';
            const userEmail2 = 'user2@gmail.com';
            const userRole2 = 'user';
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                employeeList: {
                    [userEmail]: {
                        role: userRole,
                    },
                    [userEmail2]: {
                        role: userRole2,
                    },
                },
            };

            // When importing multiple new members and multiple existing members with a different role
            Member.importPolicyMembers(policy, [
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
            expect(importedSpreadsheet?.importFinalModal.promptKey).toBe('spreadsheet.importMembersSuccessfulDescription');
            expect(importedSpreadsheet?.importFinalModal.promptKeyParams).toStrictEqual({added: 2, updated: 2});
        });
    });

    describe('setWorkspaceInviteMembersDraft', () => {
        it('should save member selections to draft storage', async () => {
            // Given a policy ID and member selections
            const policyID = '1';
            const user1Email = 'user1@example.com';
            const user1AccountID = 1234;
            const user2Email = 'user2@example.com';
            const user2AccountID = 1235;
            const invitedEmailsToAccountIDs = {
                [user1Email]: user1AccountID,
                [user2Email]: user2AccountID,
            };

            // When setWorkspaceInviteMembersDraft is called
            Member.setWorkspaceInviteMembersDraft(policyID, invitedEmailsToAccountIDs);
            await waitForBatchedUpdates();

            // Then the draft should be saved to the correct Onyx key
            const draft = await new Promise<typeof invitedEmailsToAccountIDs | null | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value as typeof invitedEmailsToAccountIDs | null | undefined);
                    },
                });
            });

            expect(draft).toBeDefined();
            expect(draft?.[user1Email]).toBe(user1AccountID);
            expect(draft?.[user2Email]).toBe(user2AccountID);
        });

        it('should update existing draft with new selections', async () => {
            // Given an existing draft
            const policyID = '1';
            const user1Email = 'user1@example.com';
            const user1AccountID = 1234;
            const initialDraft = {
                [user1Email]: user1AccountID,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, initialDraft);
            await waitForBatchedUpdates();

            // When new selections are saved
            const user2Email = 'user2@example.com';
            const user2AccountID = 1235;
            const user3Email = 'user3@example.com';
            const user3AccountID = 1236;
            const newSelections = {
                [user2Email]: user2AccountID,
                [user3Email]: user3AccountID,
            };

            Member.setWorkspaceInviteMembersDraft(policyID, newSelections);
            await waitForBatchedUpdates();

            // Then the draft should be updated (not merged)
            const draft = await new Promise<Record<string, number> | null | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value as Record<string, number> | null | undefined);
                    },
                });
            });

            expect(draft).toBeDefined();
            expect(draft?.[user2Email]).toBe(user2AccountID);
            expect(draft?.[user3Email]).toBe(user3AccountID);
            // Old user1 should be replaced (not merged)
            expect(draft?.[user1Email]).toBeUndefined();
        });

        it('should handle empty selections', async () => {
            // Given an existing draft
            const policyID = '1';
            const user1Email = 'user1@example.com';
            const user1AccountID = 1234;
            const initialDraft = {
                [user1Email]: user1AccountID,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, initialDraft);
            await waitForBatchedUpdates();

            // When empty selections are saved
            const emptySelections = {};

            Member.setWorkspaceInviteMembersDraft(policyID, emptySelections);
            await waitForBatchedUpdates();

            // Then the draft should be set to empty object
            const draft = await new Promise<Record<string, number> | null | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value as Record<string, number> | null | undefined);
                    },
                });
            });

            expect(draft).toBeDefined();
            expect(Object.keys(draft ?? {}).length).toBe(0);
        });

        it('should save draft for multiple different workspaces independently', async () => {
            // Given two different workspace IDs
            const policyID1 = '1';
            const policyID2 = '2';
            const user1Email = 'user1@example.com';
            const user1AccountID = 1234;
            const user2Email = 'user2@example.com';
            const user2AccountID = 1235;

            const draft1 = {[user1Email]: user1AccountID};
            const draft2 = {[user2Email]: user2AccountID};

            // When drafts are saved for both workspaces
            Member.setWorkspaceInviteMembersDraft(policyID1, draft1);
            Member.setWorkspaceInviteMembersDraft(policyID2, draft2);
            await waitForBatchedUpdates();

            // Then each workspace should have its own independent draft
            const savedDraft1 = await new Promise<Record<string, number> | null | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID1}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value as Record<string, number> | null | undefined);
                    },
                });
            });

            const savedDraft2 = await new Promise<Record<string, number> | null | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID2}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value as Record<string, number> | null | undefined);
                    },
                });
            });

            expect(savedDraft1?.[user1Email]).toBe(user1AccountID);
            expect(savedDraft1?.[user2Email]).toBeUndefined();

            expect(savedDraft2?.[user2Email]).toBe(user2AccountID);
            expect(savedDraft2?.[user1Email]).toBeUndefined();
        });

        it('should handle large number of selected members', async () => {
            // Given a large selection of members
            const policyID = '1';
            const largeSelection: Record<string, number> = {};

            // Create 100 members
            for (let i = 1; i <= 100; i++) {
                largeSelection[`user${i}@example.com`] = 1000 + i;
            }

            // When the large selection is saved
            Member.setWorkspaceInviteMembersDraft(policyID, largeSelection);
            await waitForBatchedUpdates();

            // Then all members should be saved correctly
            const draft = await new Promise<Record<string, number> | null | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value as Record<string, number> | null | undefined);
                    },
                });
            });

            expect(draft).toBeDefined();
            expect(Object.keys(draft ?? {}).length).toBe(100);
            expect(draft?.['user1@example.com']).toBe(1001);
            expect(draft?.['user50@example.com']).toBe(1050);
            expect(draft?.['user100@example.com']).toBe(1100);
        });

        it('should preserve accountID as number type in draft', async () => {
            // Given member selections with number accountIDs
            const policyID = '1';
            const userEmail = 'user@example.com';
            const userAccountID = 1234;
            const invitedEmailsToAccountIDs = {
                [userEmail]: userAccountID,
            };

            // When the draft is saved
            Member.setWorkspaceInviteMembersDraft(policyID, invitedEmailsToAccountIDs);
            await waitForBatchedUpdates();

            // Then the accountID should remain as a number (not string)
            const draft = await new Promise<Record<string, number> | null | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`,
                    waitForCollectionCallback: false,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value as Record<string, number> | null | undefined);
                    },
                });
            });

            expect(draft).toBeDefined();
            expect(typeof draft?.[userEmail]).toBe('number');
            expect(draft?.[userEmail]).toBe(1234);
            expect(draft?.[userEmail]).not.toBe('1234');
        });
    });
});
