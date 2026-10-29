import {read, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';

import {
    addPersonalBankAccount,
    connectBankAccountManually,
    connectBankAccountWithPlaid,
    createCollectOnlyDepositAccount,
    deletePaymentBankAccount,
    getCorpayOnboardingFields,
    resendFailedValidationAmounts,
} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LastPaymentMethod, PersonalBankAccount} from '@src/types/onyx';
import type PlaidBankAccount from '@src/types/onyx/PlaidBankAccount';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');

const mockWrite = jest.mocked(write);
const mockRead = jest.mocked(read);

const policyID = 'policy123';

const selectedPlaidBankAccount: PlaidBankAccount = {
    accountNumber: '123456789',
    plaidAccountID: 'plaid-account-id',
    routingNumber: '021000021',
    mask: '6789',
    plaidAccessToken: 'plaid-access-token',
    bankName: 'Test Bank',
    isSavings: false,
};

describe('BankAccounts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('connectBankAccountWithPlaid', () => {
        test('sends DEFAULT_NUMBER_ID when bankAccountID is NaN', () => {
            // Given NaN for bankAccountID from the VBBA flow (e.g. undefined achData.bankAccountID)
            // When connecting with Plaid
            connectBankAccountWithPlaid(Number.NaN, selectedPlaidBankAccount, policyID);

            // Then the API payload must not contain NaN
            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, expect.objectContaining({bankAccountID: CONST.DEFAULT_NUMBER_ID}), expect.anything());
        });

        test('passes through finite bankAccountID unchanged', () => {
            const existingID = 4242;
            connectBankAccountWithPlaid(existingID, selectedPlaidBankAccount, policyID);

            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, expect.objectContaining({bankAccountID: existingID}), expect.anything());
        });
    });

    describe('connectBankAccountManually', () => {
        test('sends DEFAULT_NUMBER_ID when bankAccountID is NaN', () => {
            connectBankAccountManually(Number.NaN, selectedPlaidBankAccount, policyID);

            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_MANUALLY, expect.objectContaining({bankAccountID: CONST.DEFAULT_NUMBER_ID}), expect.anything());
        });

        test('passes through finite bankAccountID unchanged', () => {
            const existingID = 99;
            connectBankAccountManually(existingID, selectedPlaidBankAccount, policyID);

            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_MANUALLY, expect.objectContaining({bankAccountID: existingID}), expect.anything());
        });
    });

    describe('addPersonalBankAccount', () => {
        afterEach(async () => {
            await Onyx.clear();
        });

        test('sends the magic code so the backend can verify changes to private personal details', () => {
            // Given a magic code entered because the bank account flow changes the user's private personal details
            // When the bank account is added with it
            addPersonalBankAccount({phoneNumber: '+14155550199'}, undefined, {validateCode: '123456'});

            // Then the request carries the magic code alongside the personal details
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT,
                expect.objectContaining({phoneNumber: '+14155550199', validateCode: '123456'}),
                expect.anything(),
            );
        });

        test('keeps the server error message on top of the generic fallback when the device clock is ahead of the server', async () => {
            // Given a VerificationError response that already merged its specific message onto PERSONAL_BANK_ACCOUNT,
            // keyed by the server's own microsecond clock
            const serverMessage = 'Unable to verify bank account ownership. Please chat with Concierge for further assistance.';
            const serverErrorKey = 1700000000000000;
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: {[serverErrorKey]: serverMessage}});
            await waitForBatchedUpdates();

            // When the device clock reads far ahead of the server's at the moment addPersonalBankAccount stamps its
            // failureData, and that failureData is applied as it would be after the request fails
            jest.spyOn(DateUtils, 'getMicroseconds').mockReturnValue(serverErrorKey + 1_000_000_000);
            addPersonalBankAccount({}, undefined);
            const [, , onyxData] = mockWrite.mock.calls.at(-1) ?? [];
            const personalBankAccountFailure = onyxData?.failureData?.find((update) => update.key === ONYXKEYS.PERSONAL_BANK_ACCOUNT);
            if (!personalBankAccountFailure?.value) {
                throw new Error('addPersonalBankAccount did not write failureData for PERSONAL_BANK_ACCOUNT');
            }
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, personalBankAccountFailure.value);
            await waitForBatchedUpdates();

            // Then the server's specific message still wins over the generic fallback
            const personalBankAccount = await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
            expect(getLatestErrorMessage(personalBankAccount)).toBe(serverMessage);
        });

        test('sends both address lines as separate params', () => {
            // Given an account with a second address line, which the API rejects when joined into addressStreet with a newline
            const account = {addressStreet: '123 Main St', addressStreet2: 'Apt 4B'};

            // When adding the personal bank account
            addPersonalBankAccount(account, undefined);

            // Then each line is sent in its own param so the backend can store both
            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT,
                expect.objectContaining({addressStreet: '123 Main St', addressStreet2: 'Apt 4B'}),
                expect.anything(),
            );
        });

        test('sends an empty second address line when addressStreet2 is missing', () => {
            // Given an account without a second address line
            const account = {addressStreet: '123 Main St'};

            // When adding the personal bank account
            addPersonalBankAccount(account, undefined);

            // Then the second line is sent as an empty string, matching updatePersonalBankAccountInfo
            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT, expect.objectContaining({addressStreet: '123 Main St', addressStreet2: ''}), expect.anything());
        });
    });

    describe('createCollectOnlyDepositAccount', () => {
        afterEach(async () => {
            jest.restoreAllMocks();
            await Onyx.clear();
        });

        test('keeps the server error message on top of the generic fallback when the device clock is ahead of the server', async () => {
            // Given a bank verification response that already merged its specific message onto PERSONAL_BANK_ACCOUNT,
            // keyed by the server's own microsecond clock
            const serverMessage = 'Please review your account number and routing number one more time before continuing.';
            const serverErrorKey = 1700000000000000;
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: {[serverErrorKey]: serverMessage}});
            await waitForBatchedUpdates();

            // When the device clock reads far ahead of the server's at the moment createCollectOnlyDepositAccount stamps
            // its failureData, and that failureData is applied as it would be after the request fails
            jest.spyOn(DateUtils, 'getMicroseconds').mockReturnValue(serverErrorKey + 1_000_000_000);
            createCollectOnlyDepositAccount({
                routingNumber: selectedPlaidBankAccount.routingNumber,
                accountNumber: selectedPlaidBankAccount.accountNumber,
                additionalData: '{}',
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
                confirm: false,
            });
            const [, , onyxData] = mockWrite.mock.calls.at(-1) ?? [];
            const personalBankAccountFailure = onyxData?.failureData?.find((update) => update.key === ONYXKEYS.PERSONAL_BANK_ACCOUNT);
            if (!personalBankAccountFailure?.value) {
                throw new Error('createCollectOnlyDepositAccount did not write failureData for PERSONAL_BANK_ACCOUNT');
            }
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, personalBankAccountFailure.value);
            await waitForBatchedUpdates();

            // Then the server's specific message still wins over the generic fallback
            const personalBankAccount = await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
            expect(getLatestErrorMessage(personalBankAccount)).toBe(serverMessage);
        });
    });

    describe('deletePaymentBankAccount', () => {
        const deletedBankAccountID = 123;
        const replacementBankAccountID = 456;
        const deletionErrorTimestamp = 1705320000000000;

        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        beforeEach(async () => {
            jest.spyOn(DateUtils, 'getMicroseconds').mockReturnValue(deletionErrorTimestamp);
            await Onyx.clear();
            await waitForBatchedUpdates();
        });

        afterEach(async () => {
            jest.restoreAllMocks();
            await Onyx.clear();
            await waitForBatchedUpdates();
        });

        it.each(['success', 'failure'])('preserves replacement defaults, batch order and last-payment fields on %s', async (outcome) => {
            // Given a default bank, a replacement and distinct personal/workspace payment choices.
            const bankAccount: PersonalBankAccount = {bankAccountID: deletedBankAccountID};
            const lastUsedPaymentMethods: LastPaymentMethod = {
                [policyID]: {
                    iou: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY, bankAccountID: deletedBankAccountID},
                    expense: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                    lastUsed: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                    invoice: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                },
                workspace: {
                    iou: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                    expense: {name: CONST.IOU.PAYMENT_TYPE.VBBA, bankAccountID: deletedBankAccountID},
                    lastUsed: {name: CONST.IOU.PAYMENT_TYPE.VBBA, bankAccountID: deletedBankAccountID},
                    invoice: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                },
                legacy: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            };
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[deletedBankAccountID]: {isDefault: true}, [replacementBankAccountID]: {isDefault: false}});
            await Onyx.set(ONYXKEYS.USER_WALLET, {
                walletLinkedAccountID: deletedBankAccountID,
                walletLinkedAccountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                errors: {server: 'keep this error'},
            });
            await Onyx.set(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, lastUsedPaymentMethods);
            await waitForBatchedUpdates();

            // When the real deletion action constructs its API batches.
            deletePaymentBankAccount(deletedBankAccountID, policyID, lastUsedPaymentMethods, bankAccount, replacementBankAccountID);

            // Then every batch retains its order, legacy skip, null removals and original field choices.
            expect(mockWrite).toHaveBeenCalledTimes(1);
            const call = mockWrite.mock.calls.at(0);
            if (!call) {
                throw new Error('Expected the bank deletion request');
            }
            const [command, parameters, onyxData] = call;
            expect(command).toBe(WRITE_COMMANDS.DELETE_PAYMENT_BANK_ACCOUNT);
            expect(parameters).toStrictEqual({bankAccountID: deletedBankAccountID});
            expect(onyxData?.optimisticData).toStrictEqual([
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.BANK_ACCOUNT_LIST, value: {[deletedBankAccountID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}}},
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.USER_WALLET,
                    value: {walletLinkedAccountID: replacementBankAccountID, walletLinkedAccountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT, errors: null},
                },
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.BANK_ACCOUNT_LIST, value: {[replacementBankAccountID]: {isDefault: true}}},
            ]);
            expect(onyxData?.successData).toStrictEqual([
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.BANK_ACCOUNT_LIST, value: {[deletedBankAccountID]: null}},
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
                    value: {[policyID]: {iou: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, bankAccountID: null}}},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
                    value: {workspace: {expense: {name: null, bankAccountID: null}, lastUsed: {name: null, bankAccountID: null}}},
                },
            ]);
            expect(onyxData?.failureData).toStrictEqual([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.BANK_ACCOUNT_LIST,
                    value: {[deletedBankAccountID]: {...bankAccount, errors: {[deletionErrorTimestamp]: translateLocal('bankAccount.error.deletePaymentBankAccount')}, pendingAction: null}},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.USER_WALLET,
                    value: {walletLinkedAccountID: deletedBankAccountID, walletLinkedAccountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT},
                },
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.BANK_ACCOUNT_LIST, value: {[replacementBankAccountID]: {isDefault: false}}},
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
                    value: {
                        [policyID]: {
                            expense: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY, bankAccountID: deletedBankAccountID},
                            lastUsed: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, bankAccountID: undefined},
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
                    value: {
                        workspace: {
                            expense: {name: CONST.IOU.PAYMENT_TYPE.VBBA, bankAccountID: deletedBankAccountID},
                            lastUsed: {name: CONST.IOU.PAYMENT_TYPE.VBBA, bankAccountID: deletedBankAccountID},
                        },
                    },
                },
            ]);
            if (!onyxData?.optimisticData || !onyxData.successData || !onyxData.failureData) {
                throw new Error('Expected all bank deletion batches');
            }
            await Onyx.update(onyxData.optimisticData);
            await waitForBatchedUpdates();
            const optimisticAccounts = await getOnyxValue(ONYXKEYS.BANK_ACCOUNT_LIST);
            expect(optimisticAccounts?.[deletedBankAccountID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            expect(optimisticAccounts?.[replacementBankAccountID]?.isDefault).toBe(true);
            expect(await getOnyxValue(ONYXKEYS.USER_WALLET)).toMatchObject({walletLinkedAccountID: replacementBankAccountID});

            await Onyx.merge(ONYXKEYS.USER_WALLET, {errors: {server: 'keep this error'}});
            await Onyx.update(outcome === 'success' ? onyxData.successData : onyxData.failureData);
            await waitForBatchedUpdates();
            const accounts = await getOnyxValue(ONYXKEYS.BANK_ACCOUNT_LIST);
            const wallet = await getOnyxValue(ONYXKEYS.USER_WALLET);
            const lastPayment = await getOnyxValue(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
            expect(lastPayment?.legacy).toBe(CONST.IOU.PAYMENT_TYPE.EXPENSIFY);
            expect(wallet?.errors).toStrictEqual({server: 'keep this error'});
            if (outcome === 'success') {
                expect(accounts).not.toHaveProperty(String(deletedBankAccountID));
                expect(accounts?.[replacementBankAccountID]?.isDefault).toBe(true);
                expect(wallet?.walletLinkedAccountID).toBe(replacementBankAccountID);
                expect(lastPayment?.[policyID]).toStrictEqual({
                    iou: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                    expense: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                    lastUsed: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                    invoice: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                });
                expect(lastPayment?.workspace).toStrictEqual({
                    iou: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                    expense: {},
                    lastUsed: {},
                    invoice: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                });
            } else {
                expect(accounts?.[deletedBankAccountID]).toMatchObject({bankAccountID: deletedBankAccountID, isDefault: true});
                expect(accounts?.[deletedBankAccountID]?.errors).toBeTruthy();
                expect(accounts?.[deletedBankAccountID]).not.toHaveProperty('pendingAction');
                expect(accounts?.[replacementBankAccountID]?.isDefault).toBe(false);
                expect(wallet?.walletLinkedAccountID).toBe(deletedBankAccountID);
                expect(lastPayment?.[policyID]).toStrictEqual({
                    iou: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY, bankAccountID: deletedBankAccountID},
                    expense: {name: CONST.IOU.PAYMENT_TYPE.EXPENSIFY, bankAccountID: deletedBankAccountID},
                    lastUsed: {name: CONST.IOU.PAYMENT_TYPE.ELSEWHERE},
                    invoice: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                });
                expect(lastPayment?.workspace).toStrictEqual(lastUsedPaymentMethods.workspace);
            }
        });

        it.each([undefined, 0])('omits replacement and last-payment updates for missing input with replacement %s', async (newBankAccountID) => {
            // Given no last-payment data and no truthy replacement bank ID.
            // When the bank deletion action creates its batches.
            deletePaymentBankAccount(deletedBankAccountID, undefined, undefined, undefined, newBankAccountID);

            // Then no wallet or last-payment update is added and success still removes the bank.
            const call = mockWrite.mock.calls.at(0);
            if (!call) {
                throw new Error('Expected the bank deletion request without replacement');
            }
            const onyxData = call[2];
            expect(onyxData?.optimisticData).toStrictEqual([
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.BANK_ACCOUNT_LIST, value: {[deletedBankAccountID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}}},
            ]);
            expect(onyxData?.successData).toStrictEqual([{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.BANK_ACCOUNT_LIST, value: {[deletedBankAccountID]: null}}]);
            expect(onyxData?.failureData).toStrictEqual([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.BANK_ACCOUNT_LIST,
                    value: {[deletedBankAccountID]: {errors: {[deletionErrorTimestamp]: translateLocal('bankAccount.error.deletePaymentBankAccount')}, pendingAction: null}},
                },
            ]);
            if (!onyxData?.optimisticData || !onyxData.successData) {
                throw new Error('Expected the bank-only deletion batches');
            }
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[deletedBankAccountID]: {isDefault: true}});
            await Onyx.update(onyxData.optimisticData);
            await Onyx.update(onyxData.successData);
            await waitForBatchedUpdates();
            expect(await getOnyxValue(ONYXKEYS.BANK_ACCOUNT_LIST)).not.toHaveProperty(String(deletedBankAccountID));
        });
    });

    describe('getCorpayOnboardingFields', () => {
        test('does not call the API when country is empty', () => {
            // Given an empty country (e.g. Onyx not hydrated yet)
            // When fetching the Corpay onboarding fields
            getCorpayOnboardingFields('');

            // Then no request is sent, so the backend never returns 402 Missing countryISO
            expect(mockRead).not.toHaveBeenCalled();
        });

        test('calls GET_CORPAY_ONBOARDING_FIELDS with the country when one is provided', () => {
            // Given a valid selected country
            // When fetching the Corpay onboarding fields
            getCorpayOnboardingFields(CONST.COUNTRY.GB);

            // Then the request is sent with the correct countryISO
            expect(mockRead).toHaveBeenCalledWith(READ_COMMANDS.GET_CORPAY_ONBOARDING_FIELDS, {countryISO: CONST.COUNTRY.GB});
        });
    });

    describe('resendFailedValidationAmounts', () => {
        const bankAccountID = 5555;

        test('sends the ResendFailedValidationAmounts write command with the bankAccountID', () => {
            resendFailedValidationAmounts(bankAccountID);

            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.RESEND_FAILED_VALIDATION_AMOUNTS, {bankAccountID}, expect.anything());
        });

        test('optimistically marks accountData as pending and clears errors', () => {
            resendFailedValidationAmounts(bankAccountID);

            const [, , onyxData] = mockWrite.mock.calls.at(-1) ?? [];
            expect(onyxData?.optimisticData).toEqual([
                expect.objectContaining({
                    key: ONYXKEYS.BANK_ACCOUNT_LIST,
                    value: {
                        [bankAccountID]: {
                            pendingFields: {accountData: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errors: null,
                        },
                    },
                }),
            ]);
        });

        test('successData clears the pending marker, sets state to PENDING, and clears lastNocCode + errors', () => {
            resendFailedValidationAmounts(bankAccountID);

            const [, , onyxData] = mockWrite.mock.calls.at(-1) ?? [];
            expect(onyxData?.successData).toEqual([
                expect.objectContaining({
                    key: ONYXKEYS.BANK_ACCOUNT_LIST,
                    value: {
                        [bankAccountID]: {
                            pendingFields: {accountData: null},
                            accountData: {
                                state: CONST.BANK_ACCOUNT.STATE.PENDING,
                                additionalData: {lastNocCode: null},
                            },
                            errors: null,
                        },
                    },
                }),
            ]);
        });

        test('failureData clears the pending marker and surfaces a generic error message', () => {
            resendFailedValidationAmounts(bankAccountID);

            expect(mockWrite).toHaveBeenLastCalledWith(
                WRITE_COMMANDS.RESEND_FAILED_VALIDATION_AMOUNTS,
                {bankAccountID},
                expect.objectContaining({
                    failureData: [
                        expect.objectContaining({
                            key: ONYXKEYS.BANK_ACCOUNT_LIST,
                            value: expect.objectContaining({
                                [bankAccountID]: expect.objectContaining({
                                    pendingFields: {accountData: null},
                                }),
                            }),
                        }),
                    ],
                }),
            );

            // Runtime check that the failure patch also carries an errors object (typed matcher would trigger no-unsafe-assignment).
            const failureValue = mockWrite.mock.calls.at(-1)?.[2]?.failureData?.at(0)?.value;
            expect(JSON.stringify(failureValue)).toContain('"errors":');
        });
    });
});
