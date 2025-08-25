// eslint-disable-next-line no-restricted-syntax
import * as PolicyUtils from '@libs/PolicyUtils';
import {isQuickActionAllowed} from '@libs/QuickActionUtils';
import CONST from '@src/CONST';
import type {Policy, Report} from '@src/types/onyx';

// Mock the PolicyUtils module
jest.mock('@libs/PolicyUtils');

const mockedPolicyUtils = PolicyUtils as jest.Mocked<typeof PolicyUtils>;

describe('QuickActionUtils', () => {
    describe('isQuickActionAllowed', () => {
        describe('CREATE_REPORT action', () => {
            const createReportAction = {
                action: CONST.QUICK_ACTIONS.CREATE_REPORT,
                targetAccountID: 123,
                isFirstQuickAction: false,
            };

            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('should return false when shouldShowPolicy returns true and isPolicyExpenseChatEnabled is true', () => {
                const policy: Partial<Policy> = {
                    id: 'policy123',
                    isPolicyExpenseChatEnabled: true,
                };

                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(false);

                const result = isQuickActionAllowed(createReportAction, undefined, policy as Policy);

                expect(result).toBe(false);
            });

            it('should return false when shouldShowPolicy returns true but isPolicyExpenseChatEnabled is false', () => {
                const policy: Partial<Policy> = {
                    id: 'policy123',
                    isPolicyExpenseChatEnabled: false,
                };

                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(false);

                const result = isQuickActionAllowed(createReportAction, undefined, policy as Policy);

                expect(result).toBe(false);
            });

            it('should return false when shouldShowPolicy returns true but isPolicyExpenseChatEnabled is undefined', () => {
                const policy: Partial<Policy> = {
                    id: 'policy123',
                    // isPolicyExpenseChatEnabled is undefined
                };

                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(true);

                const result = isQuickActionAllowed(createReportAction, undefined, policy as Policy);

                expect(result).toBe(false);
            });

            it('should return false when policy is undefined', () => {
                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(false);

                const result = isQuickActionAllowed(createReportAction, undefined, undefined);

                expect(result).toBe(false);
            });

            it('should return false when both conditions are false', () => {
                const policy: Partial<Policy> = {
                    id: 'policy123',
                    isPolicyExpenseChatEnabled: false,
                };

                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(false);

                const result = isQuickActionAllowed(createReportAction, undefined, policy as Policy);

                expect(result).toBe(false);
            });
        });
        describe('Manager McTest restrictions', () => {
            const requestScanAction = {
                action: CONST.QUICK_ACTIONS.REQUEST_SCAN,
                isFirstQuickAction: false,
            };

            // Given a report with Manager McTest
            const reportWithManagerMcTest: Report = {
                reportID: '1',
                participants: {
                    [CONST.ACCOUNT_ID.MANAGER_MCTEST]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('should return false when report contains Manager McTest', () => {
                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(false);

                // When the report contains Manager McTest
                const result = isQuickActionAllowed(requestScanAction, reportWithManagerMcTest, undefined);

                // Then it should return false
                expect(result).toBe(false);
            });
        });
    });
});
