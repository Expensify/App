import {
    clearPersonalBankAccount,
    connectBankAccountWithPlaid,
    createWiseBankAccount,
    enableGlobalReimbursementsForUSDBankAccount,
    getWiseBankAccountFields,
    initiateBankAccountUnlock,
    openPersonalBankAccountSetupView,
    updateBankAccountName,
} from '@libs/actions/BankAccounts';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import type PlaidBankAccount from '@src/types/onyx/PlaidBankAccount';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => 'settings/wallet'),
}));

const POLICY_ID = 'policyID123';

function getPlaidBankAccount(bankName: string): PlaidBankAccount {
    return {
        accountNumber: '111122223333',
        routingNumber: '123456789',
        bankName,
        plaidAccountID: 'plaidAccountID123',
        plaidAccessToken: 'plaidAccessToken123',
        mask: '3333',
        isSavings: false,
    };
}

describe('actions/BankAccounts', () => {
    let mockFetch: MockFetch;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            // Registered as the app does, so the Wise form tests see it only in memory
            ramOnlyKeys: [ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS],
        });
    });

    beforeEach(() => {
        mockFetch = TestHelper.createGlobalFetchMock();
        global.fetch = mockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        mockFetch?.resume?.();
    });

    describe('connectBankAccountWithPlaid', () => {
        test('short-circuits new Chase accounts to manual flow and clears account/routing draft fields', async () => {
            // Given a new reimbursement account in Plaid setup with existing draft values
            await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
                achData: {
                    currentStep: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
                    subStep: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                },
            });
            await Onyx.set(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {
                accountNumber: '111122223333',
                routingNumber: '123456789',
                plaidAccountID: 'plaidAccountID123',
                plaidAccessToken: 'plaidAccessToken123',
                mask: '3333',
            } as Partial<ReimbursementAccountForm>);

            // When we connect with Plaid for Chase on a new account
            const didStartRequest = connectBankAccountWithPlaid(CONST.DEFAULT_NUMBER_ID, getPlaidBankAccount(CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.CHASE]), POLICY_ID);
            await waitForBatchedUpdates();

            // Then we should not call the backend, and should move user to manual with cleared account/routing draft fields
            const reimbursementAccount = await getOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
            const reimbursementAccountDraft = await getOnyxValue(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

            // ...and report that no request was started, so the caller does not arm deferred navigation
            expect(didStartRequest).toBe(false);
            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, 0);
            expect(reimbursementAccount?.achData?.currentStep).toBe(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
            expect(reimbursementAccount?.achData?.subStep).toBe(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
            expect(reimbursementAccount?.errors ?? null).toBeNull();
            expect(reimbursementAccountDraft?.accountNumber).toBe('');
            expect(reimbursementAccountDraft?.routingNumber).toBe('');
            expect(reimbursementAccountDraft?.plaidAccountID).toBe('plaidAccountID123');
            expect(reimbursementAccountDraft?.plaidAccessToken).toBe('plaidAccessToken123');
            expect(reimbursementAccountDraft?.mask).toBe('3333');
        });

        test('does not short-circuit Chase flow when bankAccountID is non-zero', () => {
            // Given an existing Chase bank account
            const bankAccountID = 123;
            const selectedPlaidBankAccount = getPlaidBankAccount(CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.CHASE]);

            // When we connect with Plaid
            const didStartRequest = connectBankAccountWithPlaid(bankAccountID, selectedPlaidBankAccount, POLICY_ID);
            return waitForBatchedUpdates().then(() => {
                // Then we should call the existing API command and report that a request was started
                expect(didStartRequest).toBe(true);
                TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, 1);
                const call = TestHelper.getFetchMockCalls(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID).at(0);
                if (!call) {
                    throw new Error('Expected ConnectBankAccountWithPlaid fetch call');
                }

                const [, options] = call;
                const body = options?.body;
                if (!(body instanceof FormData)) {
                    throw new Error('Expected ConnectBankAccountWithPlaid request body to be FormData');
                }

                expect(Object.fromEntries(body)).toEqual(
                    expect.objectContaining({
                        bankAccountID: `${bankAccountID}`,
                        routingNumber: selectedPlaidBankAccount.routingNumber,
                        accountNumber: selectedPlaidBankAccount.accountNumber,
                        bank: selectedPlaidBankAccount.bankName,
                        plaidAccountID: selectedPlaidBankAccount.plaidAccountID,
                        plaidAccessToken: selectedPlaidBankAccount.plaidAccessToken,
                        plaidMask: selectedPlaidBankAccount.mask,
                        isSavings: `${selectedPlaidBankAccount.isSavings}`,
                        policyID: POLICY_ID,
                    }),
                );
            });
        });

        test('does not short-circuit a new account when the bank is not Chase', async () => {
            // Given a new (bankAccountID 0) non-Chase bank account in Plaid setup
            await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
                achData: {
                    currentStep: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
                    subStep: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                },
            });

            // When we connect with Plaid
            const didStartRequest = connectBankAccountWithPlaid(CONST.DEFAULT_NUMBER_ID, getPlaidBankAccount('Wells Fargo'), POLICY_ID);
            await waitForBatchedUpdates();

            // Then we should call the API, report that a request was started, and stay in the Plaid sub step
            expect(didStartRequest).toBe(true);
            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, 1);

            const reimbursementAccount = await getOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
            expect(reimbursementAccount?.achData?.subStep).toBe(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID);
        });
    });

    describe('openPersonalBankAccountSetupView', () => {
        test('clears existing PERSONAL_BANK_ACCOUNT data when called with no parameters', async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS,
                exitReportID: '123',
                bankAccountID: 456,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID});

            openPersonalBankAccountSetupView({});
            await waitForBatchedUpdates();

            const personalBankAccount = await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
            const formDraft = await getOnyxValue(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);

            expect(personalBankAccount).toBeFalsy();
            expect(formDraft?.setupType).not.toBe(CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID);
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute('settings/wallet'));
        });

        test('replaces existing data with only the fields passed to the function', async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                onSuccessFallbackRoute: ROUTES.SETTINGS_WALLET,
                bankAccountID: 789,
            });

            openPersonalBankAccountSetupView({
                onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS,
                exitReportID: '999',
            });
            await waitForBatchedUpdates();

            const personalBankAccount = await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT);

            expect(personalBankAccount).toEqual({
                onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS,
                exitReportID: '999',
            });
        });

        test('navigates to the US bank account flow when shouldSetUpUSBankAccount is true', async () => {
            openPersonalBankAccountSetupView({shouldSetUpUSBankAccount: true});
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.ADD_US_BANK_ACCOUNT.getRoute()));
        });

        test('carries shouldSetUpUSBankAccount to the verify account page when the user is not validated', async () => {
            openPersonalBankAccountSetupView({shouldSetUpUSBankAccount: true, isUserValidated: false});
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT.getRoute(true, true)));
            expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining('shouldSetUpUSBankAccount=true'));
        });
    });

    describe('clearPersonalBankAccount', () => {
        test('clears all PERSONAL_BANK_ACCOUNT data when called with no preserved data', async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS,
                exitReportID: '123',
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL});

            clearPersonalBankAccount();
            await waitForBatchedUpdates();

            const personalBankAccount = await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
            const formDraft = await getOnyxValue(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);

            expect(personalBankAccount).toBeFalsy();
            expect(formDraft?.setupType).not.toBe(CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL);
        });

        test('preserves only the fields passed in preservedData', async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS,
                exitReportID: '123',
                bankAccountID: 456,
            });

            clearPersonalBankAccount({onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS});
            await waitForBatchedUpdates();

            const personalBankAccount = await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT);

            expect(personalBankAccount).toEqual({onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS});
        });
    });

    describe('updateBankAccountName', () => {
        const bankAccountID = 1234;
        const oldName = 'Chase Checking';
        const newName = 'Payroll account';

        beforeEach(async () => {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {
                    title: oldName,
                    methodID: bankAccountID,
                    bankCurrency: CONST.CURRENCY.USD,
                    bankCountry: CONST.COUNTRY.US,
                    accountData: {bankAccountID, addressName: oldName, state: CONST.BANK_ACCOUNT.STATE.OPEN},
                },
            });
        });

        test('optimistically renames the bank account and sends UpdateBankAccount with the new addressName', async () => {
            // Given the request is held so the optimistic state can be observed
            mockFetch.pause?.();

            // When the bank account is renamed
            updateBankAccountName(bankAccountID, newName, oldName);
            await waitForBatchedUpdates();

            // Then both the Wallet row title and addressName show the new name while the update is pending
            let bankAccountList = await getOnyxValue(ONYXKEYS.BANK_ACCOUNT_LIST);
            expect(bankAccountList?.[bankAccountID]?.title).toBe(newName);
            expect(bankAccountList?.[bankAccountID]?.accountData?.addressName).toBe(newName);
            expect(bankAccountList?.[bankAccountID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            // And the backend receives the bank account ID with the new name as addressName
            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.UPDATE_BANK_ACCOUNT, 1);
            const body = TestHelper.getFetchMockCalls(WRITE_COMMANDS.UPDATE_BANK_ACCOUNT).at(0)?.[1]?.body;
            expect(body instanceof FormData ? Object.fromEntries(body) : {}).toEqual(expect.objectContaining({bankAccountID: `${bankAccountID}`, addressName: newName}));

            // When the request succeeds
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            // Then the new name is kept and the pending state is cleared
            bankAccountList = await getOnyxValue(ONYXKEYS.BANK_ACCOUNT_LIST);
            expect(bankAccountList?.[bankAccountID]?.title).toBe(newName);
            expect(bankAccountList?.[bankAccountID]?.pendingAction).toBeFalsy();
            expect(bankAccountList?.[bankAccountID]?.errors).toBeFalsy();
        });

        test('restores the previous name and shows an error when the request fails', async () => {
            // Given the backend rejects the rename
            mockFetch.fail?.();

            // When the bank account is renamed
            updateBankAccountName(bankAccountID, newName, oldName);
            await waitForBatchedUpdates();

            // Then the previous name is restored so the Wallet does not show a name the backend never saved
            const bankAccountList = await getOnyxValue(ONYXKEYS.BANK_ACCOUNT_LIST);
            expect(bankAccountList?.[bankAccountID]?.title).toBe(oldName);
            expect(bankAccountList?.[bankAccountID]?.accountData?.addressName).toBe(oldName);
            expect(bankAccountList?.[bankAccountID]?.pendingAction).toBeFalsy();
            expect(bankAccountList?.[bankAccountID]?.errors).toBeTruthy();
        });

        test('clears the optimistic name when the request fails and there was no previous name', async () => {
            // Given a bank account with no title, so there is no previous name to restore
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {
                    methodID: bankAccountID,
                    accountData: {bankAccountID, state: CONST.BANK_ACCOUNT.STATE.OPEN},
                },
            });
            mockFetch.fail?.();

            // When the bank account is renamed and the backend rejects it
            updateBankAccountName(bankAccountID, newName, undefined);
            await waitForBatchedUpdates();

            // Then the optimistic name is removed, because Onyx merge would ignore an undefined rollback value
            const bankAccountList = await getOnyxValue(ONYXKEYS.BANK_ACCOUNT_LIST);
            expect(bankAccountList?.[bankAccountID]?.title).toBeUndefined();
            expect(bankAccountList?.[bankAccountID]?.accountData?.addressName).toBeUndefined();
            expect(bankAccountList?.[bankAccountID]?.errors).toBeTruthy();
        });
    });

    describe('enableGlobalReimbursementsForUSDBankAccount', () => {
        test('clears the form draft after success so the next bank account does not reuse its values', async () => {
            // Given a draft filled in while enabling Global Reimbursement for the first bank account
            await Onyx.set(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT, {
                businessRegistrationIncorporationNumber: '123456789',
                natureOfBusiness: 'retail',
            });

            // When the request succeeds
            enableGlobalReimbursementsForUSDBankAccount({inputs: '{}', bankAccountID: 1234});
            await waitForBatchedUpdates();

            // Then the draft is cleared and the form reports success
            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ENABLE_GLOBAL_REIMBURSEMENTS_FOR_USD_BANK_ACCOUNT, 1);
            expect(await getOnyxValue(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT)).toBeUndefined();
            const form = await getOnyxValue(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS);
            expect(form?.isSuccess).toBe(true);
        });

        test('keeps the form draft when the request fails so the user can retry', async () => {
            // Given a draft filled in for a bank account
            await Onyx.set(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT, {
                businessRegistrationIncorporationNumber: '123456789',
            });
            mockFetch.fail?.();

            // When the request fails
            enableGlobalReimbursementsForUSDBankAccount({inputs: '{}', bankAccountID: 1234});
            await waitForBatchedUpdates();

            // Then the draft is kept
            const draft = await getOnyxValue(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT);
            expect(draft?.businessRegistrationIncorporationNumber).toBe('123456789');
        });
    });

    describe('initiateBankAccountUnlock', () => {
        test('clears both pendingAction and isOptimisticAction on the Concierge unlock message after success', async () => {
            // Given an optimistic Concierge unlock message, as written when the user presses a locked bank account
            const conciergeReportID = '98765';
            const optimisticReportActionID = '12345';
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${conciergeReportID}`, {
                [optimisticReportActionID]: {
                    reportActionID: optimisticReportActionID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    created: '2026-01-01 00:00:00.000',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    isOptimisticAction: true,
                },
            });

            // When the unlock request succeeds
            initiateBankAccountUnlock(123, conciergeReportID, optimisticReportActionID);
            await waitForBatchedUpdates();

            // Then the message is no longer optimistic, so it is not dimmed on later offline transitions
            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.INITIATE_BANK_ACCOUNT_UNLOCK, 1);
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${conciergeReportID}`);
            const reportAction = reportActions?.[optimisticReportActionID];
            expect(reportAction?.pendingAction).toBeFalsy();
            expect(reportAction?.isOptimisticAction).toBeFalsy();
        });
    });

    describe('getWiseBankAccountFields', () => {
        test('sends the answers only when there are some, so the first fetch asks for the default form', async () => {
            // Given the server answers with the fields it got the request for
            const requests: Array<Record<string, unknown>> = [];
            mockFetch.mockAPICommand(READ_COMMANDS.GET_WISE_BANK_ACCOUNT_FIELDS, (params) => {
                requests.push({...params});
                return {onyxData: []};
            });

            // When the form is fetched for a country, then again after the user changed the currency
            getWiseBankAccountFields('GB');
            await waitForBatchedUpdates();
            getWiseBankAccountFields('GB', 'USD', {currency: 'USD'});
            await waitForBatchedUpdates();

            // Then the first request carries no inputs and the second one carries them as JSON
            expect(requests.at(0)).toEqual(expect.objectContaining({country: 'GB'}));
            expect(requests.at(0)).not.toHaveProperty('inputs');
            expect(requests.at(1)).toEqual(expect.objectContaining({country: 'GB', currency: 'USD', inputs: JSON.stringify({currency: 'USD'})}));
        });

        test('shows an error and stops loading when the fetch fails', async () => {
            // Given the server rejects the request
            mockFetch.fail?.();

            // When the form is fetched
            getWiseBankAccountFields('GB');
            await waitForBatchedUpdates();

            // Then the screen can leave its loader and show why
            const fields = await getOnyxValue(ONYXKEYS.RAM_ONLY_WISE_BANK_ACCOUNT_FIELDS);
            expect(fields?.isLoading).toBe(false);
            expect(Object.keys(fields?.errors ?? {})).toHaveLength(1);
        });
    });

    describe('createWiseBankAccount', () => {
        test('leaves out confirmVerificationOfPayee when the caller does not confirm it', async () => {
            // Given the server records what it got
            const requests: Array<Record<string, unknown>> = [];
            mockFetch.mockAPICommand(WRITE_COMMANDS.CREATE_WISE_BANK_ACCOUNT, (params) => {
                requests.push({...params});
                return {onyxData: []};
            });

            // When an account is created without a verification of payee confirmation
            createWiseBankAccount('GB', 'GBP', {sortCode: '403020', accountNumber: '12345678'});
            await waitForBatchedUpdates();

            // Then the flag is not sent at all, so the server does not read it as a confirmation, and the form reports success
            expect(requests.at(0)).toEqual(expect.objectContaining({country: 'GB', currency: 'GBP', inputs: JSON.stringify({sortCode: '403020', accountNumber: '12345678'})}));
            expect(requests.at(0)).not.toHaveProperty('confirmVerificationOfPayee');
            const form = await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
            expect(form?.isSuccess).toBe(true);
            expect(form?.isLoading).toBe(false);
        });

        test('sends confirmVerificationOfPayee only when the caller confirms it', async () => {
            // Given the server records what it got
            const requests: Array<Record<string, unknown>> = [];
            mockFetch.mockAPICommand(WRITE_COMMANDS.CREATE_WISE_BANK_ACCOUNT, (params) => {
                requests.push({...params});
                return {onyxData: []};
            });

            // When one account is created with an explicit false and another with a confirmation
            createWiseBankAccount('GB', 'GBP', {}, false);
            await waitForBatchedUpdates();
            createWiseBankAccount('GB', 'GBP', {}, true);
            await waitForBatchedUpdates();

            // Then false is left out, since the request would send it as the string "false", and the confirmation is sent
            expect(requests.at(0)).not.toHaveProperty('confirmVerificationOfPayee');
            expect(requests.at(1)).toEqual(expect.objectContaining({confirmVerificationOfPayee: 'true'}));
        });

        test('shows an error on the form when the request fails', async () => {
            // Given the server rejects the request
            mockFetch.fail?.();

            // When an account is created
            createWiseBankAccount('GB', 'GBP', {sortCode: '403020', accountNumber: '12345678'});
            await waitForBatchedUpdates();

            // Then the confirmation page has an error to show and its button stops loading
            const form = await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM);
            expect(form?.isLoading).toBe(false);
            expect(Object.keys(form?.errors ?? {})).toHaveLength(1);
        });
    });
});
