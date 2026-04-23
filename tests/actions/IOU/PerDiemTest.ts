/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {RequestMoneyParticipantParams} from '@libs/actions/IOU';
import type {PerDiemExpenseTransactionParams} from '@libs/actions/IOU/PerDiem';
import {addSubrate, clearSubrates, computePerDiemExpenseAmount, getPerDiemExpenseInformation, removeSubrate, submitPerDiemExpense, updateSubrate} from '@libs/actions/IOU/PerDiem';
import CONST from '@src/CONST';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, RecentlyUsedTags, Report} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Transaction from '@src/types/onyx/Transaction';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';
import createPersonalDetails from '../../utils/collections/personalDetails';
import createRandomPolicy from '../../utils/collections/policies';
import createRandomPolicyCategories from '../../utils/collections/policyCategory';
import createRandomPolicyTags from '../../utils/collections/policyTags';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import {getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    dismissToSuperWideRHP: jest.fn(),
    navigateBackToLastSuperWideRHPScreen: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => '23423423'),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    removeScreenByKey: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    getActiveRoute: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn(() => false));

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;
const TRANSACTION_ID = 'test-txn-1';

describe('PerDiem', () => {
    const currentUserPersonalDetails: CurrentUserPersonalDetails = {
        ...createPersonalDetails(RORY_ACCOUNT_ID),
        login: RORY_EMAIL,
        email: RORY_EMAIL,
        displayName: RORY_EMAIL,
        avatar: 'https://example.com/avatar.jpg',
    };

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
        jest.clearAllTimers();
        global.fetch = getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('computePerDiemExpenseAmount', () => {
        it('should compute total amount from subRates', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [
                    {id: '1', quantity: 2, name: 'Full Day', rate: 10000},
                    {id: '2', quantity: 1, name: 'Half Day', rate: 5000},
                ],
            };
            // 2 * 10000 + 1 * 5000 = 25000
            expect(computePerDiemExpenseAmount(customUnit)).toBe(25000);
        });

        it('should return 0 when subRates is empty', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [],
            };
            expect(computePerDiemExpenseAmount(customUnit)).toBe(0);
        });

        it('should return 0 when subRates is undefined', () => {
            const customUnit: TransactionCustomUnit = {};
            expect(computePerDiemExpenseAmount(customUnit)).toBe(0);
        });

        it('should handle single subRate', () => {
            const customUnit: TransactionCustomUnit = {
                subRates: [{id: '1', quantity: 3, name: 'Meals', rate: 2500}],
            };
            expect(computePerDiemExpenseAmount(customUnit)).toBe(7500);
        });
    });

    describe('Subrate operations', () => {
        function createTransactionWithSubrates(subRates: Array<{id: string; quantity: number; name: string; rate: number}>): Transaction {
            const transaction = createRandomTransaction(1);
            transaction.transactionID = TRANSACTION_ID;
            transaction.comment = {
                ...transaction.comment,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    subRates,
                },
            };
            return transaction;
        }

        describe('addSubrate', () => {
            it('should add a subrate at the correct index', async () => {
                const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
                await waitForBatchedUpdates();

                addSubrate(transaction, '1', 2, '2', 'Day 2', 5000);
                await waitForBatchedUpdates();

                const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
                const subRates = draft?.comment?.customUnit?.subRates ?? [];
                expect(subRates).toHaveLength(2);
                expect(subRates.at(1)).toEqual(expect.objectContaining({id: '2', quantity: 2, name: 'Day 2', rate: 5000}));
            });

            it('should not add subrate when index is -1', async () => {
                const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
                await waitForBatchedUpdates();

                addSubrate(transaction, '-1', 2, '2', 'Day 2', 5000);
                await waitForBatchedUpdates();

                const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
                const subRates = draft?.comment?.customUnit?.subRates ?? [];
                expect(subRates).toHaveLength(1);
            });

            it('should not add subrate when index does not match the length', async () => {
                const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
                await waitForBatchedUpdates();

                // index 0 !== length 1, should not add
                addSubrate(transaction, '0', 2, '2', 'Day 2', 5000);
                await waitForBatchedUpdates();

                const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
                const subRates = draft?.comment?.customUnit?.subRates ?? [];
                expect(subRates).toHaveLength(1);
            });

            it('should add first subrate when transaction has no existing subrates', async () => {
                const transaction = createRandomTransaction(1);
                transaction.transactionID = TRANSACTION_ID;
                transaction.comment = {...transaction.comment, customUnit: {name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL}};
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
                await waitForBatchedUpdates();

                addSubrate(transaction, '0', 1, '1', 'Day 1', 10000);
                await waitForBatchedUpdates();

                const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
                const subRates = draft?.comment?.customUnit?.subRates ?? [];
                expect(subRates).toHaveLength(1);
                expect(subRates.at(0)).toEqual(expect.objectContaining({id: '1', quantity: 1, name: 'Day 1', rate: 10000}));
            });
        });

        describe('removeSubrate', () => {
            it('should remove a subrate at the specified index', async () => {
                const transaction = createTransactionWithSubrates([
                    {id: '1', quantity: 1, name: 'Day 1', rate: 10000},
                    {id: '2', quantity: 2, name: 'Day 2', rate: 5000},
                ]);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
                await waitForBatchedUpdates();

                removeSubrate(transaction, '0');
                await waitForBatchedUpdates();

                const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
                const subRates = draft?.comment?.customUnit?.subRates ?? [];
                expect(subRates).toHaveLength(1);
                expect(subRates.at(0)).toEqual(expect.objectContaining({id: '2'}));
            });

            it('should not remove subrate when index is -1', async () => {
                const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
                await waitForBatchedUpdates();

                removeSubrate(transaction, '-1');
                await waitForBatchedUpdates();

                const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
                const subRates = draft?.comment?.customUnit?.subRates ?? [];
                expect(subRates).toHaveLength(1);
            });
        });

        describe('updateSubrate', () => {
            it('should update a subrate at the specified index', async () => {
                const transaction = createTransactionWithSubrates([
                    {id: '1', quantity: 1, name: 'Day 1', rate: 10000},
                    {id: '2', quantity: 2, name: 'Day 2', rate: 5000},
                ]);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
                await waitForBatchedUpdates();

                updateSubrate(transaction, '1', 3, '2', 'Day 2 Updated', 7500);
                await waitForBatchedUpdates();

                const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
                const subRates = draft?.comment?.customUnit?.subRates ?? [];
                expect(subRates).toHaveLength(2);
                expect(subRates.at(1)).toEqual(expect.objectContaining({id: '2', quantity: 3, name: 'Day 2 Updated', rate: 7500}));
            });

            it('should not update when index is -1', async () => {
                const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
                await waitForBatchedUpdates();

                updateSubrate(transaction, '-1', 3, '1', 'Updated', 7500);
                await waitForBatchedUpdates();

                const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
                const subRates = draft?.comment?.customUnit?.subRates ?? [];
                expect(subRates.at(0)).toEqual(expect.objectContaining({name: 'Day 1', rate: 10000}));
            });

            it('should not update when index is out of bounds', async () => {
                const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
                await waitForBatchedUpdates();

                updateSubrate(transaction, '5', 3, '1', 'Updated', 7500);
                await waitForBatchedUpdates();

                const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
                const subRates = draft?.comment?.customUnit?.subRates ?? [];
                expect(subRates).toHaveLength(1);
                expect(subRates.at(0)).toEqual(expect.objectContaining({name: 'Day 1'}));
            });
        });

        describe('clearSubrates', () => {
            it('should clear all subrates on a transaction draft', async () => {
                const transaction = createTransactionWithSubrates([
                    {id: '1', quantity: 1, name: 'Day 1', rate: 10000},
                    {id: '2', quantity: 2, name: 'Day 2', rate: 5000},
                ]);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
                await waitForBatchedUpdates();

                clearSubrates(TRANSACTION_ID);
                await waitForBatchedUpdates();

                const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
                expect(draft?.comment?.customUnit?.subRates).toEqual([]);
            });
        });
    });

    describe('getPerDiemExpenseInformation', () => {
        it('should include policyRecentlyUsedCurrencies when provided', () => {
            const testCurrency = CONST.CURRENCY.GBP;
            const initialCurrencies = [CONST.CURRENCY.USD, CONST.CURRENCY.EUR];
            const mockTransactionParams: PerDiemExpenseTransactionParams = {
                comment: '',
                currency: testCurrency,
                created: '2024-02-02',
                category: 'Meals',
                tag: 'PerDiem',
                customUnit: {
                    customUnitID: 'per_diem_unit',
                    customUnitRateID: 'rate_1',
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    attributes: {
                        dates: {
                            start: '2024-02-02',
                            end: '2024-02-02',
                        },
                    },
                    subRates: [],
                    quantity: 1,
                },
                billable: true,
                attendees: [],
                reimbursable: true,
            };

            const mockParticipantParams = {
                payeeAccountID: 123,
                payeeEmail: 'payee@example.com',
                participant: {
                    accountID: 123,
                    login: 'payee@example.com',
                },
            };

            const result = getPerDiemExpenseInformation({
                parentChatReport: {} as OnyxEntry<Report>,
                transactionParams: mockTransactionParams,
                participantParams: mockParticipantParams as unknown as RequestMoneyParticipantParams,
                recentlyUsedParams: {},
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'payee@example.com',
                hasViolations: false,
                policyRecentlyUsedCurrencies: initialCurrencies,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {[mockParticipantParams.payeeAccountID]: {accountID: mockParticipantParams.payeeAccountID, login: 'payee@example.com'}},
            });

            expect(result.onyxData).toBeDefined();
            expect(result.onyxData.optimisticData).toBeDefined();

            const optimisticData = result.onyxData?.optimisticData;
            expect(optimisticData).toBeDefined();
            const currencyUpdate = optimisticData?.find((update) => update.key === ONYXKEYS.RECENTLY_USED_CURRENCIES && update.onyxMethod === Onyx.METHOD.SET);
            expect(currencyUpdate).toBeDefined();
            expect(currencyUpdate?.value).toEqual([testCurrency, ...initialCurrencies]);
        });

        it('should return correct per diem expense information with new chat report', () => {
            // Given: Mock data for per diem expense
            const mockCustomUnit = {
                customUnitID: 'per_diem_123',
                customUnitRateID: 'rate_456',
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                attributes: {
                    dates: {
                        start: '2024-01-15',
                        end: '2024-01-15',
                    },
                },
                subRates: [
                    {
                        id: 'breakfast_1',
                        name: 'Breakfast',
                        rate: 25,
                        quantity: 1,
                    },
                    {
                        id: 'lunch_1',
                        name: 'Lunch',
                        rate: 35,
                        quantity: 1,
                    },
                ],
                quantity: 1,
            };

            const mockParticipant = {
                accountID: 123,
                login: 'test@example.com',
                displayName: 'Test User',
                isPolicyExpenseChat: false,
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                role: CONST.REPORT.ROLE.MEMBER,
            };

            const mockTransactionParams = {
                currency: 'USD',
                created: '2024-01-15',
                category: 'Travel',
                tag: 'Project A',
                customUnit: mockCustomUnit,
                billable: true,
                attendees: [],
                reimbursable: true,
                comment: 'Business trip per diem',
            };

            const mockParticipantParams = {
                payeeAccountID: 456,
                payeeEmail: 'payee@example.com',
                participant: mockParticipant,
            };

            const mockPolicyParams = {
                policy: createRandomPolicy(1),
                policyCategories: createRandomPolicyCategories(3),
                policyTagList: createRandomPolicyTags('tagList', 2),
            };

            // When: Call getPerDiemExpenseInformation
            const result = getPerDiemExpenseInformation({
                parentChatReport: {} as OnyxEntry<Report>,
                transactionParams: mockTransactionParams,
                participantParams: mockParticipantParams,
                policyParams: mockPolicyParams,
                recentlyUsedParams: {},
                moneyRequestReportID: '1',
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                hasViolations: false,
                policyRecentlyUsedCurrencies: [],
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {[mockParticipant.accountID]: {accountID: mockParticipant.accountID, login: 'existing@example.com'}},
            });

            // Then: Verify the result structure and key values
            expect(result).toMatchObject({
                payerAccountID: 123,
                payerEmail: 'test@example.com',
                billable: true,
                reimbursable: true,
            });

            // Verify chat report was created
            expect(result.chatReport).toBeDefined();
            expect(result.chatReport.reportID).toBeDefined();

            // Verify IOU report was created
            expect(result.iouReport).toBeDefined();
            expect(result.iouReport.reportID).toBeDefined();
            expect(result.iouReport.type).toBe(CONST.REPORT.TYPE.IOU);

            // Verify transaction was created with correct per diem data
            expect(result.transaction).toBeDefined();
            expect(result.transaction.transactionID).toBeDefined();
            expect(result.transaction.iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.PER_DIEM);
            expect(result.transaction.hasEReceipt).toBe(true);
            expect(result.transaction.currency).toBe('USD');
            expect(result.transaction.category).toBe('Travel');
            expect(result.transaction.tag).toBe('Project A');
            expect(result.transaction.comment?.comment).toBe('Business trip per diem');

            // Verify IOU action was created
            expect(result.iouAction).toBeDefined();
            expect(result.iouAction.reportActionID).toBeDefined();
            expect(result.iouAction.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.IOU);

            // Verify report preview action
            expect(result.reportPreviewAction).toBeDefined();
            expect(result.reportPreviewAction.reportActionID).toBeDefined();

            // Verify Onyx data structure
            expect(result.onyxData).toBeDefined();
            expect(result.onyxData.optimisticData).toBeDefined();
            expect(result.onyxData.successData).toBeDefined();
            expect(result.onyxData.failureData).toBeDefined();

            // Verify created action IDs for new reports
            expect(result.createdChatReportActionID).toBeDefined();
            expect(result.createdIOUReportActionID).toBeDefined();
        });

        it('should return correct per diem expense information with existing chat report', () => {
            // Given: Existing chat report
            const existingChatReport = {
                reportID: 'chat_123',
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '123': {
                        accountID: 123,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '456': {
                        accountID: 456,
                        role: CONST.REPORT.ROLE.MEMBER,
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
                iouReportID: 'iou_456',
                type: CONST.REPORT.TYPE.CHAT,
            };

            const mockCustomUnit = {
                customUnitID: 'per_diem_789',
                customUnitRateID: 'rate_101',
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                attributes: {
                    dates: {
                        start: '2024-01-20',
                        end: '2024-01-20',
                    },
                },
                subRates: [
                    {
                        id: 'dinner_1',
                        name: 'Dinner',
                        rate: 45,
                        quantity: 1,
                    },
                ],
                quantity: 2,
            };

            const mockParticipant = {
                accountID: 123,
                login: 'existing@example.com',
                displayName: 'Existing User',
                isPolicyExpenseChat: false,
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                role: CONST.REPORT.ROLE.MEMBER,
            };

            const mockTransactionParams = {
                comment: 'Conference per diem',
                currency: 'USD',
                created: '2024-01-20',
                category: 'Meals',
                tag: 'Conference',
                customUnit: mockCustomUnit,
                billable: false,
                attendees: [],
                reimbursable: true,
            };

            const mockParticipantParams = {
                payeeAccountID: 456,
                payeeEmail: 'payee@example.com',
                participant: mockParticipant,
            };

            // When: Call getPerDiemExpenseInformation with existing chat report
            const result = getPerDiemExpenseInformation({
                parentChatReport: existingChatReport as OnyxEntry<Report>,
                transactionParams: mockTransactionParams as PerDiemExpenseTransactionParams,
                participantParams: mockParticipantParams as RequestMoneyParticipantParams,
                recentlyUsedParams: {},
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                hasViolations: false,
                policyRecentlyUsedCurrencies: [],
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {[mockParticipant.accountID]: {accountID: mockParticipant.accountID, login: 'existing@example.com'}},
            });

            // Then: Verify the result uses existing chat report
            expect(result.chatReport.reportID).toBe('chat_123');
            expect(result.chatReport.chatType).toBe(CONST.REPORT.CHAT_TYPE.GROUP);

            // Verify transaction has correct per diem data
            expect(result.transaction.iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.PER_DIEM);
            expect(result.transaction.hasEReceipt).toBe(true);
            expect(result.transaction.currency).toBe('USD');
            expect(result.transaction.category).toBe('Meals');
            expect(result.transaction.tag).toBe('Conference');
            expect(result.transaction.comment?.comment).toBe('Conference per diem');

            // Verify no new chat report action ID since using existing
            expect(result.createdChatReportActionID).toBeUndefined();
        });

        it('should handle policy expense chat correctly', () => {
            // Given: Policy expense chat participant
            const mockParticipant = {
                accountID: 123,
                login: 'policy@example.com',
                displayName: 'Policy User',
                isPolicyExpenseChat: true,
                reportID: 'policy_chat_123',
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                role: CONST.REPORT.ROLE.MEMBER,
            };

            const mockCustomUnit = {
                customUnitID: 'per_diem_policy',
                customUnitRateID: 'rate_policy',
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                attributes: {
                    dates: {
                        start: '2024-01-25',
                        end: '2024-01-25',
                    },
                },
                subRates: [
                    {
                        id: 'lodging_1',
                        name: 'Lodging',
                        rate: 150,
                        quantity: 1,
                    },
                ],
                quantity: 1,
            };

            const mockTransactionParams = {
                comment: 'Policy per diem',
                currency: 'USD',
                created: '2024-01-25',
                category: 'Lodging',
                tag: 'Policy',
                customUnit: mockCustomUnit,
                billable: true,
                attendees: [],
                reimbursable: true,
            };

            const mockParticipantParams = {
                payeeAccountID: 456,
                payeeEmail: 'payee@example.com',
                participant: mockParticipant,
            };

            const mockPolicyParams = {
                policy: createRandomPolicy(2),
            };

            // When: Call getPerDiemExpenseInformation for policy expense chat
            const result = getPerDiemExpenseInformation({
                parentChatReport: {} as OnyxEntry<Report>,
                transactionParams: mockTransactionParams as PerDiemExpenseTransactionParams,
                participantParams: mockParticipantParams as RequestMoneyParticipantParams,
                policyParams: mockPolicyParams,
                recentlyUsedParams: {},
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                hasViolations: false,
                policyRecentlyUsedCurrencies: [],
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {[mockParticipant.accountID]: {accountID: mockParticipant.accountID, login: 'existing@example.com'}},
            });

            // Then: Verify policy expense chat handling
            expect(result.payerAccountID).toBe(123);
            expect(result.payerEmail).toBe('policy@example.com');
            expect(result.transaction.iouRequestType).toBe(CONST.IOU.REQUEST_TYPE.PER_DIEM);
            expect(result.transaction.hasEReceipt).toBe(true);
            expect(result.billable).toBe(true);
            expect(result.reimbursable).toBe(true);
        });
    });

    describe('submitPerDiemExpense', () => {
        it('should update policyRecentlyUsedTags when tag is provided', async () => {
            // Given a transaction with a tag
            const iouReportID = '2';
            const policyID = 'A';
            const transactionTag = 'new tag';
            const tagName = 'Tag';
            const policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags> = {
                [tagName]: ['old tag'],
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
                reportID: iouReportID,
                policyID,
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: currentUserPersonalDetails.accountID,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
                [tagName]: {name: tagName},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, policyRecentlyUsedTags);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                ...createRandomPolicy(1),
                id: policyID,
                type: CONST.POLICY.TYPE.TEAM,
            });
            await waitForBatchedUpdates();

            // When submitting a per diem expense
            submitPerDiemExpense({
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                participantParams: {
                    payeeEmail: currentUserPersonalDetails.login,
                    payeeAccountID: currentUserPersonalDetails.accountID,
                    participant: {},
                },
                report: {
                    reportID: '1',
                    iouReportID,
                },
                transactionParams: {
                    created: DateUtils.getDBTime(),
                    currency: CONST.CURRENCY.USD,
                    tag: transactionTag,
                    customUnit: {
                        customUnitID: 'A',
                        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                        customUnitRateID: 'B',
                        subRates: [{id: '1', name: 'rate_a', quantity: 1, rate: 2}],
                        attributes: {dates: {end: '', start: ''}},
                    },
                },
                policyRecentlyUsedCurrencies: [],
                policyParams: {
                    policy: {...createRandomPolicy(1)},
                    policyRecentlyUsedTags,
                },
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
            });

            await waitForBatchedUpdates();

            // Then the transaction tag should be added to the recently used tags collection
            const newPolicyRecentlyUsedTags: RecentlyUsedTags = await new Promise((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`,
                    callback: (recentlyUsedTags) => {
                        resolve(recentlyUsedTags ?? {});
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(newPolicyRecentlyUsedTags[tagName].length).toBe(2);
            expect(newPolicyRecentlyUsedTags[tagName].at(0)).toBe(transactionTag);
        });
    });

    describe('getPerDiemExpenseInformation with personalDetails', () => {
        it('should pass personalDetails through to buildOnyxDataForMoneyRequest', () => {
            // Given personalDetails with the current user
            const mockTransactionParams: PerDiemExpenseTransactionParams = {
                comment: '',
                currency: CONST.CURRENCY.USD,
                created: '2024-02-02',
                category: 'Meals',
                tag: '',
                customUnit: {
                    customUnitID: 'per_diem_unit',
                    customUnitRateID: 'rate_1',
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    attributes: {
                        dates: {
                            start: '2024-02-02',
                            end: '2024-02-02',
                        },
                    },
                    subRates: [],
                    quantity: 1,
                },
                billable: false,
                attendees: [],
                reimbursable: true,
            };

            const personalDetailsList: PersonalDetailsList = {
                [RORY_ACCOUNT_ID]: {
                    accountID: RORY_ACCOUNT_ID,
                    login: RORY_EMAIL,
                    displayName: 'Rory',
                },
            };

            // When calling getPerDiemExpenseInformation with personalDetails
            const result = getPerDiemExpenseInformation({
                parentChatReport: {} as OnyxEntry<Report>,
                transactionParams: mockTransactionParams,
                participantParams: {
                    payeeAccountID: RORY_ACCOUNT_ID,
                    payeeEmail: RORY_EMAIL,
                    participant: {
                        accountID: RORY_ACCOUNT_ID,
                        login: RORY_EMAIL,
                    },
                } as unknown as RequestMoneyParticipantParams,
                recentlyUsedParams: {},
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                hasViolations: false,
                policyRecentlyUsedCurrencies: [],
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: personalDetailsList,
            });

            // Then the result should be valid (personalDetails is correctly passed through the chain)
            expect(result).toBeDefined();
            expect(result.onyxData).toBeDefined();
            expect(result.transaction).toBeDefined();
            expect(result.iouReport).toBeDefined();
        });
    });

    describe('submitPerDiemExpense with personalDetails', () => {
        it('should correctly submit per diem expense with personalDetails', async () => {
            // Given a valid per diem expense setup with personalDetails
            const iouReportID = '2';
            const policyID = 'B';

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
                reportID: iouReportID,
                policyID,
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: currentUserPersonalDetails.accountID,
            });

            const personalDetailsList: PersonalDetailsList = {
                [RORY_ACCOUNT_ID]: {
                    accountID: RORY_ACCOUNT_ID,
                    login: RORY_EMAIL,
                    displayName: 'Rory',
                },
            };

            // When submitting a per diem expense with personalDetails
            submitPerDiemExpense({
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                participantParams: {
                    payeeEmail: currentUserPersonalDetails.login,
                    payeeAccountID: currentUserPersonalDetails.accountID,
                    participant: {},
                },
                report: {
                    reportID: '1',
                    iouReportID,
                },
                transactionParams: {
                    created: DateUtils.getDBTime(),
                    currency: CONST.CURRENCY.USD,
                    customUnit: {
                        customUnitID: 'A',
                        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                        customUnitRateID: 'B',
                        subRates: [{id: '1', name: 'rate_a', quantity: 1, rate: 2}],
                        attributes: {dates: {end: '', start: ''}},
                    },
                },
                policyRecentlyUsedCurrencies: [],
                policyParams: {
                    policy: {...createRandomPolicy(1)},
                },
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: personalDetailsList,
            });

            await waitForBatchedUpdates();

            // Then the expense should be submitted successfully (no errors thrown)
            // Verify that at least one transaction was created
            const transactions = await new Promise<OnyxCollection<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const perDiemTransactions = Object.values(transactions ?? {}).filter((tx) => tx?.iouRequestType === CONST.IOU.REQUEST_TYPE.PER_DIEM);
            expect(perDiemTransactions.length).toBeGreaterThan(0);
        });
    });
});
