// eslint-disable-next-line no-restricted-syntax
import * as PolicyUtils from '@libs/PolicyUtils';
import {isQuickActionAllowed} from '@libs/QuickActionUtils';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

// Mock the PolicyUtils module
jest.mock('@libs/PolicyUtils');

const mockedPolicyUtils = PolicyUtils as jest.Mocked<typeof PolicyUtils>;

describe('QuickActionUtils', () => {
    describe('isQuickActionAllowed', () => {
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
