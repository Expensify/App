import {read, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';

import {connectBankAccountManually, connectBankAccountWithPlaid, getCorpayOnboardingFields, resendFailedValidationAmounts} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type PlaidBankAccount from '@src/types/onyx/PlaidBankAccount';

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
