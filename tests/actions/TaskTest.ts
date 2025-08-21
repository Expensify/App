/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useParentReport from '@hooks/useParentReport';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {canActionTask, canModifyTask, completeTestDriveTask, createTaskAndNavigate, getFinishOnboardingTaskOnyxData} from '@libs/actions/Task';
import * as API from '@libs/API';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import DateUtils from '@libs/DateUtils';
import {translateLocal} from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock API and Navigation
jest.mock('@libs/API');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/Sound');
jest.mock('@libs/ErrorUtils');
jest.mock('@libs/ReportUtils');
jest.mock('@libs/ReportActionsUtils');
jest.mock('@libs/DateUtils');
jest.mock('@libs/OptionsListUtils');
jest.mock('@libs/PersonalDetailsUtils');
jest.mock('@libs/LocalePhoneNumber');
jest.mock('@libs/actions/Report');
jest.mock('@libs/actions/Welcome');
jest.mock('@userActions/OnyxDerived');
jest.mock('@components/Icon/Expensicons');
jest.mock('@components/LocaleContextProvider');

// Mock API.write function
const mockAPIWrite = jest.fn();
(API.write as jest.Mock) = mockAPIWrite;

OnyxUpdateManager();
describe('actions/Task', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });

    describe('canModify and canAction task', () => {
        const managerAccountID = 1;
        const employeeAccountID = 2;
        const taskAssigneeAccountID = 3;

        // TaskReport with a non-archived parent
        const taskReport = {...LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};
        const taskReportParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);

        // Cancelled Task report with a non-archived parent
        const taskReportCancelled = {...LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};
        const taskReportCancelledParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);

        // Task report with an archived parent
        const taskReportArchived = {...LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};
        const taskReportArchivedParent = LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]);

        // This report has no parent
        const taskReportWithNoParent = {...LHNTestUtils.getFakeReport([managerAccountID, employeeAccountID]), type: CONST.REPORT.TYPE.TASK};

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

            await waitForBatchedUpdates();
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
                expect(canActionTask(taskReportCancelled)).toBe(false);
            });

            it('returns false if parentReport is undefined and taskReport has no parentReportID', () => {
                const task = {
                    ...taskReport,
                    parentReportID: undefined,
                };

                expect(canActionTask(task, taskAssigneeAccountID, undefined, false)).toBe(false);
            });

            it('returns false if the report is a cancelled task report', () => {
                // The accountID doesn't matter here because the code will do an early return for the cancelled report
                expect(canActionTask(taskReportCancelled, 0)).toBe(false);
            });

            it('returns false if the report has an archived parent report', () => {
                // The accountID doesn't matter here because the code will do an early return for the archived report
                expect(canActionTask(taskReportArchived, 0)).toBe(false);
            });

            it('returns false if the user modifying the task is not the author', () => {
                const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                expect(canActionTask(taskReport, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
            });

            it('returns true if the user modifying the task is the author', () => {
                const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                expect(canActionTask(taskReport, managerAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
            });

            // Looking up the task assignee is usually based on the report action
            describe('testing with report action', () => {
                beforeAll(async () => {
                    taskReport.parentReportActionID = 'a1';
                    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);

                    // Given that the task is assigned to a user who is not the author of the task
                    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReport.parentReportID}`, {
                        a1: {
                            ...LHNTestUtils.getFakeReportAction(),
                            reportID: taskReport.parentReportID,
                            childManagerAccountID: taskAssigneeAccountID,
                        },
                    });
                });

                it('returns false if the logged in user is not the author or the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReport, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
                });

                it('returns true if the logged in user is the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReport, taskAssigneeAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
                });
            });

            // Some old reports might only have report.managerID so be sure it's still supported
            describe('testing with report.managerID', () => {
                beforeAll(async () => {
                    taskReport.managerID = taskAssigneeAccountID;
                    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);
                });

                it('returns false if the logged in user is not the author or the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReport, employeeAccountID, parentReport.current, isParentReportArchived.current)).toBe(false);
                });

                it('returns true if the logged in user is the one assigned to the task', () => {
                    const {result: parentReport} = renderHook(() => useParentReport(taskReport.reportID));
                    const {result: isParentReportArchived} = renderHook(() => useReportIsArchived(parentReport.current?.reportID));
                    expect(canActionTask(taskReport, taskAssigneeAccountID, parentReport.current, isParentReportArchived.current)).toBe(true);
                });
            });
        });
    });

    describe('completeTestDriveTask', () => {
        const accountID = 2;
        const conciergeChatReport: Report = LHNTestUtils.getFakeReport([accountID, CONST.ACCOUNT_ID.CONCIERGE]);
        const testDriveTaskReport: Report = {...LHNTestUtils.getFakeReport(), ownerAccountID: accountID};
        const testDriveTaskAction: ReportAction = {
            ...LHNTestUtils.getFakeReportAction(),
            childType: CONST.REPORT.TYPE.TASK,
            childReportName: Parser.replace(translateLocal('onboarding.testDrive.name', {testDriveURL: `${CONST.STAGING_NEW_EXPENSIFY_URL}/${ROUTES.TEST_DRIVE_DEMO_ROOT}`})),
            childReportID: testDriveTaskReport.reportID,
        };

        const reportCollectionDataSet: ReportCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.REPORT}${testDriveTaskReport.reportID}`]: testDriveTaskReport,
            [`${ONYXKEYS.COLLECTION.REPORT}${conciergeChatReport.reportID}`]: conciergeChatReport,
        };

        const reportActionsCollectionDataSet: ReportActionsCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${conciergeChatReport.reportID}`]: {
                [testDriveTaskAction.reportActionID]: testDriveTaskAction,
            },
        };

        beforeEach(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                ...reportCollectionDataSet,
                ...reportActionsCollectionDataSet,
                [ONYXKEYS.NVP_INTRO_SELECTED]: {
                    viewTour: testDriveTaskReport.reportID,
                },
                [ONYXKEYS.SESSION]: {
                    accountID,
                },
            });
            await waitForBatchedUpdates();
        });

        it('Completes test drive task', () => {
            completeTestDriveTask();
            expect(Object.values(getFinishOnboardingTaskOnyxData(CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR)).length).toBe(0);
        });
    });

    describe('getFinishOnboardingTaskOnyxData', () => {
        const parentReport: Report = LHNTestUtils.getFakeReport();
        const taskReport: Report = {...LHNTestUtils.getFakeReport(), type: CONST.REPORT.TYPE.TASK, ownerAccountID: 1, managerID: 2, parentReportID: parentReport.reportID};
        const reportCollectionDataSet: ReportCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`]: taskReport,
            [`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`]: parentReport,
        };
        beforeEach(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                ...reportCollectionDataSet,
            });
            await Onyx.set(ONYXKEYS.SESSION, {email: 'user1@gmail.com', accountID: 2});
            await Onyx.set(`${ONYXKEYS.NVP_INTRO_SELECTED}`, {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM, setupCategories: taskReport.reportID});
            await waitForBatchedUpdates();
        });
        it('Return not empty object', () => {
            expect(Object.values(getFinishOnboardingTaskOnyxData('setupCategories')).length).toBeGreaterThan(0);
        });
        it('Return empty object', async () => {
            const reportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${parentReport.reportID}`, reportNameValuePairs);
            await waitForBatchedUpdates();
            expect(Object.values(getFinishOnboardingTaskOnyxData('setupCategories')).length).toBe(0);
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
            // Clear all mocks before each test
            jest.clearAllMocks();
            
            // Reset the API.write mock
            mockAPIWrite.mockClear();
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {
                    email: mockCurrentUserEmail,
                    accountID: mockCurrentUserAccountID,
                },
                [`${ONYXKEYS.COLLECTION.REPORT}${mockParentReportID}`]: {
                    reportID: mockParentReportID,
                    type: CONST.REPORT.TYPE.CHAT,
                    participants: {
                        [mockCurrentUserAccountID]: {
                            accountID: mockCurrentUserAccountID,
                            role: CONST.REPORT.ROLE.MEMBER,
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                },
            });
            await waitForBatchedUpdates();
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
            createTaskAndNavigate(
                mockParentReportID,
                mockTitle,
                mockDescription,
                mockAssigneeEmail,
                mockAssigneeAccountID,
                mockAssigneeChatReport,
                mockPolicyID,
                false, // isCreatedUsingMarkdown
                {}, // quickAction
            );

            // Then: Verify API.write was called with correct parameters
            expect(API.write).toHaveBeenCalledWith(
                'CreateTask',
                expect.objectContaining({
                    parentReportID: mockParentReportID,
                    htmlTitle: mockTitle,
                    description: mockDescription,
                    assignee: mockAssigneeEmail,
                    assigneeAccountID: mockAssigneeAccountID,
                    assigneeChatReportID: mockAssigneeChatReport.reportID,
                }),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: expect.stringContaining('REPORT'),
                            value: expect.objectContaining({
                                reportName: mockTitle,
                                description: mockDescription,
                                managerID: mockAssigneeAccountID,
                                pendingFields: expect.objectContaining({
                                    createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                                    reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                                    description: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                                    managerID: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                                }),
                            }),
                        }),
                    ]),
                    successData: expect.arrayContaining([
                        expect.objectContaining({
                            key: expect.stringContaining('REPORT'),
                            value: expect.objectContaining({
                                pendingFields: expect.objectContaining({
                                    createChat: null,
                                    reportName: null,
                                    description: null,
                                    managerID: null,
                                }),
                            }),
                        }),
                    ]),
                    failureData: expect.arrayContaining([
                        expect.objectContaining({
                            key: expect.stringContaining('REPORT'),
                            value: null,
                        }),
                    ]),
                }),
            );
        });

        it('should handle task creation without assignee chat report', () => {
            // Given: Task creation without assignee chat report
            const mockQuickAction = {
                action: CONST.QUICK_ACTIONS.ASSIGN_TASK,
                chatReportID: 'quick_action_chat_123',
                targetAccountID: 789,
            };

            // When: Call createTaskAndNavigate without assignee chat report
            createTaskAndNavigate(
                mockParentReportID,
                mockTitle,
                mockDescription,
                mockAssigneeEmail,
                mockAssigneeAccountID,
                undefined, // assigneeChatReport
                mockPolicyID,
                false, // isCreatedUsingMarkdown
                mockQuickAction,
            );

            // Then: Verify API.write was called with correct parameters
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

        it('should handle task creation with markdown', () => {
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
            createTaskAndNavigate(
                mockParentReportID,
                mockTitle,
                mockDescription,
                mockAssigneeEmail,
                mockAssigneeAccountID,
                mockAssigneeChatReport,
                mockPolicyID,
                true, // isCreatedUsingMarkdown
                {}, // quickAction
            );

            // Then: Verify API.write was called
            expect(API.write).toHaveBeenCalledWith('CreateTask', expect.any(Object), expect.any(Object));

            // Verify that Navigation.dismissModalWithReport was NOT called (since isCreatedUsingMarkdown is true)
            expect(Navigation.dismissModalWithReport).not.toHaveBeenCalled();
        });

        it('should handle task creation with default policy ID', () => {
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
            createTaskAndNavigate(
                mockParentReportID,
                mockTitle,
                mockDescription,
                mockAssigneeEmail,
                mockAssigneeAccountID,
                mockAssigneeChatReport,
                CONST.POLICY.OWNER_EMAIL_FAKE, // default policy ID
                false, // isCreatedUsingMarkdown
                {}, // quickAction
            );

            // Then: Verify API.write was called with default policy ID
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

        it('should handle task creation with assignee as current user', () => {
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
            createTaskAndNavigate(
                mockParentReportID,
                mockTitle,
                mockDescription,
                mockCurrentUserEmail,
                mockCurrentUserAccountID, // assignee is current user
                mockAssigneeChatReport,
                mockPolicyID,
                false, // isCreatedUsingMarkdown
                {}, // quickAction
            );

            // Then: Verify API.write was called with correct parameters
            expect(API.write).toHaveBeenCalledWith(
                'CreateTask',
                expect.objectContaining({
                    parentReportID: mockParentReportID,
                    htmlTitle: mockTitle,
                    description: mockDescription,
                    assignee: mockCurrentUserEmail,
                    assigneeAccountID: mockCurrentUserAccountID,
                }),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: expect.stringContaining('REPORT'),
                            value: expect.objectContaining({
                                hasOutstandingChildTask: true, // Should be true when assignee is current user
                            }),
                        }),
                    ]),
                }),
            );
        });

        it('should handle task creation with hidden parent report', async () => {
            // Given: Parent report that is hidden for current user
            const hiddenParentReport = {
                reportID: mockParentReportID,
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [mockCurrentUserAccountID]: {
                        accountID: mockCurrentUserAccountID,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE, // Hidden
                    },
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockParentReportID}`, hiddenParentReport);
            await waitForBatchedUpdates();

            const mockAssigneeChatReport = {
                reportID: 'assignee_chat_hidden',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [mockAssigneeAccountID]: {
                        accountID: mockAssigneeAccountID,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            // When: Call createTaskAndNavigate with hidden parent report
            createTaskAndNavigate(
                mockParentReportID,
                mockTitle,
                mockDescription,
                mockAssigneeEmail,
                mockAssigneeAccountID,
                mockAssigneeChatReport,
                mockPolicyID,
                false, // isCreatedUsingMarkdown
                {}, // quickAction
            );

            // Then: Verify API.write was called with notification preference update
            expect(API.write).toHaveBeenCalledWith(
                'CreateTask',
                expect.any(Object),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: expect.stringContaining('REPORT'),
                            value: expect.objectContaining({
                                participants: expect.objectContaining({
                                    [mockCurrentUserAccountID]: expect.objectContaining({
                                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                                    }),
                                }),
                            }),
                        }),
                    ]),
                }),
            );
        });

        it('should return early when parentReportID is undefined', () => {
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
            createTaskAndNavigate(
                undefined, // parentReportID is undefined
                mockTitle,
                mockDescription,
                mockAssigneeEmail,
                mockAssigneeAccountID,
                mockAssigneeChatReport,
                mockPolicyID,
                false, // isCreatedUsingMarkdown
                {}, // quickAction
            );

            // Then: Verify API.write was NOT called
            expect(API.write).not.toHaveBeenCalled();
        });

        it('should handle task creation with first quick action', () => {
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
            createTaskAndNavigate(
                mockParentReportID,
                mockTitle,
                mockDescription,
                mockAssigneeEmail,
                mockAssigneeAccountID,
                mockAssigneeChatReport,
                mockPolicyID,
                false, // isCreatedUsingMarkdown
                {}, // quickAction is empty
            );

            // Then: Verify API.write was called with isFirstQuickAction: true
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
});
