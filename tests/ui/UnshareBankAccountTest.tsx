/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import UnshareBankAccount from '@pages/settings/Wallet/UnshareBankAccount/UnshareBankAccount';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

// The page pushes its modals onto the global modal stack instead of rendering ConfirmModal, so assert on what it pushed.
// mockShowConfirmModal's call count is how these tests check that a modal is never stacked on top of an open one.
jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

// Only unshareBankAccount is stubbed -- clearUnshareBankAccountErrors has to stay real because these tests assert on the Onyx
// state it writes. requireActual is deferred into the call so it doesn't run while BankAccounts is still mid-import.
const mockUnshareBankAccount = jest.fn<void, [number, string]>();
jest.mock('@userActions/BankAccounts', () => ({
    __esModule: true,
    unshareBankAccount: (bankAccountID: number, ownerEmail: string) => {
        mockUnshareBankAccount(bankAccountID, ownerEmail);
    },
    clearUnshareBankAccountErrors: (bankAccountID: number) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        const actual = jest.requireActual<typeof import('@userActions/BankAccounts')>('@userActions/BankAccounts');
        actual.clearUnshareBankAccountErrors(bankAccountID);
    },
}));

const BANK_ACCOUNT_ID = '9876';
const OTHER_ADMIN_EMAIL = 'admin@example.com';
const CURRENT_USER_EMAIL = 'me@example.com';
const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_ADMIN_ACCOUNT_ID = 2;
const ERROR_TIMESTAMP = '1700000000000';

// getLatestErrorMessage reads the newest key off `errors`, and the page treats an error mentioning the Expensify Card as the card-error case.
const EXPENSIFY_CARD_ERROR = {[ERROR_TIMESTAMP]: 'This account is used with the Expensify Card'};

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, PersonalDetailsByLoginProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.SETTINGS.WALLET.UNSHARE_BANK_ACCOUNT}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.WALLET.UNSHARE_BANK_ACCOUNT}
                            component={UnshareBankAccount}
                            initialParams={{bankAccountID: BANK_ACCOUNT_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

/** Settle the modal promise that is currently pending and let the resulting continuation run. */
async function settlePendingModal(action: MockUseConfirmModalUtil.ShowConfirmModalResult['action']) {
    resolveShowConfirmModal({action});
    await waitForBatchedUpdatesWithAct();
}

async function setBankAccount(errors?: Record<string, string>) {
    await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
        [BANK_ACCOUNT_ID]: {
            errors: errors ?? null,
            isExpensifyCardSettlementAccount: false,
            // Only the other admin, so there is exactly one Unshare button to press
            accountData: {sharees: [OTHER_ADMIN_EMAIL]},
        },
    });
}

describe('UnshareBankAccount', () => {
    beforeEach(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_EMAIL, displayName: 'Me'},
            [OTHER_ADMIN_ACCOUNT_ID]: {accountID: OTHER_ADMIN_ACCOUNT_ID, login: OTHER_ADMIN_EMAIL, displayName: 'Other Admin'},
        });
        await waitForBatchedUpdatesWithAct();

        jest.clearAllMocks();
        resetMockConfirmModal();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('shows the card-error modal when the bank account reports an Expensify Card error', async () => {
        // Given a bank account that cannot be unshared because it is used with the Expensify Card
        await setBankAccount(EXPENSIFY_CARD_ERROR);

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then exactly one error modal is pushed onto the global modal stack
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
        expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(false);
    });

    it('clears the error on CONFIRM so the modal can be shown again', async () => {
        await setBankAccount(EXPENSIFY_CARD_ERROR);

        renderPage();
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

        // When the user confirms
        await settlePendingModal('CONFIRM');

        // Then the Onyx error is cleared, which is what lets a later error re-open the modal
        await waitFor(() => expect(screen.queryByText(/Expensify Card/)).toBeNull());

        // And when the same error comes back, the modal is shown again rather than staying suppressed
        await setBankAccount(EXPENSIFY_CARD_ERROR);
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
    });

    it('clears the error on CLOSE so the modal can be shown again', async () => {
        // The global modal always wires a cancel handler, so backdrop/ESC are real exits now. If CLOSE did not clear the
        // Onyx error, isExpensifyCardError would stay true forever and the modal could never be re-shown.
        await setBankAccount(EXPENSIFY_CARD_ERROR);

        renderPage();
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

        // When the user dismisses the modal instead of confirming
        await settlePendingModal('CLOSE');
        await waitForBatchedUpdatesWithAct();

        // And the error comes back
        await setBankAccount(EXPENSIFY_CARD_ERROR);
        await waitForBatchedUpdatesWithAct();

        // Then the modal is shown a second time
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
    });

    it('does not stack a second error modal while one is already open', async () => {
        await setBankAccount(EXPENSIFY_CARD_ERROR);

        renderPage();
        await waitForBatchedUpdatesWithAct();
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

        // When unrelated Onyx data changes while the modal is still open
        await Onyx.merge(ONYXKEYS.UNSHARE_BANK_ACCOUNT, {isLoading: false});
        await waitForBatchedUpdatesWithAct();

        // Then no duplicate modal is pushed on top of the open one
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
    });

    it('sends the unshare request only after the confirmation modal resolves with CONFIRM', async () => {
        await setBankAccount();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Given no modal has been opened by the error effect
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(0);

        // When the user presses Unshare next to the other admin
        const unshareButtons = await screen.findAllByText('Unshare');
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(unshareButtons.at(0)!);
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
        expect(mockUnshareBankAccount).not.toHaveBeenCalled();

        // Then the request only fires once the modal resolves with CONFIRM, from the awaited continuation
        await settlePendingModal('CONFIRM');
        await waitFor(() => expect(mockUnshareBankAccount).toHaveBeenCalledWith(Number(BANK_ACCOUNT_ID), OTHER_ADMIN_EMAIL));
    });

    it('does not unshare when the confirmation modal is dismissed', async () => {
        await setBankAccount();

        renderPage();
        await waitForBatchedUpdatesWithAct();

        const unshareButtons = await screen.findAllByText('Unshare');
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(unshareButtons.at(0)!);
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

        await settlePendingModal('CLOSE');

        expect(mockUnshareBankAccount).not.toHaveBeenCalled();
    });
});
