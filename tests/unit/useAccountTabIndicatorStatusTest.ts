import {act, renderHook} from '@testing-library/react-native';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {IndicatorTestCase} from 'tests/utils/IndicatorTestUtils';
import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
// eslint-disable-next-line no-restricted-imports
import {defaultTheme} from '@styles/theme';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const userID = 'johndoe12@expensify.com';

const brokenCardFeed = {
    feedName: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
    workspaceAccountID: 12345,
};

const TEST_CASES = {
    hasUserWalletErrors: {
        name: 'has user wallet errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS,
    },
    hasPaymentMethodError: {
        name: 'has payment method error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR,
    },
    hasReimbursementAccountErrors: {
        name: 'has reimbursement account errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS,
    },
    hasLoginListError: {
        name: 'has login list error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR,
    },
    hasWalletTermsErrors: {
        name: 'has wallet terms errors',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS,
    },
    hasCardConnectionError: {
        name: 'has card connection error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_CARD_CONNECTION_ERROR,
    },
    hasPhoneNumberError: {
        name: 'has phone number error',
        indicatorColor: defaultTheme.danger,
        status: CONST.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR,
    },
    hasLoginListInfo: {
        name: 'has login list info',
        indicatorColor: defaultTheme.success,
        status: CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO,
    },
} as const satisfies Record<string, IndicatorTestCase>;

const getMockForTestCase = ({status}: IndicatorTestCase) =>
    ({
        [ONYXKEYS.BANK_ACCOUNT_LIST]: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            12345: {
                methodID: 12345,
                errors:
                    status === CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR
                        ? {
                              error: 'Something went wrong',
                          }
                        : undefined,
            },
        },
        [ONYXKEYS.USER_WALLET]: {
            bankAccountID: 12345,
            errors:
                status === CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS
                    ? {
                          error: 'Something went wrong',
                      }
                    : undefined,
        },
        [ONYXKEYS.WALLET_TERMS]: {
            errors:
                status === CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS
                    ? {
                          error: 'Something went wrong',
                      }
                    : undefined,
            chatReportID: status === CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS ? undefined : '123',
        },
        [ONYXKEYS.LOGIN_LIST]: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            [userID]: {
                partnerName: 'John Doe',
                partnerUserID: userID,
                validatedDate: status !== CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO ? new Date().toISOString() : undefined,
                errorFields:
                    status === CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR
                        ? {
                              field: {
                                  error: 'Something went wrong',
                              },
                          }
                        : undefined,
            },
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'otheruser@expensify.com': {
                partnerName: 'Other User',
                partnerUserID: status === CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO ? 'different@expensify.com' : 'otheruser@expensify.com',
                validatedDate: status === CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO ? undefined : new Date().toISOString(),
                errorFields: undefined,
            },
        },
        [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {
            achData: {
                bankAccountID: 12345,
            },
            errors:
                status === CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS
                    ? {
                          error: 'Something went wrong',
                      }
                    : undefined,
        },
        [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {
            errorFields:
                status === CONST.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR
                    ? {
                          phoneNumber: 'Invalid phone number',
                      }
                    : undefined,
        },
        [ONYXKEYS.SESSION]: {
            email: userID,
        },
        [ONYXKEYS.CARD_LIST]: {
            card1: {
                bank: 'OTHER_BANK',
                lastScrapeResult: status === CONST.INDICATOR_STATUS.HAS_CARD_CONNECTION_ERROR ? 403 : 200,
                fundID: String(brokenCardFeed.workspaceAccountID),
            },
        },
        [`${ONYXKEYS.COLLECTION.POLICY}1` as const]: {
            id: '1',
            name: 'Workspace 1',
            owner: userID,
            role: 'admin',
            workspaceAccountID: brokenCardFeed.workspaceAccountID,
        },
    }) as unknown as OnyxMultiSetInput;

