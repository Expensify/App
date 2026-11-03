import {act, fireEvent, render, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import {waitForIdle} from '@libs/Network/SequentialQueue';

import WorkspaceInvoiceVBASection from '@pages/workspace/invoices/WorkspaceInvoiceVBASection';

import {onModalDidClose} from '@userActions/Modal';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'invoicesPolicy123';
const BANK_ACCOUNT_ID = 12345;

let mockIsUserValidated = false;
let mockCapturedOnResume: ((payload?: () => void) => void) | undefined;
const mockVerifyAccountAndResume = jest.fn<void, [payload?: () => void]>();

jest.mock('@hooks/useVerifyAccountAndResume', () => ({
    __esModule: true,
    default: (onResume: (payload?: () => void) => void) => {
        mockCapturedOnResume = onResume;
        return {isUserValidated: mockIsUserValidated, verifyAccountAndResume: mockVerifyAccountAndResume};
    },
}));

// The currency-change confirmation is left pending: these tests only assert that the modal is (or is not) shown.
const mockShowConfirmModal = jest.fn(() => new Promise(() => {}));

jest.mock('@hooks/useConfirmModal', () =>
    jest.fn().mockImplementation(() => ({
        showConfirmModal: mockShowConfirmModal,
        closeModal: jest.fn(),
    })),
);

const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

const eligibleBusinessBankAccount = {
    methodID: BANK_ACCOUNT_ID,
    bankCurrency: CONST.CURRENCY.USD,
    accountData: {
        bankAccountID: BANK_ACCOUNT_ID,
        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
        state: CONST.BANK_ACCOUNT.STATE.OPEN,
    },
};

function renderSection({canWriteMoreFeatures = true, showReadOnlyModal = jest.fn()} = {}) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <WorkspaceInvoiceVBASection
                    policyID={POLICY_ID}
                    canWriteMoreFeatures={canWriteMoreFeatures}
                    showReadOnlyModal={showReadOnlyModal}
                />
            </PortalProvider>
        </ComposeProviders>,
    );
    return {showReadOnlyModal};
}

async function seedPolicy({outputCurrency = CONST.CURRENCY.USD as string, withEligibleBankAccount = false} = {}) {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, outputCurrency});
        if (withEligibleBankAccount) {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: eligibleBusinessBankAccount});
        }
    });
    await waitForBatchedUpdatesWithAct();
}

const PRIMARY_BANK_ACCOUNT_ID = 1001;
const SECOND_BANK_ACCOUNT_ID = 1002;
const DELETED_BANK_ACCOUNT_ID = 1003;
const EURO_BANK_ACCOUNT_ID = 1004;
const THIRD_BANK_ACCOUNT_ID = 1005;
const PRIMARY_TITLE = 'Primary account';
const SECOND_TITLE = 'Second account';
const EURO_TITLE = 'Euro account';
const THIRD_TITLE = 'Third account';

function buildBusinessBankAccount(bankAccountID: number, title: string, bankCurrency: string = CONST.CURRENCY.USD) {
    return {
        key: `bankAccount-${bankAccountID}`,
        methodID: bankAccountID,
        title,
        accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        bankCurrency,
        isDefault: false,
        accountData: {
            bankAccountID,
            addressName: title,
            accountNumber: `XXXXXXXX${bankAccountID}`,
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
        },
    };
}

const primaryBankAccount = buildBusinessBankAccount(PRIMARY_BANK_ACCOUNT_ID, PRIMARY_TITLE);
const secondBankAccount = buildBusinessBankAccount(SECOND_BANK_ACCOUNT_ID, SECOND_TITLE);

async function seedBankAccounts(bankAccounts: Array<ReturnType<typeof buildBusinessBankAccount>>, savedInvoiceDefaultBankAccountID?: number) {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            outputCurrency: CONST.CURRENCY.USD,
            invoice: savedInvoiceDefaultBankAccountID ? {bankAccount: {transferBankAccountID: savedInvoiceDefaultBankAccountID}} : {},
        });
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, Object.fromEntries(bankAccounts.map((bankAccount) => [bankAccount.methodID, bankAccount])));
    });
    await waitForBatchedUpdatesWithAct();
}

