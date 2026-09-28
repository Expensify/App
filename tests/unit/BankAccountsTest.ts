import {read, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';

import {addPersonalBankAccount, connectBankAccountManually, connectBankAccountWithPlaid, getCorpayOnboardingFields} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type PlaidBankAccount from '@src/types/onyx/PlaidBankAccount';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
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
});