describe('useAccountTabIndicatorStatus', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    describe.each(Object.values(TEST_CASES))('$name', (testCase) => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet(getMockForTestCase(testCase));
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns correct indicatorColor', async () => {
            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(testCase.indicatorColor);
        });

        it('returns correct status', async () => {
            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status} = result.current;
            expect(status).toBe(testCase.status);
        });
    });

    describe('no errors or info', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                    [ONYXKEYS.USER_WALLET]: {},
                    [ONYXKEYS.WALLET_TERMS]: {},
                    [ONYXKEYS.LOGIN_LIST]: {},
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                    [ONYXKEYS.CARD_LIST]: {},
                    [ONYXKEYS.SESSION]: {
                        email: 'johndoe12@expensify.com',
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns undefined status when no errors or info exist', async () => {
            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status} = result.current;
            expect(status).toBeUndefined();
        });

        it('returns success color when no errors or info exist', async () => {
            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(defaultTheme.success);
        });
    });

    describe('wallet terms with chatReportID', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                    [ONYXKEYS.USER_WALLET]: {},
                    [ONYXKEYS.WALLET_TERMS]: {
                        errors: {
                            error: 'Something went wrong',
                        },
                        chatReportID: '123',
                    },
                    [ONYXKEYS.LOGIN_LIST]: {},
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                    [ONYXKEYS.CARD_LIST]: {},
                    [ONYXKEYS.SESSION]: {
                        email: 'johndoe12@expensify.com',
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('does not show wallet terms error when chatReportID exists', async () => {
            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status} = result.current;
            expect(status).toBeUndefined();
        });
    });

    describe('multiple errors', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        12345: {
                            methodID: 12345,
                            errors: {
                                error: 'Payment method error',
                            },
                        },
                    },
                    [ONYXKEYS.USER_WALLET]: {
                        bankAccountID: 12345,
                        errors: {
                            error: 'Wallet error',
                        },
                    },
                    [ONYXKEYS.WALLET_TERMS]: {},
                    [ONYXKEYS.LOGIN_LIST]: {},
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                    [ONYXKEYS.CARD_LIST]: {},
                    [ONYXKEYS.SESSION]: {
                        email: 'johndoe12@expensify.com',
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns the first error status found', async () => {
            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status} = result.current;
            // Should return the first error in the errorChecking object
            expect(status).toBe(CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS);
        });

        it('returns danger color for multiple errors', async () => {
            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(defaultTheme.danger);
        });
    });

    describe('error takes priority over info', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                    [ONYXKEYS.USER_WALLET]: {
                        bankAccountID: 12345,
                        errors: {
                            error: 'Wallet error',
                        },
                    },
                    [ONYXKEYS.WALLET_TERMS]: {},
                    [ONYXKEYS.LOGIN_LIST]: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'johndoe12@expensify.com': {
                            partnerName: 'John Doe',
                            partnerUserID: 'johndoe12@expensify.com',
                            validatedDate: undefined, // This would trigger info status
                        },
                    },
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                    [ONYXKEYS.CARD_LIST]: {},
                    [ONYXKEYS.SESSION]: {
                        email: 'johndoe12@expensify.com',
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns error status when both error and info exist', async () => {
            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status} = result.current;
            expect(status).toBe(CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS);
        });

        it('returns danger color when error takes priority', async () => {
            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {indicatorColor} = result.current;
            expect(indicatorColor).toBe(defaultTheme.danger);
        });
    });

    describe('missing data', () => {
        beforeAll(async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: null,
                    [ONYXKEYS.USER_WALLET]: null,
                    [ONYXKEYS.WALLET_TERMS]: null,
                    [ONYXKEYS.LOGIN_LIST]: null,
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: null,
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: null,
                    [ONYXKEYS.CARD_LIST]: null,
                    [ONYXKEYS.SESSION]: null,
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('handles missing data gracefully', async () => {
            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status, indicatorColor} = result.current;
            expect(status).toBeUndefined();
            expect(indicatorColor).toBe(defaultTheme.success);
        });
    });

    describe('card connection RBR logic', () => {
        beforeEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });

        it('shows error for third party card with broken connection', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.CARD_LIST]: {
                        card1: {
                            bank: brokenCardFeed.feedName,
                            fundID: String(brokenCardFeed.workspaceAccountID),
                            lastScrapeResult: 403,
                        },
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status, indicatorColor} = result.current;

            expect(status).toBe(CONST.INDICATOR_STATUS.HAS_CARD_CONNECTION_ERROR);
            expect(indicatorColor).toBe(defaultTheme.danger);
        });

        it('does not show error for Expensify Card with broken connection', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.CARD_LIST]: {
                        card1: {
                            bank: CONST.EXPENSIFY_CARD.BANK,
                            fundID: String(brokenCardFeed.workspaceAccountID),
                            lastScrapeResult: 403,
                        },
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status} = result.current;

            expect(status).toBeUndefined();
        });

        it('does not show error for third party card with good connection', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.CARD_LIST]: {
                        card1: {
                            bank: 'Chase',
                            fundID: String(brokenCardFeed.workspaceAccountID),
                            lastScrapeResult: 200,
                        },
                    },
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountTabIndicatorStatus());
            await waitForBatchedUpdatesWithAct();
            const {status} = result.current;

            expect(status).toBeUndefined();
        });
    });
});
