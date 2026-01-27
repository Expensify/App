// eslint-disable-next-line no-restricted-syntax
import Onyx from 'react-native-onyx';
// eslint-disable-next-line no-restricted-syntax
import * as PolicyUtils from '@libs/PolicyUtils';
import {isQuickActionAllowed} from '@libs/QuickActionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/Report';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
                const result = isQuickActionAllowed(requestScanAction, reportWithManagerMcTest, undefined, undefined);

                // Then it should return false
                expect(result).toBe(false);
            });
        });

        describe('Preferred policy restrictions', () => {
            const requestManualAction = {
                action: CONST.QUICK_ACTIONS.REQUEST_MANUAL,
                isFirstQuickAction: false,
            };
            const splitManualAction = {
                action: CONST.QUICK_ACTIONS.SPLIT_MANUAL,
                isFirstQuickAction: false,
            };
            const sendMoneyAction = {
                action: CONST.QUICK_ACTIONS.SEND_MONEY,
                isFirstQuickAction: false,
            };
            const RORY_EMAIL = 'rory@expensifail.com';
            const RORY_ACCOUNT_ID = 3;
            const RORY_PARTICIPANT: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: 'admin'};
            const VIT_ACCOUNT_ID = 4;
            const VIT_PARTICIPANT: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: 'member'};

            beforeAll(() => {
                Onyx.init({
                    keys: ONYXKEYS,
                    initialKeyStates: {
                        [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                        [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
                    },
                });

                return waitForBatchedUpdates();
            });

            beforeEach(() => {
                jest.clearAllMocks();
            });

            const DMReport: Report = {
                reportID: '1234',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [RORY_ACCOUNT_ID]: RORY_PARTICIPANT,
                    [VIT_ACCOUNT_ID]: VIT_PARTICIPANT,
                },
            };

            it('should restrict REQUEST action on DMs', () => {
                const withoutRestrictionsResult = isQuickActionAllowed(requestManualAction, DMReport, undefined, false, false);
                const withRestrictionsResult = isQuickActionAllowed(requestManualAction, DMReport, undefined, false, true);

                expect(withoutRestrictionsResult).toBe(true);
                expect(withRestrictionsResult).toBe(false);
            });

            it('should restrict SPLIT action on DMs', () => {
                const withoutRestrictionsResult = isQuickActionAllowed(splitManualAction, DMReport, undefined, false, false);
                const withRestrictionsResult = isQuickActionAllowed(splitManualAction, DMReport, undefined, false, true);

                expect(withoutRestrictionsResult).toBe(true);
                expect(withRestrictionsResult).toBe(false);
            });

            it('should restrict SEND_MONEY action on DMs', () => {
                const withoutRestrictionsResult = isQuickActionAllowed(sendMoneyAction, DMReport, undefined, false, false);
                const withRestrictionsResult = isQuickActionAllowed(sendMoneyAction, DMReport, undefined, false, true);

                expect(withoutRestrictionsResult).toBe(true);
                expect(withRestrictionsResult).toBe(false);
            });

            it('should restrict SPLIT action on Group chats', () => {
                const groupChatReport: Report = LHNTestUtils.getFakeReport([1, 2, 3, 4]);

                const withoutRestrictionsResult = isQuickActionAllowed(splitManualAction, groupChatReport, undefined, false, false);
                const withRestrictionsResult = isQuickActionAllowed(splitManualAction, groupChatReport, undefined, false, true);

                expect(withoutRestrictionsResult).toBe(true);
                expect(withRestrictionsResult).toBe(false);
            });

            it('should restrict SPLIT action on user-created policy rooms', () => {
                const policyRoomReport = {
                    ...LHNTestUtils.getFakeReport([1, 2]),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };

                const withoutRestrictionsResult = isQuickActionAllowed(splitManualAction, policyRoomReport, undefined, false, false);
                const withRestrictionsResult = isQuickActionAllowed(splitManualAction, policyRoomReport, undefined, false, true);

                expect(withoutRestrictionsResult).toBe(true);
                expect(withRestrictionsResult).toBe(false);
            });
        });

        describe('Policy with per diem', () => {
            const perDiemAction = {
                action: CONST.QUICK_ACTIONS.PER_DIEM,
            };
            const ownerAccountID = 1;
            const report: Report = {
                reportID: '1',
                isOwnPolicyExpenseChat: true,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                ownerAccountID,
            };
            beforeAll(() => {
                Onyx.init({
                    keys: ONYXKEYS,
                    initialKeyStates: {
                        [ONYXKEYS.SESSION]: {accountID: ownerAccountID},
                    },
                });

                return waitForBatchedUpdates();
            });
            beforeEach(() => {
                jest.clearAllMocks();
            });
            it('should allow per diem action when policy has per diem rates', () => {
                const perDiemCustomUnit = {
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    customUnitID: 'ABCDEF',
                    enabled: true,
                    rates: {
                        London: {
                            customUnitRateID: 'London',
                            name: 'London',
                        },
                    },
                };
                mockedPolicyUtils.getPerDiemCustomUnit.mockReturnValue(perDiemCustomUnit);
                const policy = {
                    id: '1',
                    arePerDiemRatesEnabled: true,
                    customUnits: {
                        ABCDEF: perDiemCustomUnit,
                    },
                } as unknown as Policy;
                mockedPolicyUtils.isPaidGroupPolicy.mockReturnValue(true);

                expect(isQuickActionAllowed(perDiemAction, report, policy, false, false)).toBe(true);
            });
            it("should not allow per diem action when policy doesn't have per diem rates", () => {
                mockedPolicyUtils.getPerDiemCustomUnit.mockReturnValue(undefined);
                const policy = {
                    id: '1',
                    arePerDiemRatesEnabled: true,
                } as unknown as Policy;
                expect(isQuickActionAllowed(perDiemAction, report, policy, false, false)).toBe(false);
            });
            it("should not allow per diem action when policy doesn't have per diem enabled", () => {
                const policy = {
                    id: '1',
                    arePerDiemRatesEnabled: false,
                } as unknown as Policy;
                expect(isQuickActionAllowed(perDiemAction, report, policy, false, false)).toBe(false);
            });
        });
    });
});
