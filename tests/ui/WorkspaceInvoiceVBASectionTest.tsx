import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import Navigation from '@libs/Navigation/Navigation';

import type {PaymentMethodPressHandlerParams} from '@pages/settings/Wallet/WalletPage/types';
import WorkspaceInvoiceVBASection from '@pages/workspace/invoices/WorkspaceInvoiceVBASection';

import * as BankAccounts from '@userActions/BankAccounts';
import * as PaymentMethods from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'invoicesPolicy123';
const BANK_ACCOUNT_ID = 12345;
const SECOND_BANK_ACCOUNT_ID = 67890;
const DELETED_BANK_ACCOUNT_ID = 11111;

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

type CapturedListProps = {
    invoiceTransferBankAccountID?: number;
    threeDotsMenuItems?: PopoverMenuItem[];
    onThreeDotsMenuPress?: (params: PaymentMethodPressHandlerParams) => void;
};

let mockListProps: CapturedListProps = {};

jest.mock('@pages/settings/Wallet/PaymentMethodList', () => {
    const ActualPaymentMethodList = jest.requireActual<{default: (props: CapturedListProps) => React.ReactNode}>('@pages/settings/Wallet/PaymentMethodList').default;
    return (props: CapturedListProps) => {
        mockListProps = props;
        return <ActualPaymentMethodList {...props} />;
    };
});

const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
const setInvoicingTransferBankAccountSpy = jest.spyOn(PaymentMethods, 'setInvoicingTransferBankAccount').mockImplementation(() => {});
const deletePaymentBankAccountSpy = jest.spyOn(BankAccounts, 'deletePaymentBankAccount').mockImplementation(() => {});

const eligibleBusinessBankAccount = {
    methodID: BANK_ACCOUNT_ID,
    accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
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

const secondEligibleBusinessBankAccount = {
    ...eligibleBusinessBankAccount,
    methodID: SECOND_BANK_ACCOUNT_ID,
    accountData: {...eligibleBusinessBankAccount.accountData, bankAccountID: SECOND_BANK_ACCOUNT_ID},
};

async function seedPolicy({outputCurrency = CONST.CURRENCY.USD as string, withEligibleBankAccount = false, withSecondEligibleBankAccount = false} = {}) {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, outputCurrency});
        if (withEligibleBankAccount) {
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [BANK_ACCOUNT_ID]: eligibleBusinessBankAccount,
                ...(withSecondEligibleBankAccount ? {[SECOND_BANK_ACCOUNT_ID]: secondEligibleBusinessBankAccount} : {}),
            });
        }
    });
    await waitForBatchedUpdatesWithAct();
}

async function openRowMenu(account: typeof eligibleBusinessBankAccount) {
    await act(async () => {
        mockListProps.onThreeDotsMenuPress?.({accountType: account.accountType, accountData: account.accountData, methodID: account.methodID});
    });
    await waitForBatchedUpdatesWithAct();
}

function getMenuItemTexts() {
    return (mockListProps.threeDotsMenuItems ?? []).map((item) => item.text);
}

