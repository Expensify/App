import {
    clearPersonalBankAccount,
    clearPersonalBankAccountPreservingEntryContext,
    connectBankAccountWithPlaid,
    createCorpayBankAccountForWalletFlow,
    fetchCorpayFields,
    openPersonalBankAccountSetupView,
    openWalletPersonalBankAccountSetup,
} from '@libs/actions/BankAccounts';
import {WRITE_COMMANDS} from '@libs/API/types';
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
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
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

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT.getRoute());
        });

        test('carries shouldSetUpUSBankAccount to the verify account page when the user is not validated', async () => {
            openPersonalBankAccountSetupView({shouldSetUpUSBankAccount: true, isUserValidated: false});
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT.getRoute(true, true)));
            expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining('shouldSetUpUSBankAccount=true'));
        });
    });

    describe('openWalletPersonalBankAccountSetup', () => {
        test('opens the base US route when resuming US progress so the page can validate the destination', async () => {
            // Given an unfinished manual US setup owned by Wallet
            const personalBankAccount = {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER,
            };
            const personalDraft = {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
                routingNumber: '123456789',
                accountNumber: '1234',
            };
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, personalBankAccount);
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, personalDraft);

            // When the Wallet setup is reopened
            openWalletPersonalBankAccountSetup({
                personalBankAccount,
                personalDraft,
                internationalDraft: undefined,
            });
            await waitForBatchedUpdates();

            // Then navigation waits for the resume marker and opens the base route for page validation
            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_US_BANK_ACCOUNT.getRoute());
            expect(await getOnyxValue(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT)).toEqual(personalDraft);
        });

        test('keeps the US resume path through verification and replaces stale entry metadata', async () => {
            // Given Plaid progress with stale context from another entry point
            const personalBankAccount = {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.ADDRESS,
                exitReportID: '123',
                policyID: 'policy-1',
                onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS,
            };
            const personalDraft = {setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID} as const;
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, personalBankAccount);

            // When an unvalidated user reopens the Wallet setup
            openWalletPersonalBankAccountSetup({
                personalBankAccount,
                personalDraft,
                internationalDraft: undefined,
                isUserValidated: false,
            });
            await waitForBatchedUpdates();

            // Then stale context is removed before navigation continues through verification
            expect(await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT)).toEqual({
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.ADDRESS,
            });
            expect(Navigation.navigate).toHaveBeenCalledTimes(1);
            expect(Navigation.navigate).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT.getRoute(true, true)));
        });

        test('starts a fresh flow when the completed setup was dismissed from the Success page', async () => {
            // Given completed US progress that should not be resumed
            const personalBankAccount = {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.CONFIRMATION,
                shouldShowSuccess: true,
            };
            const personalDraft = {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
                routingNumber: '123456789',
                accountNumber: '1234',
            };
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, personalBankAccount);
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, personalDraft);

            // When Add bank account is opened again
            openWalletPersonalBankAccountSetup({
                personalBankAccount,
                personalDraft,
                internationalDraft: undefined,
            });
            await waitForBatchedUpdates();

            // Then the completed draft is cleared and a fresh flow starts
            expect(await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT)).toEqual({source: CONST.BANK_ACCOUNT.SOURCE.WALLET});
            const clearedPersonalDraft = await getOnyxValue(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
            expect(clearedPersonalDraft).toBeFalsy();
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute('settings/wallet'));
        });

        test('preserves cached Corpay fields and an international Wallet draft until compatibility is checked', async () => {
            // Given unfinished international progress and cached fields from an incompatible Corpay request
            const personalBankAccount = {source: CONST.BANK_ACCOUNT.SOURCE.WALLET};
            const internationalDraft = {bankCountry: 'DE', bankCurrency: 'EUR', accountNumber: '12345678'};
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, personalBankAccount);
            await Onyx.set(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, internationalDraft);
            await Onyx.set(ONYXKEYS.CORPAY_FIELDS, {
                bankCountry: 'DE',
                bankCurrency: 'EUR',
                classification: 'business',
                destinationCountry: 'DE',
                paymentMethods: [],
                preferredMethod: '',
                formFields: [
                    {
                        id: 'businessAccountNumber',
                        errorMessage: '',
                        isRequired: true,
                        isRequiredInValueSet: false,
                        label: 'Business account number',
                        regEx: '',
                        validationRules: [],
                    },
                ],
                isLoading: false,
                isSuccess: true,
                isWithdrawal: true,
                isBusinessBankAccount: true,
            });

            // When the Wallet setup is reopened
            openWalletPersonalBankAccountSetup({personalBankAccount, personalDraft: undefined, internationalDraft});
            await waitForBatchedUpdates();

            // Then the destination can validate compatibility without losing either persisted value
            expect(await getOnyxValue(ONYXKEYS.CORPAY_FIELDS)).toEqual(expect.objectContaining({isWithdrawal: true, isBusinessBankAccount: true}));
            expect(await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT)).toEqual(internationalDraft);
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute('settings/wallet'));
        });

        test('starts a fresh flow when a completed international setup was dismissed from the Success page', async () => {
            // Given an international setup whose successful action cleared its draft
            const personalBankAccount = {source: CONST.BANK_ACCOUNT.SOURCE.WALLET};
            const internationalDraft = {bankCountry: 'DE', bankCurrency: 'EUR'};
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, personalBankAccount);
            await Onyx.set(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, internationalDraft);

            createCorpayBankAccountForWalletFlow(internationalDraft, '', 'DE', '');
            await waitForBatchedUpdates();

            const completedInternationalDraft = await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT);
            expect(completedInternationalDraft).toBeFalsy();

            // When Add bank account is opened again
            openWalletPersonalBankAccountSetup({
                personalBankAccount,
                personalDraft: undefined,
                internationalDraft: completedInternationalDraft,
            });
            await waitForBatchedUpdates();

            // Then it starts a fresh Wallet flow instead of resuming completed progress
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute('settings/wallet'));
        });

        test('preserves international values when Corpay fields are refreshed for resume', async () => {
            // Given an international draft containing user-entered bank details
            await Onyx.set(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, {
                bankCountry: 'GB',
                bankCurrency: 'GBP',
                accountNumber: '12345678',
            });

            // When Corpay fields are refreshed for resume
            fetchCorpayFields('GB', 'GBP', false, false, {preserveExistingDraft: true});
            await waitForBatchedUpdates();

            // Then the refresh keeps the existing user-entered values
            expect(await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT)).toEqual(
                expect.objectContaining({bankCountry: 'GB', bankCurrency: 'GBP', accountNumber: '12345678'}),
            );
        });

        test('exposes a retryable error and clears loading when refreshing Corpay fields fails', async () => {
            // Given saved international progress that must remain available for retry
            const internationalDraft = {
                bankCountry: 'DE',
                bankCurrency: 'EUR',
                accountNumber: '12345678',
            };
            await Onyx.set(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT, internationalDraft);
            mockFetch.fail?.();

            // When refreshing the matching personal Corpay fields fails
            fetchCorpayFields('DE', 'EUR', false, false, {preserveExistingDraft: true});
            await waitForBatchedUpdates();

            // Then loading ends, a retryable error is stored, and the user's progress remains intact
            expect(await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT)).toEqual(
                expect.objectContaining({
                    isLoading: false,
                    corpayFieldsError: 'common.genericErrorMessage',
                }),
            );
            expect(await getOnyxValue(ONYXKEYS.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM_DRAFT)).toEqual(internationalDraft);
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

        test('preserves entry context while clearing setup progress', async () => {
            // Given a report-originated setup containing both navigation context and transient progress
            const personalBankAccount = {
                exitReportID: '123',
                policyID: 'policy-1',
                onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.ADDRESS,
                shouldShowSuccess: true,
            };
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, personalBankAccount);

            // When the setup progress is cleared after selecting a country
            clearPersonalBankAccountPreservingEntryContext(personalBankAccount);
            await waitForBatchedUpdates();

            // Then its entry context is retained without Wallet resume state
            expect(await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT)).toEqual({
                exitReportID: '123',
                policyID: 'policy-1',
                onSuccessFallbackRoute: ROUTES.ENABLE_PAYMENTS,
            });
        });

        test('preserves Wallet ownership while clearing setup progress', async () => {
            // Given a Wallet-owned setup with saved progress
            const personalBankAccount = {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.ADDRESS,
            };
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, personalBankAccount);

            // When the setup progress is cleared after selecting a different country
            clearPersonalBankAccountPreservingEntryContext(personalBankAccount);
            await waitForBatchedUpdates();

            // Then Wallet ownership remains but the saved page does not
            expect(await getOnyxValue(ONYXKEYS.PERSONAL_BANK_ACCOUNT)).toEqual({source: CONST.BANK_ACCOUNT.SOURCE.WALLET});
        });
    });
});
