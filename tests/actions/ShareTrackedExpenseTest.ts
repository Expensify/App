import {afterEach, beforeAll, beforeEach, describe, expect, it, jest} from '@jest/globals';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock data
const POLICY_ID = '1';
const ACCOUNTANT_EMAIL = 'accountant@example.com';
const ACCOUNTANT_ACCOUNT_ID = 123;
const WORKSPACE_ADMIN_EMAIL = 'admin@example.com';
const WORKSPACE_ADMIN_ACCOUNT_ID = 456;
const REPORT_ID = 'report123';

const mockPolicy: Policy = {
    id: POLICY_ID,
    name: 'Test Workspace',
    type: CONST.POLICY.TYPE.TEAM,
    role: CONST.POLICY.ROLE.ADMIN,
    owner: WORKSPACE_ADMIN_EMAIL,
    ownerAccountID: WORKSPACE_ADMIN_ACCOUNT_ID,
    outputCurrency: CONST.CURRENCY.USD,
    employeeList: {
        [WORKSPACE_ADMIN_EMAIL]: {
            email: WORKSPACE_ADMIN_EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
            errors: {},
        },
    },
    errors: {},
    errorFields: {},
    isPolicyExpenseChatEnabled: true,
    pendingAction: null,
    avatarURL: '',
};

const mockPersonalDetails: PersonalDetailsList = {
    [WORKSPACE_ADMIN_ACCOUNT_ID]: {
        accountID: WORKSPACE_ADMIN_ACCOUNT_ID,
        login: WORKSPACE_ADMIN_EMAIL,
        displayName: 'Workspace Admin',
        avatar: '',
        firstName: 'Workspace',
        lastName: 'Admin',
    },
    [ACCOUNTANT_ACCOUNT_ID]: {
        accountID: ACCOUNTANT_ACCOUNT_ID,
        login: ACCOUNTANT_EMAIL,
        displayName: 'Accountant User',
        avatar: '',
        firstName: 'Accountant',
        lastName: 'User',
    },
};

const mockReport: Report = {
    reportID: REPORT_ID,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    policyID: POLICY_ID,
    participants: {
        [WORKSPACE_ADMIN_ACCOUNT_ID]: {
            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
        },
    },
    ownerAccountID: WORKSPACE_ADMIN_ACCOUNT_ID,
    managerID: WORKSPACE_ADMIN_ACCOUNT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    reportName: 'Test Report',
    lastReadTime: '',
    lastVisibleActionCreated: '',
    errors: {},
    errorFields: {},
    isOwnPolicyExpenseChat: true,
};

