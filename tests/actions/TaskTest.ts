/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useParentReport from '@hooks/useParentReport';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {canActionTask, canModifyTask, completeTask, completeTestDriveTask, createTaskAndNavigate, getFinishOnboardingTaskOnyxData} from '@libs/actions/Task';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as API from '@libs/API';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as ReportUtils from '@libs/ReportUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';
import {getFakeReport, getFakeReportAction} from '../utils/LHNTestUtils';
import {getGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Mock API and Navigation
jest.mock('@libs/API');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/Sound');
jest.mock('@libs/ErrorUtils');
jest.mock('@libs/actions/Welcome');
// Keep OnyxDerived real initialization below
jest.mock('@components/Icon/Expensicons');
jest.mock('@components/LocaleContextProvider');

// ReportUtils spies used in createTaskAndNavigate tests
const mockBuildOptimisticTaskReport = jest.fn();
const mockBuildOptimisticCreatedReportAction = jest.fn();
const mockBuildOptimisticTaskCommentReportAction = jest.fn();
const mockGetTaskAssigneeChatOnyxData = jest.fn();
const mockGetOptimisticDataForParentReportAction = jest.fn();
const mockIsHiddenForCurrentUser = jest.fn();
const mockFormatReportLastMessageText = jest.fn();
jest.spyOn(ReportUtils, 'buildOptimisticTaskReport').mockImplementation(mockBuildOptimisticTaskReport);
jest.spyOn(ReportUtils, 'buildOptimisticCreatedReportAction').mockImplementation(mockBuildOptimisticCreatedReportAction);
jest.spyOn(ReportUtils, 'buildOptimisticTaskCommentReportAction').mockImplementation(mockBuildOptimisticTaskCommentReportAction);
jest.spyOn(ReportUtils, 'getTaskAssigneeChatOnyxData').mockImplementation(mockGetTaskAssigneeChatOnyxData);
jest.spyOn(ReportUtils, 'getOptimisticDataForParentReportAction').mockImplementation(mockGetOptimisticDataForParentReportAction);
jest.spyOn(ReportUtils, 'isHiddenForCurrentUser').mockImplementation(mockIsHiddenForCurrentUser);
jest.spyOn(ReportUtils, 'formatReportLastMessageText').mockImplementation(mockFormatReportLastMessageText);

// Spy on API.write but allow calls to go through
const writeSpy = jest.spyOn(API, 'write');

OnyxUpdateManager();
describe('actions/Task', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
        await waitForBatchedUpdatesWithAct();
    });

    describe('canModify and canAction task', () => {
        const managerAccountID = 1;
        const employeeAccountID = 2;
        const taskAssigneeAccountID = 3;

        // TaskReport with a non-archived parent
        const taskReport = {...getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};
        const taskReportParent = getFakeReport([managerAccountID, employeeAccountID]);

        // Cancelled Task report with a non-archived parent
        const taskReportCancelled = {...getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};
        const taskReportCancelledParent = getFakeReport([managerAccountID, employeeAccountID]);

        // Task report with an archived parent
        const taskReportArchived = {...getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};
        const taskReportArchivedParent = getFakeReport([managerAccountID, employeeAccountID]);

        // This report has no parent
        const taskReportWithNoParent = {...getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};

        // Set the manager as the owner of each report
        taskReport.ownerAccountID = managerAccountID;
        taskReportCancelled.ownerAccountID = managerAccountID;
        taskReportArchived.ownerAccountID = managerAccountID;
        taskReportWithNoParent.ownerAccountID = managerAccountID;

        // Set the parent report ID of each report
        taskReport.parentReportID = taskReportParent.reportID;
        taskReportCancelled.parentReportID = taskReportCancelledParent.reportID;
        taskReportArchived.parentReportID = taskReportArchivedParent.reportID;

        // This is what indicates that the report is a cancelled task report (see ReportUtils.isCanceledTaskReport())
        taskReportCancelled.isDeletedParentAction = true;

        beforeAll(async () => {
            Onyx.init({
                keys: ONYXKEYS,
            });
            initOnyxDerivedValues();

            // Store all the necessary data in Onyx
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportWithNoParent.reportID}`, taskReportWithNoParent);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportParent.reportID}`, taskReportParent);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportCancelled.reportID}`, taskReportCancelled);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportCancelledParent.reportID}`, taskReportCancelledParent);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportArchived.reportID}`, taskReportArchived);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReportArchivedParent.reportID}`, taskReportArchivedParent);

                // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${taskReportArchivedParent.reportID}`, {
                    private_isArchived: new Date().toString(),
                });
            });

            await waitForBatchedUpdatesWithAct();
        });

        describe('canModifyTask', () => {
            it('returns false if the user modifying the task is not the author', () => {
                // Simulate how components call canModifyTask() by using the hook useReportIsArchived() to see if the report is archived
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(taskReport?.parentReportID));
                expect(canModifyTask(taskReport, employeeAccountID, isReportArchived.current)).toBe(false);
            });
            it('returns false if the parent report is archived', () => {
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(taskReportArchived?.parentReportID));
                expect(canModifyTask(taskReportArchived, managerAccountID, isReportArchived.current)).toBe(false);
            });
            it('returns false if the report is a cancelled task report', () => {
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(taskReportCancelled?.parentReportID));
                expect(canModifyTask(taskReportCancelled, managerAccountID, isReportArchived.current)).toBe(false);
            });
            it('returns true if the user modifying the task is the author and the parent report is not archived or cancelled', () => {
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(taskReport?.parentReportID));
                expect(canModifyTask(taskReport, managerAccountID, isReportArchived.current)).toBe(true);
            });
        });

        describe('canActionTask', () => {
            it('returns false if there is no logged in user', () => {
                expect(canActionTask(taskReportCancelled, undefined)).toBe(false);
            });

            it('returns false if parentReport is undefined and taskReport has no parentReportID', () => {
                const task = {
                    ...taskReport,
                    parentReportID: undefined,
                };

                expect(canActionTask(task, undefined, taskAssigneeAccountID, undefined, false)).toBe(false);
            });

            it('returns false if the report is a cancelled task report', () => {
                // The accountID doesn't matter here because the code will do an early return for the cancelled report
                expect(canActionTask(taskReportCancelled, undefined, 0)).toBe(false);
            });

            it('returns false if the report has an archived parent report', () => {
                // The accountID doesn't matter here because the code will do an early return for the archived report
                expect(canActionTask(taskReportArchived, undefined, 0)).toBe(false);
            });

            it('returns false if the user modifying the task is not the author', () => {
                const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                expect(canActionTask(taskReport, undefined, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
            });

            it('returns true if the user modifying the task is the author', () => {
                const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                expect(canActionTask(taskReport, undefined, managerAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
            });

            // Looking up the task assignee is usually based on the report action
            describe('testing with report action', () => {
                beforeAll(async () => {
                    taskReport.parentReportActionID = 'a1';
                    await act(async () => {
                        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);

                        // Given that the task is assigned to a user who is not the author of the task
                        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReport.parentReportID}`, {
                            a1: {
                                ...getFakeReportAction(),
                                reportID: taskReport.parentReportID,
                                childManagerAccountID: taskAssigneeAccountID,
                            },
                        });
                    });

                    await waitForBatchedUpdatesWithAct();
                });

                it('returns false if the logged in user is not the author or the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    const parentReportAction = {
                        ...getFakeReportAction(),
                        reportID: taskReport.parentReportID,
                        childManagerAccountID: taskAssigneeAccountID,
                    };
                    expect(canActionTask(taskReport, parentReportAction, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
                });

                it('returns true if the logged in user is the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    const parentReportAction = {
                        ...getFakeReportAction(),
                        reportID: taskReport.parentReportID,
                        childManagerAccountID: taskAssigneeAccountID,
                    };
                    expect(canActionTask(taskReport, parentReportAction, taskAssigneeAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
                });
            });

            // Some old reports might only have report.managerID so be sure it's still supported
            describe('testing with report.managerID', () => {
                beforeAll(async () => {
                    taskReport.managerID = taskAssigneeAccountID;
                    await act(async () => {
                        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);
                    });
                });

                it('returns false if the logged in user is not the author or the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReport, undefined, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
                });

                it('returns true if the logged in user is the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReport, undefined, taskAssigneeAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
                });
            });
        });
    });

    describe('completeTestDriveTask', () => {
        const accountID = 2;
        const conciergeChatReport: Report = getFakeReport([accountID, CONST.ACCOUNT_ID.CONCIERGE]);
        const testDriveTaskReport: Report = {...getFakeReport(), ownerAccountID: accountID};
        it('Completes test drive task', () => {
            completeTestDriveTask(testDriveTaskReport, conciergeChatReport, false, accountID, false, undefined);
            expect(Object.values(getFinishOnboardingTaskOnyxData(testDriveTaskReport, conciergeChatReport, false, 0, false, undefined)).length).toBe(0);
        });
    });

    describe('getFinishOnboardingTaskOnyxData', () => {
        const parentReport: Report = getFakeReport();
        const taskReport: Report = {...getFakeReport(), type: CONST.REPORT.TYPE.TASK, ownerAccountID: 1, managerID: 2, parentReportID: parentReport.reportID};
        beforeEach(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: 'user1@gmail.com', accountID: 2});
            await waitForBatchedUpdates();
        });
        it('Return not empty object', () => {
            expect(Object.values(getFinishOnboardingTaskOnyxData(taskReport, parentReport, false, 2, false, undefined)).length).toBeGreaterThan(0);
        });
        it('Return empty object', () => {
            expect(Object.values(getFinishOnboardingTaskOnyxData(taskReport, parentReport, true, 2, false, undefined)).length).toBe(0);
        });
    });

    describe('createTaskAndNavigate', () => {
        const mockParentReportID = 'parent_report_123';
        const mockTitle = 'Test Task';
        const mockDescription = 'This is a test task description';
        const mockAssigneeEmail = 'assignee@example.com';
        const mockAssigneeAccountID = 456;
        const mockPolicyID = 'policy_123';
        const mockCurrentUserAccountID = 123;
        const mockCurrentUserEmail = 'creator@example.com';

        beforeEach(async () => {
            jest.clearAllMocks();
            writeSpy.mockClear();

            global.fetch = getGlobalFetchMock();

            // Setup ReportUtils mocks
            mockBuildOptimisticTaskReport.mockReturnValue({
                reportID: 'task_report_123',
                reportName: mockTitle,
                description: mockDescription,
                managerID: mockAssigneeAccountID,
                type: CONST.REPORT.TYPE.TASK,
                parentReportID: mockParentReportID,
            });

            mockBuildOptimisticCreatedReportAction.mockReturnValue({
                reportActionID: 'created_action_123',
                reportAction: {
                    reportActionID: 'created_action_123',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    created: DateUtils.getDBTime(),
                },
            });

            mockBuildOptimisticTaskCommentReportAction.mockReturnValue({
                reportAction: {
                    reportActionID: 'comment_action_123',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    created: DateUtils.getDBTime(),
                    message: [{type: 'text', text: `task for ${mockTitle}`}],
                },
            });

            mockGetTaskAssigneeChatOnyxData.mockReturnValue({
                optimisticData: [],
                successData: [],
                failureData: [],
                optimisticAssigneeAddComment: {
                    reportAction: {
                        reportActionID: 'assignee_comment_123',
                    },
                },
                optimisticChatCreatedReportAction: {
                    reportActionID: 'chat_created_123',
                },
            });

            mockGetOptimisticDataForParentReportAction.mockReturnValue([]);
            mockIsHiddenForCurrentUser.mockReturnValue(false);
            mockFormatReportLastMessageText.mockReturnValue('Last message text');

            await act(async () => {
                await Onyx.clear();
                await Onyx.set(ONYXKEYS.SESSION, {
                    email: mockCurrentUserEmail,
                    accountID: mockCurrentUserAccountID,
                });
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockParentReportID}`, {
                    reportID: mockParentReportID,
                    type: CONST.REPORT.TYPE.CHAT,
                    participants: {
                        [mockCurrentUserAccountID]: {
                            role: CONST.REPORT.ROLE.MEMBER,
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                });
            });
            await waitForBatchedUpdatesWithAct();
        });

        it('should create task and navigate successfully with basic parameters', () => {
            // Given: Basic task creation parameters
            const mockAssigneeChatReport = {
                reportID: 'assignee_chat_123',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [mockAssigneeAccountID]: {
                        accountID: mockAssigneeAccountID,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            // When: Call createTaskAndNavigate
            createTaskAndNavigate({
                parentReport: {reportID: mockParentReportID},
                title: mockTitle,
                description: mockDescription,
                assigneeEmail: mockAssigneeEmail,
                currentUserAccountID: mockCurrentUserAccountID,
                currentUserEmail: mockCurrentUserEmail,
                assigneeAccountID: mockAssigneeAccountID,
                assigneeChatReport: mockAssigneeChatReport,
                policyID: mockPolicyID,
                isCreatedUsingMarkdown: false,
                quickAction: {},
            });
            // Then: Verify API.write called with expected arguments
            const calls = (API.write as jest.Mock).mock.calls;
            expect(calls.length).toBe(1);
            const [command, params, onyx] = calls.at(0);
            expect(command).toBe('CreateTask');
            expect(params).toEqual(
                expect.objectContaining({
                    parentReportID: mockParentReportID,
                    htmlTitle: mockTitle,
                    description: mockDescription,
                    assignee: mockAssigneeEmail,
                    assigneeAccountID: mockAssigneeAccountID,
                    assigneeChatReportID: mockAssigneeChatReport.reportID,
                }),
            );
            expect(onyx).toEqual(
                expect.objectContaining({
                    optimisticData: expect.any(Array),
                    successData: expect.any(Array),
                    failureData: expect.any(Array),
                }),
            );
        });

        it('should handle task creation without assignee chat report', async () => {
            // Given: Task creation without assignee chat report
            const mockQuickAction = {
                action: CONST.QUICK_ACTIONS.ASSIGN_TASK,
                chatReportID: 'quick_action_chat_123',
                targetAccountID: 789,
            };

            // When: Call createTaskAndNavigate without assignee chat report
            createTaskAndNavigate({
                parentReport: {reportID: mockParentReportID},
                title: mockTitle,
                description: mockDescription,
                assigneeEmail: mockAssigneeEmail,
                currentUserAccountID: mockCurrentUserAccountID,
                currentUserEmail: mockCurrentUserEmail,
                assigneeAccountID: mockAssigneeAccountID,
                assigneeChatReport: undefined,
                policyID: mockPolicyID,
                isCreatedUsingMarkdown: false,
                quickAction: mockQuickAction,
            });

            await waitForBatchedUpdatesWithAct();

            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            expect(API.write).toHaveBeenCalledWith(
                'CreateTask',
                expect.objectContaining({
                    parentReportID: mockParentReportID,
                    htmlTitle: mockTitle,
                    description: mockDescription,
                    assignee: mockAssigneeEmail,
                    assigneeAccountID: mockAssigneeAccountID,
                    assigneeChatReportID: undefined,
                    assigneeChatReportActionID: undefined,
                    assigneeChatCreatedReportActionID: undefined,
                }),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
                            value: expect.objectContaining({
                                action: CONST.QUICK_ACTIONS.ASSIGN_TASK,
                                chatReportID: mockParentReportID,
                                isFirstQuickAction: false,
                                targetAccountID: mockAssigneeAccountID,
                            }),
                        }),
                    ]),
                }),
            );
        });

        it('should handle task creation with markdown', async () => {
            // Given: Task creation with markdown flag
            const mockAssigneeChatReport = {
                reportID: 'assignee_chat_456',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [mockAssigneeAccountID]: {
                        accountID: mockAssigneeAccountID,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            // When: Call createTaskAndNavigate with markdown flag
            createTaskAndNavigate({
                parentReport: {reportID: mockParentReportID},
                title: mockTitle,
                description: mockDescription,
                assigneeEmail: mockAssigneeEmail,
                currentUserAccountID: mockCurrentUserAccountID,
                currentUserEmail: mockCurrentUserEmail,
                assigneeAccountID: mockAssigneeAccountID,
                assigneeChatReport: mockAssigneeChatReport,
                policyID: mockPolicyID,
                isCreatedUsingMarkdown: true,
                quickAction: {},
            });

            await waitForBatchedUpdatesWithAct();

            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            expect(API.write).toHaveBeenCalledWith('CreateTask', expect.any(Object), expect.any(Object));

            // Verify that Navigation.dismissModalWithReport was NOT called (since isCreatedUsingMarkdown is true)
            expect(Navigation.dismissModalWithReport).not.toHaveBeenCalled();
        });

        it('should handle task creation with default policy ID', async () => {
            // Given: Task creation with default policy ID
            const mockAssigneeChatReport = {
                reportID: 'assignee_chat_789',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [mockAssigneeAccountID]: {
                        accountID: mockAssigneeAccountID,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            // When: Call createTaskAndNavigate with default policy ID
            createTaskAndNavigate({
                parentReport: {reportID: mockParentReportID},
                title: mockTitle,
                description: mockDescription,
                assigneeEmail: mockAssigneeEmail,
                currentUserAccountID: mockCurrentUserAccountID,
                currentUserEmail: mockCurrentUserEmail,
                assigneeAccountID: mockAssigneeAccountID,
                assigneeChatReport: mockAssigneeChatReport,
                policyID: CONST.POLICY.OWNER_EMAIL_FAKE,
                isCreatedUsingMarkdown: false,
                quickAction: {},
            });

            await waitForBatchedUpdatesWithAct();

            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            expect(API.write).toHaveBeenCalledWith(
                'CreateTask',
                expect.objectContaining({
                    parentReportID: mockParentReportID,
                    htmlTitle: mockTitle,
                    description: mockDescription,
                    assignee: mockAssigneeEmail,
                    assigneeAccountID: mockAssigneeAccountID,
                }),
                expect.any(Object),
            );
        });

        it('should handle task creation with assignee as current user', async () => {
            // Given: Task creation where assignee is the current user
            const mockAssigneeChatReport = {
                reportID: 'assignee_chat_self',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [mockCurrentUserAccountID]: {
                        accountID: mockCurrentUserAccountID,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            // When: Call createTaskAndNavigate with assignee as current user
            createTaskAndNavigate({
                parentReport: {reportID: mockParentReportID},
                title: mockTitle,
                description: mockDescription,
                assigneeEmail: mockCurrentUserEmail,
                currentUserAccountID: mockCurrentUserAccountID,
                currentUserEmail: mockCurrentUserEmail,
                assigneeAccountID: mockCurrentUserAccountID, // assignee is current user
                assigneeChatReport: mockAssigneeChatReport,
                policyID: mockPolicyID,
                isCreatedUsingMarkdown: false,
                quickAction: {},
            });

            await waitForBatchedUpdatesWithAct();

            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const calls = (API.write as jest.Mock).mock.calls;
            expect(calls.length).toBe(1);
            const [command, params, onyx] = calls.at(0);
            expect(command).toBe('CreateTask');
            expect(params).toEqual(
                expect.objectContaining({
                    parentReportID: mockParentReportID,
                    htmlTitle: mockTitle,
                    description: mockDescription,
                    assignee: mockCurrentUserEmail,
                    assigneeAccountID: mockCurrentUserAccountID,
                }),
            );
            expect(onyx.optimisticData).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.REPORT}${mockParentReportID}`,
                        value: expect.objectContaining({hasOutstandingChildTask: true}),
                    }),
                ]),
            );
        });

        it('should return early when parentReportID is undefined', async () => {
            // Given: Undefined parent report ID
            const mockAssigneeChatReport = {
                reportID: 'assignee_chat_undefined',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [mockAssigneeAccountID]: {
                        accountID: mockAssigneeAccountID,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            // When: Call createTaskAndNavigate with undefined parent report ID
            createTaskAndNavigate({
                parentReport: undefined,
                title: mockTitle,
                description: mockDescription,
                assigneeEmail: mockAssigneeEmail,
                currentUserAccountID: mockCurrentUserAccountID,
                currentUserEmail: mockCurrentUserEmail,
                assigneeAccountID: mockAssigneeAccountID,
                assigneeChatReport: mockAssigneeChatReport,
                policyID: mockPolicyID,
                isCreatedUsingMarkdown: false,
                quickAction: {},
            });

            await waitForBatchedUpdatesWithAct();

            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            expect(API.write).not.toHaveBeenCalled();
        });

        it('should handle task creation with first quick action', async () => {
            // Given: Task creation with empty quick action (first quick action)
            const mockAssigneeChatReport = {
                reportID: 'assignee_chat_first',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [mockAssigneeAccountID]: {
                        accountID: mockAssigneeAccountID,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            // When: Call createTaskAndNavigate with empty quick action
            createTaskAndNavigate({
                parentReport: {reportID: mockParentReportID},
                title: mockTitle,
                description: mockDescription,
                assigneeEmail: mockAssigneeEmail,
                currentUserAccountID: mockCurrentUserAccountID,
                currentUserEmail: mockCurrentUserEmail,
                assigneeAccountID: mockAssigneeAccountID,
                assigneeChatReport: mockAssigneeChatReport,
                policyID: mockPolicyID,
                isCreatedUsingMarkdown: false,
                quickAction: {}, // quickAction is empty
            });

            await waitForBatchedUpdatesWithAct();

            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            expect(API.write).toHaveBeenCalledWith(
                'CreateTask',
                expect.any(Object),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
                            value: expect.objectContaining({
                                action: CONST.QUICK_ACTIONS.ASSIGN_TASK,
                                chatReportID: mockParentReportID,
                                isFirstQuickAction: true, // Should be true for empty quick action
                                targetAccountID: mockAssigneeAccountID,
                            }),
                        }),
                    ]),
                }),
            );
        });
    });

    describe('completeTask', () => {
        const mockTaskReportID = 'task_report_456';
        const mockParentReportID = 'parent_report_789';
        const mockParentReportActionID = 'parent_action_123';

        beforeEach(async () => {
            jest.clearAllMocks();
            writeSpy.mockClear();

            global.fetch = getGlobalFetchMock();

            await act(async () => {
                await Onyx.clear();
                await Onyx.set(ONYXKEYS.SESSION, {
                    email: 'user@example.com',
                    accountID: 123,
                });
            });
            await waitForBatchedUpdatesWithAct();
        });

        it('should update childStateNum and childStatusNum to APPROVED when completing a task with parent report action', async () => {
            // Given: A task report with a parent report and parent report action
            const taskReport = {
                reportID: mockTaskReportID,
                type: CONST.REPORT.TYPE.TASK,
                parentReportID: mockParentReportID,
                parentReportActionID: mockParentReportActionID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: 123,
                managerID: 456,
            };

            const parentReport = {
                reportID: mockParentReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };

            const parentReportAction = {
                reportActionID: mockParentReportActionID,
                reportID: mockParentReportID,
                childReportID: mockTaskReportID,
                childType: CONST.REPORT.TYPE.TASK,
                childStateNum: CONST.REPORT.STATE_NUM.OPEN,
                childStatusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as OnyxEntry<ReportAction>;

            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockTaskReportID}`, taskReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockParentReportID}`, parentReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockParentReportID}`, {
                    [mockParentReportActionID]: parentReportAction,
                });
            });

            await waitForBatchedUpdatesWithAct();

            // When: Call completeTask
            completeTask(taskReport, false, false, parentReportAction);

            await waitForBatchedUpdatesWithAct();

            // Then: Verify API.write was called with correct parameters
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            expect(API.write).toHaveBeenCalledWith(
                'CompleteTask',
                expect.objectContaining({
                    taskReportID: mockTaskReportID,
                }),
                expect.objectContaining({
                    optimisticData: expect.any(Array),
                    successData: expect.any(Array),
                    failureData: expect.any(Array),
                }),
            );

            // Verify optimisticData contains childStateNum and childStatusNum updates
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const calls = (API.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>];
            const optimisticData = onyxData.optimisticData ?? [];

            // Find the optimistic update for parent report action
            const parentReportActionUpdate = optimisticData.find((update: {key: string}) => update.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockParentReportID}`);

            expect(parentReportActionUpdate).toBeDefined();
            expect(parentReportActionUpdate?.value).toEqual({
                [mockParentReportActionID]: {
                    childStateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    childStatusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                },
            });

            // Verify failureData contains rollback to OPEN state
            const failureData = onyxData.failureData ?? [];
            const parentReportActionFailure = failureData.find((update: {key: string}) => update.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockParentReportID}`);

            expect(parentReportActionFailure).toBeDefined();
            expect(parentReportActionFailure?.value).toEqual({
                [mockParentReportActionID]: {
                    childStateNum: CONST.REPORT.STATE_NUM.OPEN,
                    childStatusNum: CONST.REPORT.STATUS_NUM.OPEN,
                },
            });
        });

        it('should not update childStateNum and childStatusNum when task has no parent report action', async () => {
            // Given: A task report without a parent report action
            const taskReport = {
                reportID: mockTaskReportID,
                type: CONST.REPORT.TYPE.TASK,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: 123,
                managerID: 456,
            };

            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockTaskReportID}`, taskReport);
            });

            await waitForBatchedUpdatesWithAct();

            // When: Call completeTask
            completeTask(taskReport, false, false, undefined);

            await waitForBatchedUpdatesWithAct();

            // Then: Verify API.write was called
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            expect(API.write).toHaveBeenCalledWith(
                'CompleteTask',
                expect.objectContaining({
                    taskReportID: mockTaskReportID,
                }),
                expect.any(Object),
            );

            // Verify optimisticData does NOT contain parent report action updates
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const calls = (API.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>];
            const optimisticData = onyxData.optimisticData ?? [];

            // Should not have any parent report action updates
            const parentReportActionUpdate = optimisticData.find(
                (update: {key: string}) => update.key?.includes('reportActions_') && update.key !== `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockTaskReportID}`,
            );

            expect(parentReportActionUpdate).toBeUndefined();
        });
    });
});