async function waitForRequestQueue() {
    await act(async () => {
        await waitForIdle();
    });
    await waitForBatchedUpdatesWithAct();
}

function getBankAccountRow(title: string) {
    // An open menu repeats the account title in its header, so the list row is the match that has the three-dots button.
    const row = screen.getAllByLabelText(new RegExp(`^${title}`)).find((element) => !!within(element).queryByLabelText(TestHelper.translateLocal('common.more')));
    if (!row) {
        throw new Error(`No bank account row for ${title}`);
    }
    return row;
}

function hasDefaultBadge(title: string) {
    return !!within(getBankAccountRow(title)).queryByText(TestHelper.translateLocal('paymentMethodList.defaultPaymentMethod'));
}

async function openThreeDotsMenu(title: string) {
    fireEvent.press(within(getBankAccountRow(title)).getByLabelText(TestHelper.translateLocal('common.more')), {nativeEvent: {}});
    await waitForBatchedUpdatesWithAct();
}

function queryMakeDefaultMenuItem() {
    return screen.queryByText(TestHelper.translateLocal('walletPage.setDefaultConfirmation'));
}

function queryDeleteMenuItem() {
    return screen.queryByText(TestHelper.translateLocal('common.delete'));
}

async function pressAddBankAccount() {
    // MenuItem's onPressAction ignores presses without an event object, so pass a minimal one.
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('bankAccount.addBankAccount')}), {nativeEvent: {}});
    await waitForBatchedUpdatesWithAct();
}