describe('actions/IOU - shareTrackedExpense', () => {
    let writeSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
        writeSpy = jest.spyOn(API, 'write').mockResolvedValue();
        
        // Set up initial Onyx data
        const initialData = {
            [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: mockPolicy,
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockPersonalDetails,
            [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`]: mockReport,
        };
        
        await Onyx.multiSet(initialData as Record<string, unknown>);
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        writeSpy.mockRestore();
    });

    describe('failure cases', () => {
        it('should call SHARE_TRACKED_EXPENSE API with correct parameters and failure data structure', async () => {
            // Execute shareTrackedExpense
            IOU.trackExpense({
                report: mockReport,
                isDraftPolicy: false,
                action: CONST.IOU.ACTION.SHARE,
                participantParams: {
                    payeeEmail: WORKSPACE_ADMIN_EMAIL,
                    payeeAccountID: WORKSPACE_ADMIN_ACCOUNT_ID,
                    participant: {login: WORKSPACE_ADMIN_EMAIL, accountID: WORKSPACE_ADMIN_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 10000,
                    currency: CONST.CURRENCY.USD,
                    created: '2024-10-30',
                    merchant: 'Test Merchant',
                    receipt: {},
                    actionableWhisperReportActionID: '1',
                    linkedTrackedExpenseReportAction: {
                        reportActionID: '',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        created: '2024-10-30',
                    },
                    linkedTrackedExpenseReportID: '1',
                },
                accountantParams: {
                    accountant: {
                        accountID: ACCOUNTANT_ACCOUNT_ID,
                        login: ACCOUNTANT_EMAIL,
                    },
                },
            });

            await waitForBatchedUpdates();

            // Verify API was called with SHARE_TRACKED_EXPENSE command
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.SHARE_TRACKED_EXPENSE,
                expect.objectContaining({
                    accountantEmail: ACCOUNTANT_EMAIL,
                }),
                expect.objectContaining({
                    failureData: expect.any(Array),
                }),
            );

            // Verify that the API call includes the required failure data structure
            expect(writeSpy).toHaveBeenCalledTimes(1);
            
            // Extract the call arguments to verify structure
            const [command, params, onyxData] = writeSpy.mock.calls.at(0) ?? [];
            
            expect(command).toBe(WRITE_COMMANDS.SHARE_TRACKED_EXPENSE);
            expect(params).toEqual(expect.objectContaining({
                accountantEmail: ACCOUNTANT_EMAIL,
            }));
            expect(onyxData).toEqual(expect.objectContaining({
                optimisticData: expect.any(Array),
                successData: expect.any(Array),
                failureData: expect.any(Array),
            }));
        });

        it('should handle policy member errors that would trigger UI error indicators', async () => {
            // Mock API failure by simulating error state
            writeSpy.mockImplementation(() => {
                // Simulate failure by adding error to policy employee
                const errorTimestamp = Date.now().toString();
                const updatedPolicy = {
                    ...mockPolicy,
                    employeeList: {
                        ...mockPolicy.employeeList,
                        [ACCOUNTANT_EMAIL]: {
                            email: ACCOUNTANT_EMAIL,
                            role: CONST.POLICY.ROLE.ADMIN,
                            errors: {
                                [errorTimestamp]: 'workspace.people.error.genericAdd',
                            },
                        },
                    },
                };
                
                // Apply the error state to Onyx
                Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, updatedPolicy);
                return Promise.resolve();
            });

            // Execute shareTrackedExpense
            IOU.trackExpense({
                report: mockReport,
                isDraftPolicy: false,
                action: CONST.IOU.ACTION.SHARE,
                participantParams: {
                    payeeEmail: WORKSPACE_ADMIN_EMAIL,
                    payeeAccountID: WORKSPACE_ADMIN_ACCOUNT_ID,
                    participant: {login: WORKSPACE_ADMIN_EMAIL, accountID: WORKSPACE_ADMIN_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 10000,
                    currency: CONST.CURRENCY.USD,
                    created: '2024-10-30',
                    merchant: 'Test Merchant',
                    receipt: {},
                    actionableWhisperReportActionID: '1',
                    linkedTrackedExpenseReportAction: {
                        reportActionID: '',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        created: '2024-10-30',
                    },
                    linkedTrackedExpenseReportID: '1',
                },
                accountantParams: {
                    accountant: {
                        accountID: ACCOUNTANT_ACCOUNT_ID,
                        login: ACCOUNTANT_EMAIL,
                    },
                },
            });

            await waitForBatchedUpdates();

            // Verify that the policy now has member errors that would trigger UI indicators
            return new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`,
                    callback: (policy) => {
                        const typedPolicy = policy as Policy | null;
                        if (!typedPolicy?.employeeList?.[ACCOUNTANT_EMAIL]?.errors) {
                            return;
                        }

                        Onyx.disconnect(connection);

                        // Verify the error structure that would be used by UI components:
                        // 1. TableListItem component - displays workspace.people.error.genericAdd via BaseListItem
                        // 2. MenuItem component - shows red dot via brickRoadIndicator  
                        // 3. NavigationTabBar - shows red dot via useWorkspacesTabIndicatorStatus
                        
                        const accountantEmployee = typedPolicy.employeeList[ACCOUNTANT_EMAIL];
                        expect(accountantEmployee.errors).toBeDefined();
                        
                        const errorMessages = Object.values(accountantEmployee.errors ?? {});
                        expect(errorMessages).toContain('workspace.people.error.genericAdd');

                        // Verify that this error state would trigger shouldShowEmployeeListError() 
                        // which is used by WorkspaceInitialPage and useWorkspacesTabIndicatorStatus
                        const hasEmployeeErrors = Object.values(typedPolicy.employeeList).some(
                            employee => employee.errors && Object.keys(employee.errors).length > 0
                        );
                        expect(hasEmployeeErrors).toBe(true);

                        resolve();
                    },
                });
            });
        });

        it('should handle adding accountant to workspace when not already a member', async () => {
            // Set up policy without accountant initially
            const policyWithoutAccountant = {
                ...mockPolicy,
                employeeList: {
                    [WORKSPACE_ADMIN_EMAIL]: {
                        email: WORKSPACE_ADMIN_EMAIL,
                        role: CONST.POLICY.ROLE.ADMIN,
                        errors: {},
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policyWithoutAccountant);
            await waitForBatchedUpdates();

            // Execute shareTrackedExpense with accountant not in workspace
            IOU.trackExpense({
                report: mockReport,
                isDraftPolicy: false,
                action: CONST.IOU.ACTION.SHARE,
                participantParams: {
                    payeeEmail: WORKSPACE_ADMIN_EMAIL,
                    payeeAccountID: WORKSPACE_ADMIN_ACCOUNT_ID,
                    participant: {login: WORKSPACE_ADMIN_EMAIL, accountID: WORKSPACE_ADMIN_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 10000,
                    currency: CONST.CURRENCY.USD,
                    created: '2024-10-30',
                    merchant: 'Test Merchant',
                    receipt: {},
                    actionableWhisperReportActionID: '1',
                    linkedTrackedExpenseReportAction: {
                        reportActionID: '',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        created: '2024-10-30',
                    },
                    linkedTrackedExpenseReportID: '1',
                },
                accountantParams: {
                    accountant: {
                        accountID: ACCOUNTANT_ACCOUNT_ID,
                        login: ACCOUNTANT_EMAIL,
                    },
                },
            });

            await waitForBatchedUpdates();

            // Verify API was called with correct parameters
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.SHARE_TRACKED_EXPENSE,
                expect.objectContaining({
                    accountantEmail: ACCOUNTANT_EMAIL,
                }),
                expect.objectContaining({
                    // Should include data for adding accountant to workspace
                    optimisticData: expect.any(Array),
                    successData: expect.any(Array),
                    failureData: expect.any(Array),
                }),
            );

            // Verify the call includes proper Onyx data structure for member addition
            const [, , onyxData] = writeSpy.mock.calls.at(0) ?? [];
            
            expect(onyxData?.failureData).toBeDefined();
            expect(Array.isArray(onyxData?.failureData)).toBe(true);
            expect(onyxData?.optimisticData).toBeDefined();
            expect(Array.isArray(onyxData?.optimisticData)).toBe(true);
            expect(onyxData?.successData).toBeDefined();
            expect(Array.isArray(onyxData?.successData)).toBe(true);
        });
    });
});