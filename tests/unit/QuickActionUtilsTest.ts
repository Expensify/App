// eslint-disable-next-line no-restricted-syntax
import * as PolicyUtils from '@libs/PolicyUtils';
import {isQuickActionAllowed} from '@libs/QuickActionUtils';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

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

            it('should return true when shouldShowPolicy returns true and isPolicyExpenseChatEnabled is true', () => {
                const policy: Partial<Policy> = {
                    id: 'policy123',
                    isPolicyExpenseChatEnabled: true,
                };

                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(true);

                const result = isQuickActionAllowed(createReportAction, undefined, policy as Policy);

                expect(result).toBe(true);
                expect(mockedPolicyUtils.shouldShowPolicy).toHaveBeenCalledWith(policy, false, undefined);
            });

            it('should return false when shouldShowPolicy returns false even if isPolicyExpenseChatEnabled is true', () => {
                const policy: Partial<Policy> = {
                    id: 'policy123',
                    isPolicyExpenseChatEnabled: true,
                };

                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(false);

                const result = isQuickActionAllowed(createReportAction, undefined, policy as Policy);

                expect(result).toBe(false);
                expect(mockedPolicyUtils.shouldShowPolicy).toHaveBeenCalledWith(policy, false, undefined);
            });

            it('should return false when shouldShowPolicy returns true but isPolicyExpenseChatEnabled is false', () => {
                const policy: Partial<Policy> = {
                    id: 'policy123',
                    isPolicyExpenseChatEnabled: false,
                };

                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(true);

                const result = isQuickActionAllowed(createReportAction, undefined, policy as Policy);

                expect(result).toBe(false);
                expect(mockedPolicyUtils.shouldShowPolicy).toHaveBeenCalledWith(policy, false, undefined);
            });

            it('should return false when shouldShowPolicy returns true but isPolicyExpenseChatEnabled is undefined', () => {
                const policy: Partial<Policy> = {
                    id: 'policy123',
                    // isPolicyExpenseChatEnabled is undefined
                };

                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(true);

                const result = isQuickActionAllowed(createReportAction, undefined, policy as Policy);

                expect(result).toBe(false);
                expect(mockedPolicyUtils.shouldShowPolicy).toHaveBeenCalledWith(policy, false, undefined);
            });

            it('should return false when policy is undefined', () => {
                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(false);

                const result = isQuickActionAllowed(createReportAction, undefined, undefined);

                expect(result).toBe(false);
                expect(mockedPolicyUtils.shouldShowPolicy).toHaveBeenCalledWith(undefined, false, undefined);
            });

            it('should return false when both conditions are false', () => {
                const policy: Partial<Policy> = {
                    id: 'policy123',
                    isPolicyExpenseChatEnabled: false,
                };

                mockedPolicyUtils.shouldShowPolicy.mockReturnValue(false);

                const result = isQuickActionAllowed(createReportAction, undefined, policy as Policy);

                expect(result).toBe(false);
                expect(mockedPolicyUtils.shouldShowPolicy).toHaveBeenCalledWith(policy, false, undefined);
            });
        });
    });
});