async function saveInvoiceDefault(bankAccountID: number) {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {invoice: {bankAccount: {transferBankAccountID: bankAccountID}}});
    });
    await waitForBatchedUpdatesWithAct();
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
    it('treats the first eligible account as the invoice default when no default is saved', async () => {
        // Given two eligible business bank accounts and no saved invoice default, as after adding a second account through Plaid
        await seedPolicy({withEligibleBankAccount: true, withSecondEligibleBankAccount: true});
        renderSection();
        await waitForBatchedUpdatesWithAct();

        // Then the list gets the primary account as the default, so it gets the "Default" badge
        expect(mockListProps.invoiceTransferBankAccountID).toBe(BANK_ACCOUNT_ID);

        // When the primary account's menu is opened
        await openRowMenu(eligibleBusinessBankAccount);

        // Then it does not offer to make the account that is already the default the default
        expect(getMenuItemTexts()).not.toContain(TestHelper.translateLocal('walletPage.setDefaultConfirmation'));

        // When the second account's menu is opened
        await openRowMenu(secondEligibleBusinessBankAccount);

        // Then it still offers to make that account the default
        expect(getMenuItemTexts()).toContain(TestHelper.translateLocal('walletPage.setDefaultConfirmation'));
    });

    it('rolls back to the saved invoice default, not the wallet default, when making another account the default', async () => {
        // Given the first account is the saved invoice default while the second one is the personal wallet default
        await seedPolicy({withEligibleBankAccount: true, withSecondEligibleBankAccount: true});
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {invoice: {bankAccount: {transferBankAccountID: BANK_ACCOUNT_ID}}});
            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {[SECOND_BANK_ACCOUNT_ID]: {isDefault: true}});
        });
        renderSection();
        await waitForBatchedUpdatesWithAct();

        // When the second account is made the invoice default
        await openRowMenu(secondEligibleBusinessBankAccount);
        await act(async () => {
            mockListProps.threeDotsMenuItems?.find((item) => item.text === TestHelper.translateLocal('walletPage.setDefaultConfirmation'))?.onSelected?.();
        });
        await waitForBatchedUpdatesWithAct();

        // Then a failed request restores the saved invoice default instead of the wallet default
        expect(setInvoicingTransferBankAccountSpy).toHaveBeenCalledWith(SECOND_BANK_ACCOUNT_ID, POLICY_ID, BANK_ACCOUNT_ID);
    });

    it('shows the badge on the saved invoice default instead of the first account', async () => {
        // Given the user already saved the second account as the invoice default
        await seedPolicy({withEligibleBankAccount: true, withSecondEligibleBankAccount: true});
        await saveInvoiceDefault(SECOND_BANK_ACCOUNT_ID);
        renderSection();
        await waitForBatchedUpdatesWithAct();

        // Then the saved default wins over the first eligible account
        expect(mockListProps.invoiceTransferBankAccountID).toBe(SECOND_BANK_ACCOUNT_ID);
    });

    it('treats the first eligible account as the invoice default when the saved default was deleted', async () => {
        // Given a saved invoice default whose account no longer exists, because the backend keeps the saved value after the account is deleted
        await seedPolicy({withEligibleBankAccount: true, withSecondEligibleBankAccount: true});
        await saveInvoiceDefault(DELETED_BANK_ACCOUNT_ID);
        renderSection();
        await waitForBatchedUpdatesWithAct();

        // Then the first eligible account gets the badge instead of no account getting it
        expect(mockListProps.invoiceTransferBankAccountID).toBe(BANK_ACCOUNT_ID);

        // When the first account's menu is opened
        await openRowMenu(eligibleBusinessBankAccount);

        // Then it only offers Delete, because the account already stands in as the default
        expect(getMenuItemTexts()).toContain(TestHelper.translateLocal('common.delete'));
        expect(getMenuItemTexts()).not.toContain(TestHelper.translateLocal('walletPage.setDefaultConfirmation'));
    });

    it('moves the badge to the next account while the first one is being deleted offline', async () => {
        // Given no saved invoice default and the first account deleted while offline, so it stays listed until the delete reaches the server
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        });
        await seedPolicy({withEligibleBankAccount: true, withSecondEligibleBankAccount: true});
        await act(async () => {
            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {[BANK_ACCOUNT_ID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}});
        });
        renderSection();
        await waitForBatchedUpdatesWithAct();

        // Then the second account stands in as the default, so the badge doesn't stay on the struck-through row
        expect(mockListProps.invoiceTransferBankAccountID).toBe(SECOND_BANK_ACCOUNT_ID);
    });

    it('does not save the next account as the invoice default when deleting an account that only stands in as the default', async () => {
        // Given no saved invoice default, so the first account only stands in as the default
        await seedPolicy({withEligibleBankAccount: true, withSecondEligibleBankAccount: true});
        mockShowConfirmModal.mockImplementationOnce(() => Promise.resolve({action: ModalActions.CONFIRM}));
        renderSection();
        await waitForBatchedUpdatesWithAct();

        // When the user deletes the first account
        await openRowMenu(eligibleBusinessBankAccount);
        await act(async () => {
            mockListProps.threeDotsMenuItems?.find((item) => item.text === TestHelper.translateLocal('common.delete'))?.onSelected?.();
        });
        await waitForBatchedUpdatesWithAct();

        // Then only the account is deleted. Saving the next account here would roll back to the deleted one if the request failed,
        // while the next account already stands in as the default once the first one is gone.
        expect(deletePaymentBankAccountSpy).toHaveBeenCalledWith(BANK_ACCOUNT_ID, undefined);
        expect(setInvoicingTransferBankAccountSpy).not.toHaveBeenCalled();
    });
});