describe('WorkspaceInvoiceVBASection', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsUserValidated = false;
        mockCapturedOnResume = undefined;
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('defers to the account verification flow for an unvalidated user instead of navigating', async () => {
        await seedPolicy({withEligibleBankAccount: true});
        renderSection();
        await waitForBatchedUpdatesWithAct();

        await pressAddBankAccount();

        expect(mockVerifyAccountAndResume).toHaveBeenCalledTimes(1);
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    // The resume callback must make the same routing decision a validated user gets on direct press.
    it.each([
        {
            name: 'connect-existing screen when an eligible business bank account exists',
            withEligibleBankAccount: true,
            expectedRoute: ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(POLICY_ID, ROUTES.WORKSPACE_INVOICES.getRoute(POLICY_ID)),
        },
        {
            name: 'bank account setup flow when no eligible accounts exist',
            withEligibleBankAccount: false,
            expectedRoute: ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: POLICY_ID, backTo: ROUTES.WORKSPACE_INVOICES.getRoute(POLICY_ID)}),
        },
    ])('resumes to the $name after validation', async ({withEligibleBankAccount, expectedRoute}) => {
        await seedPolicy({withEligibleBankAccount});
        renderSection();
        await waitForBatchedUpdatesWithAct();

        await pressAddBankAccount();
        expect(navigateSpy).not.toHaveBeenCalled();

        await act(async () => {
            mockCapturedOnResume?.(mockVerifyAccountAndResume.mock.calls.at(0)?.at(0));
            await waitForBatchedUpdatesWithAct();
        });

        expect(navigateSpy.mock.calls.at(0)?.at(0)).toBe(expectedRoute);
    });

    it('navigates straight to the connect-existing screen for a validated user with an eligible account', async () => {
        mockIsUserValidated = true;
        await seedPolicy({withEligibleBankAccount: true});
        renderSection();
        await waitForBatchedUpdatesWithAct();

        await pressAddBankAccount();

        expect(mockVerifyAccountAndResume).not.toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(POLICY_ID, ROUTES.WORKSPACE_INVOICES.getRoute(POLICY_ID)));
    });

    it('shows the read-only modal before any verification for a user without write access', async () => {
        await seedPolicy({withEligibleBankAccount: true});
        const {showReadOnlyModal} = renderSection({canWriteMoreFeatures: false});
        await waitForBatchedUpdatesWithAct();

        await pressAddBankAccount();

        expect(showReadOnlyModal).toHaveBeenCalledTimes(1);
        expect(mockVerifyAccountAndResume).not.toHaveBeenCalled();
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('shows the currency confirmation before any verification for an unsupported workspace currency', async () => {
        await seedPolicy({outputCurrency: 'PLN'});
        renderSection();
        await waitForBatchedUpdatesWithAct();

        await pressAddBankAccount();

        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockVerifyAccountAndResume).not.toHaveBeenCalled();
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    describe('invoice default bank account', () => {
        let mockFetch: ReturnType<typeof TestHelper.getGlobalFetchMock>;
        let originalFetch: typeof global.fetch;

        beforeEach(() => {
            originalFetch = global.fetch;
            mockFetch = TestHelper.getGlobalFetchMock();
            global.fetch = mockFetch;
        });

        afterEach(async () => {
            // A test that fails while fetch is paused would otherwise leave the request queue blocked for the next test.
            await act(async () => {
                await mockFetch.resume();
                await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: false});
            });
            global.fetch = originalFetch;
        });

        it('treats the first eligible account as the default when no default is saved', async () => {
            // Given a workspace with two eligible accounts, because adding a bank account never saves an invoice default
            await seedBankAccounts([primaryBankAccount, secondBankAccount]);

            // When the section renders
            renderSection();
            await waitForBatchedUpdatesWithAct();

            // Then only the first account shows the Default badge
            expect(hasDefaultBadge(PRIMARY_TITLE)).toBe(true);
            expect(hasDefaultBadge(SECOND_TITLE)).toBe(false);

            // When the first account's menu is opened
            await openThreeDotsMenu(PRIMARY_TITLE);

            // Then the menu only offers Delete, because the account is already the default
            expect(queryDeleteMenuItem()).not.toBeNull();
            expect(queryMakeDefaultMenuItem()).toBeNull();
        });

        it('still offers Make default on the second account when no default is saved', async () => {
            // Given two eligible accounts and no saved default
            await seedBankAccounts([primaryBankAccount, secondBankAccount]);
            renderSection();
            await waitForBatchedUpdatesWithAct();

            // When the second account's menu is opened
            await openThreeDotsMenu(SECOND_TITLE);

            // Then the user can make it the default, because the first account is the default until one is saved
            expect(queryMakeDefaultMenuItem()).not.toBeNull();
        });

        it('moves the badge to the next account while the first one is being deleted offline', async () => {
            // Given no saved default and the first account deleted while offline, so it is still listed until the delete reaches the server
            const primaryBankAccountBeingDeleted = {...primaryBankAccount, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            });
            await seedBankAccounts([primaryBankAccountBeingDeleted, secondBankAccount]);

            // When the section renders
            renderSection();
            await waitForBatchedUpdatesWithAct();

            // Then the second account stands in as the default, so the badge doesn't stay on the account being deleted
            expect(hasDefaultBadge(SECOND_TITLE)).toBe(true);
            expect(hasDefaultBadge(PRIMARY_TITLE)).toBe(false);
        });

        it('shows the badge on the saved default instead of the first account', async () => {
            // Given the user already saved the second account as the invoice default
            await seedBankAccounts([primaryBankAccount, secondBankAccount], SECOND_BANK_ACCOUNT_ID);

            // When the section renders
            renderSection();
            await waitForBatchedUpdatesWithAct();

            // Then the saved default wins over the first eligible account
            expect(hasDefaultBadge(SECOND_TITLE)).toBe(true);
            expect(hasDefaultBadge(PRIMARY_TITLE)).toBe(false);
        });

        it('treats the first eligible account as the default when the saved default was deleted', async () => {
            // Given two eligible accounts and a saved default whose account was deleted, because the backend keeps the saved value after the delete
            await seedBankAccounts([primaryBankAccount, secondBankAccount], DELETED_BANK_ACCOUNT_ID);

            // When the section renders
            renderSection();
            await waitForBatchedUpdatesWithAct();

            // Then the first account shows the Default badge instead of no account showing it
            expect(hasDefaultBadge(PRIMARY_TITLE)).toBe(true);
            expect(hasDefaultBadge(SECOND_TITLE)).toBe(false);

            // When the first account's menu is opened
            await openThreeDotsMenu(PRIMARY_TITLE);

            // Then the menu only offers Delete, because the account stands in as the default
            expect(queryDeleteMenuItem()).not.toBeNull();
            expect(queryMakeDefaultMenuItem()).toBeNull();
        });

        it('moves the badge to the next account while the saved default is being deleted offline', async () => {
            // Given the saved default deleted while offline from the Wallet page, which doesn't move the invoice default, so it is still listed until the delete reaches the server
            const primaryBankAccountBeingDeleted = {...primaryBankAccount, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            });
            await seedBankAccounts([primaryBankAccountBeingDeleted, secondBankAccount], PRIMARY_BANK_ACCOUNT_ID);

            // When the section renders
            renderSection();
            await waitForBatchedUpdatesWithAct();

            // Then the second account stands in as the default, so the badge doesn't stay on the account being deleted
            expect(hasDefaultBadge(SECOND_TITLE)).toBe(true);
            expect(hasDefaultBadge(PRIMARY_TITLE)).toBe(false);
        });

        it('shows no Default badge when no account can be the invoice default', async () => {
            // Given a saved default, a workspace currency that matches no account, and the second account linked to the personal Wallet
            await seedBankAccounts([primaryBankAccount, secondBankAccount], PRIMARY_BANK_ACCOUNT_ID);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {outputCurrency: CONST.CURRENCY.EUR});
                await Onyx.merge(ONYXKEYS.USER_WALLET, {walletLinkedAccountID: SECOND_BANK_ACCOUNT_ID});
            });

            // When the section renders
            renderSection();
            await waitForBatchedUpdatesWithAct();

            // Then no account shows the badge, because the Wallet's account has nothing to do with invoices
            expect(hasDefaultBadge(PRIMARY_TITLE)).toBe(false);
            expect(hasDefaultBadge(SECOND_TITLE)).toBe(false);
        });

        it('does not offer Make default on an account that cannot be the invoice default', async () => {
            // Given two eligible accounts and a listed business account in another currency
            await seedBankAccounts([primaryBankAccount, secondBankAccount, buildBusinessBankAccount(EURO_BANK_ACCOUNT_ID, EURO_TITLE, CONST.CURRENCY.EUR)]);
            renderSection();
            await waitForBatchedUpdatesWithAct();

            // When the other-currency account's menu is opened
            await openThreeDotsMenu(EURO_TITLE);

            // Then the menu only offers Delete, because an account in another currency can't be the invoice default
            expect(queryDeleteMenuItem()).not.toBeNull();
            expect(queryMakeDefaultMenuItem()).toBeNull();
        });

        it('stops offering Make default when the account becomes the default while its menu is open', async () => {
            // Given two eligible accounts, no saved default, and the second account's menu open with Make default
            await seedBankAccounts([primaryBankAccount, secondBankAccount]);
            renderSection();
            await waitForBatchedUpdatesWithAct();
            await openThreeDotsMenu(SECOND_TITLE);
            expect(queryMakeDefaultMenuItem()).not.toBeNull();

            // When another device saves the second account as the invoice default while the menu is still open
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {invoice: {bankAccount: {transferBankAccountID: SECOND_BANK_ACCOUNT_ID}}});
            });
            await waitForBatchedUpdatesWithAct();

            // Then the menu stops offering Make default, because the account already is the default
            expect(queryDeleteMenuItem()).not.toBeNull();
            expect(queryMakeDefaultMenuItem()).toBeNull();
        });

        it('moves the saved default to an account that is not being deleted when the saved default is deleted', async () => {
            // Given the first account is the saved default and, while offline, the second account is already being deleted
            const secondBankAccountBeingDeleted = {...secondBankAccount, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
            await act(async () => {
                await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
            });
            await seedBankAccounts([primaryBankAccount, secondBankAccountBeingDeleted, buildBusinessBankAccount(THIRD_BANK_ACCOUNT_ID, THIRD_TITLE)], PRIMARY_BANK_ACCOUNT_ID);
            renderSection();
            await waitForBatchedUpdatesWithAct();

            // When the user deletes the saved default and confirms
            await openThreeDotsMenu(PRIMARY_TITLE);
            mockShowConfirmModal.mockImplementationOnce(() => Promise.resolve({action: ModalActions.CONFIRM}));
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.delete')), {nativeEvent: {}});
            // Jest never finishes the menu's close animation, so fire the callback the delete flow waits for.
            await act(async () => {
                onModalDidClose();
            });
            await waitForBatchedUpdatesWithAct();

            // Then the saved default moves to the third account, because the second one is about to disappear
            const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`);
            expect(policy?.invoice?.bankAccount?.transferBankAccountID).toBe(THIRD_BANK_ACCOUNT_ID);
        });

        it('does not save the next account as the invoice default when deleting an account that only stands in as the default', async () => {
            // Given two eligible accounts and no saved default, so the first account only stands in as the default
            await seedBankAccounts([primaryBankAccount, secondBankAccount]);
            renderSection();
            await waitForBatchedUpdatesWithAct();

            // When the user deletes the first account and confirms
            await openThreeDotsMenu(PRIMARY_TITLE);
            mockShowConfirmModal.mockImplementationOnce(() => Promise.resolve({action: ModalActions.CONFIRM}));
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.delete')), {nativeEvent: {}});
            // Jest never finishes the menu's close animation, so fire the callback the delete flow waits for.
            await act(async () => {
                onModalDidClose();
            });
            await waitForRequestQueue();

            // Then only the delete reaches the server, because the second account stands in by itself, and saving it would restore the deleted account if the request failed
            expect(TestHelper.getFetchMockCalls(WRITE_COMMANDS.DELETE_PAYMENT_BANK_ACCOUNT)).toHaveLength(1);
            expect(TestHelper.getFetchMockCalls(WRITE_COMMANDS.SET_INVOICING_TRANSFER_BANK_ACCOUNT)).toHaveLength(0);
        });

        it('puts the badge back on the saved default, not the Wallet default, when Make default fails', async () => {
            // Given the first account is the saved invoice default, the second account is the Wallet's default, and the server rejects the change
            await seedBankAccounts([primaryBankAccount, {...secondBankAccount, isDefault: true}], PRIMARY_BANK_ACCOUNT_ID);
            mockFetch.mockAPICommand(WRITE_COMMANDS.SET_INVOICING_TRANSFER_BANK_ACCOUNT, () => ({jsonCode: CONST.JSON_CODE.EXP_ERROR}));
            mockFetch.pause();
            renderSection();
            await waitForBatchedUpdatesWithAct();

            // When the user makes the second account the invoice default
            await openThreeDotsMenu(SECOND_TITLE);
            fireEvent.press(screen.getByText(TestHelper.translateLocal('walletPage.setDefaultConfirmation')), {nativeEvent: {}});
            await waitForBatchedUpdatesWithAct();

            // Then the badge moves to the second account before the server answers
            expect(hasDefaultBadge(SECOND_TITLE)).toBe(true);
            expect(hasDefaultBadge(PRIMARY_TITLE)).toBe(false);

            // When the server rejects the change
            await act(async () => {
                await mockFetch.resume();
            });
            await waitForRequestQueue();

            // Then the change reached the server and the badge went back to the saved invoice default, because the Wallet default has nothing to do with invoices
            expect(TestHelper.getFetchMockCalls(WRITE_COMMANDS.SET_INVOICING_TRANSFER_BANK_ACCOUNT)).toHaveLength(1);
            expect(hasDefaultBadge(PRIMARY_TITLE)).toBe(true);
            expect(hasDefaultBadge(SECOND_TITLE)).toBe(false);
        });
    });
});
