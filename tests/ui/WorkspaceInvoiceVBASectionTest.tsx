import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import WorkspaceInvoiceVBASection from '@pages/workspace/invoices/WorkspaceInvoiceVBASection';

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
});
