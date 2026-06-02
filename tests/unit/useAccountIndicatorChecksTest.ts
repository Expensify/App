import {act, renderHook} from '@testing-library/react-native';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useAccountIndicatorChecks from '@hooks/useAccountIndicatorChecks';
import CONST from '@src/CONST';
import initOnyxDerivedValues from '@src/libs/actions/OnyxDerived';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const userID = 'johndoe12@expensify.com';

const cardFeed = {
    feedName: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
    workspaceAccountID: 12345,
};

describe('useAccountIndicatorChecks', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
    });

    describe('account error statuses', () => {
        it('returns HAS_USER_WALLET_ERRORS when wallet has errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.USER_WALLET]: {
                        bankAccountID: 12345,
                        errors: {error: 'Something went wrong'},
                    },
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBe(CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS);
        });

        it('returns HAS_PAYMENT_METHOD_ERROR when bank account has errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.USER_WALLET]: {},
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        12345: {
                            methodID: 12345,
                            errors: {error: 'Something went wrong'},
                        },
                    },
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBe(CONST.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR);
        });

        it('returns HAS_REIMBURSEMENT_ACCOUNT_ERRORS when reimbursement account has errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.USER_WALLET]: {},
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {
                        achData: {bankAccountID: 12345},
                        errors: {error: 'Something went wrong'},
                    },
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBe(CONST.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS);
        });

        it('returns HAS_LOGIN_LIST_ERROR when login list has errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.USER_WALLET]: {},
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                    [ONYXKEYS.LOGIN_LIST]: {
                        [userID]: {
                            partnerName: 'John Doe',
                            partnerUserID: userID,
                            validatedDate: new Date().toISOString(),
                            errorFields: {field: {error: 'Something went wrong'}},
                        },
                    },
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBe(CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR);
        });

        it('returns HAS_WALLET_TERMS_ERRORS when wallet terms has errors without chatReportID', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.USER_WALLET]: {},
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                    [ONYXKEYS.LOGIN_LIST]: {},
                    [ONYXKEYS.WALLET_TERMS]: {
                        errors: {error: 'Something went wrong'},
                    },
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBe(CONST.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS);
        });

        it('does not return wallet terms error when chatReportID exists', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.USER_WALLET]: {},
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                    [ONYXKEYS.LOGIN_LIST]: {},
                    [ONYXKEYS.WALLET_TERMS]: {
                        errors: {error: 'Something went wrong'},
                        chatReportID: '123',
                    },
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBeUndefined();
        });

        it('returns HAS_PHONE_NUMBER_ERROR when phone number has errors', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.USER_WALLET]: {},
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                    [ONYXKEYS.LOGIN_LIST]: {},
                    [ONYXKEYS.WALLET_TERMS]: {},
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {
                        errorFields: {phoneNumber: 'Invalid phone number'},
                    },
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBe(CONST.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR);
        });

        it('returns HAS_SUBSCRIPTION_ERRORS when subscription has billing dispute', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.USER_WALLET]: {},
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                    [ONYXKEYS.LOGIN_LIST]: {},
                    [ONYXKEYS.WALLET_TERMS]: {},
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                    [ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING]: 1,
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBe(CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS);
        });

        it('returns HAS_EMPLOYEE_CARD_FEED_ERRORS for non-admin with broken card connection', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.USER_WALLET]: {},
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                    [ONYXKEYS.LOGIN_LIST]: {},
                    [ONYXKEYS.WALLET_TERMS]: {},
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                    [ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING]: 0,
                    [ONYXKEYS.CARD_LIST]: {
                        card1: {
                            bank: cardFeed.feedName,
                            fundID: String(cardFeed.workspaceAccountID),
                            lastScrapeResult: 403,
                        },
                    },
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBe(CONST.INDICATOR_STATUS.HAS_EMPLOYEE_CARD_FEED_ERRORS);
        });
    });

    describe('info statuses', () => {
        beforeEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });

        it('returns HAS_LOGIN_LIST_INFO when login list has unvalidated contact', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.LOGIN_LIST]: {
                        [userID]: {
                            partnerName: 'John Doe',
                            partnerUserID: userID,
                            validatedDate: new Date().toISOString(),
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'otheruser@expensify.com': {
                            partnerName: 'Other User',
                            partnerUserID: 'different@expensify.com',
                            validatedDate: undefined,
                        },
                    },
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.infoStatus).toBe(CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO);
        });

        it('returns HAS_PENDING_CARD_INFO when card has pending action', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.LOGIN_LIST]: {},
                    [ONYXKEYS.CARD_LIST]: {
                        card1: {
                            cardID: 'card1',
                            bank: CONST.EXPENSIFY_CARD.BANK,
                            nameValuePairs: {isVirtual: false},
                            state: CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED,
                        },
                    },
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.infoStatus).toBe(CONST.INDICATOR_STATUS.HAS_PENDING_CARD_INFO);
        });

        it('returns HAS_SUBSCRIPTION_INFO when retry billing was successful', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.LOGIN_LIST]: {},
                    [ONYXKEYS.CARD_LIST]: {},
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                    [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL]: true,
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.infoStatus).toBe(CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO);
        });

        it('returns HAS_PARTIALLY_SETUP_BANK_ACCOUNT_INFO when bank account is partially setup', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.LOGIN_LIST]: {},
                    [ONYXKEYS.CARD_LIST]: {},
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                    [ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL]: false,
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        12345: {
                            methodID: 12345,
                            accountData: {state: CONST.BANK_ACCOUNT.STATE.SETUP},
                        },
                    },
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.infoStatus).toBe(CONST.INDICATOR_STATUS.HAS_PARTIALLY_SETUP_BANK_ACCOUNT_INFO);
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
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns undefined for both statuses', async () => {
            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBeUndefined();
            expect(result.current.infoStatus).toBeUndefined();
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
            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBeUndefined();
            expect(result.current.infoStatus).toBeUndefined();
        });
    });

    describe('error takes priority over info', () => {
        it('returns both accountStatus and infoStatus independently', async () => {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.USER_WALLET]: {
                        bankAccountID: 12345,
                        errors: {error: 'Wallet error'},
                    },
                    [ONYXKEYS.LOGIN_LIST]: {
                        [userID]: {
                            partnerName: 'John Doe',
                            partnerUserID: userID,
                            validatedDate: new Date().toISOString(),
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'otheruser@expensify.com': {
                            partnerName: 'Other User',
                            partnerUserID: 'different@expensify.com',
                            validatedDate: undefined,
                        },
                    },
                    [ONYXKEYS.BANK_ACCOUNT_LIST]: {},
                    [ONYXKEYS.WALLET_TERMS]: {},
                    [ONYXKEYS.REIMBURSEMENT_ACCOUNT]: {},
                    [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {},
                    [ONYXKEYS.CARD_LIST]: {},
                    [ONYXKEYS.SESSION]: {email: userID},
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });

            const {result} = renderHook(() => useAccountIndicatorChecks());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.accountStatus).toBe(CONST.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS);
            expect(result.current.infoStatus).toBe(CONST.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO);
        });
    });
});
