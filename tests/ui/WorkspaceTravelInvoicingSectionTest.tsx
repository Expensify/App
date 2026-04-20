/* eslint-disable @typescript-eslint/naming-convention */
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {payTravelInvoicingSpend} from '@libs/actions/TravelInvoicing';
import {getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';
import WorkspaceTravelInvoicingSection from '@pages/workspace/travel/WorkspaceTravelInvoicingSection';
import {updateGeneralSettings} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Test constants - these values MUST match the literals used in jest.mock() below
// because jest.mock() is hoisted before variable declarations are evaluated
const POLICY_ID = 'testPolicy123';
const WORKSPACE_ACCOUNT_ID = 999888;

// jest.mock() factories are hoisted and run before imports/variables are defined.
// Therefore, they cannot reference variables like POLICY_ID or WORKSPACE_ACCOUNT_ID.
// We use literal values that match the constants above.

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => true,
        useRoute: () => ({
            key: 'test-route',
            name: 'Workspace_Travel',
            params: {policyID: 'testPolicy123'}, // Must match POLICY_ID
        }),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@hooks/useWorkspaceAccountID', () => ({
    __esModule: true,
    default: () => 999888, // Must match WORKSPACE_ACCOUNT_ID
}));

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
        isTopmostRouteModalScreen: jest.fn(() => false),
    },
}));

jest.mock('@libs/actions/TravelInvoicing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/TravelInvoicing');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        payTravelInvoicingSpend: jest.fn().mockResolvedValue(undefined),
    };
});

jest.mock('@userActions/Policy/Policy', () => ({
    updateGeneralSettings: jest.fn(),
}));

const mockShowConfirmModal = jest.fn().mockResolvedValue({action: 'CONFIRM'});
const mockCloseModal = jest.fn();

jest.mock('@hooks/useConfirmModal', () => {
    return jest.fn().mockImplementation(() => ({
        showConfirmModal: mockShowConfirmModal,
        closeModal: mockCloseModal,
    }));
});

const mockPolicy: Policy = {
    ...createRandomPolicy(parseInt(POLICY_ID, 10) || 1),
    type: CONST.POLICY.TYPE.CORPORATE,
    pendingAction: null,
    role: CONST.POLICY.ROLE.ADMIN,
};

const renderWorkspaceTravelInvoicingSection = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <WorkspaceTravelInvoicingSection policyID={POLICY_ID} />
        </ComposeProviders>,
    );
};

describe('WorkspaceTravelInvoicingSection', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('When Travel Invoicing is not configured', () => {
        it('should render sections when card settings are not available', async () => {
            // Given no Travel Invoicing card settings exist
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await waitForBatchedUpdatesWithAct();
            });

            // When rendering the component
            renderWorkspaceTravelInvoicingSection();

            // Wait for component to render
            await waitForBatchedUpdatesWithAct();

            // Central Invoicing section should be visible
            expect(screen.getByText('Central invoicing')).toBeTruthy();
        });

        it('should render sections when paymentBankAccountID is not set', async () => {
            // Given Travel Invoicing card settings exist but without paymentBankAccountID
            const travelInvoicingKey = getTravelInvoicingCardSettingsKey(WORKSPACE_ACCOUNT_ID);

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    TRAVEL_US: {
                        remainingLimit: 50000,
                        currentBalance: 10000,
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText('Central invoicing')).toBeTruthy();
        });
    });

    describe('When Travel Invoicing is configured', () => {
        const travelInvoicingKey = getTravelInvoicingCardSettingsKey(WORKSPACE_ACCOUNT_ID);
        const bankAccountKey = ONYXKEYS.BANK_ACCOUNT_LIST;

        it('should render the section title when card settings are properly configured', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    TRAVEL_US: {
                        paymentBankAccountID: 12345,
                        remainingLimit: 50000,
                        currentBalance: 10000,
                    },
                });
                await Onyx.merge(bankAccountKey, {
                    12345: {
                        accountData: {
                            addressName: 'Test Company',
                            accountNumber: '****1234',
                            bankAccountID: 12345,
                        },
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText('Central invoicing')).toBeTruthy();
        });

        it('should display current travel spend label when configured', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    TRAVEL_US: {
                        paymentBankAccountID: 12345,
                        remainingLimit: 50000,
                        currentBalance: 25000,
                    },
                });
                await Onyx.merge(bankAccountKey, {
                    12345: {
                        accountData: {
                            addressName: 'Test Company',
                            accountNumber: '****1234',
                            bankAccountID: 12345,
                        },
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText('Current travel spend')).toBeTruthy();
        });

        it('should display current travel limit label when configured', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    TRAVEL_US: {
                        paymentBankAccountID: 12345,
                        remainingLimit: 100000,
                        currentBalance: 25000,
                    },
                });
                await Onyx.merge(bankAccountKey, {
                    12345: {
                        accountData: {
                            addressName: 'Test Company',
                            accountNumber: '****1234',
                            bankAccountID: 12345,
                        },
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText('Current travel limit')).toBeTruthy();
        });

        it('should display settlement account label', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    TRAVEL_US: {
                        paymentBankAccountID: 12345,
                        remainingLimit: 50000,
                        currentBalance: 10000,
                    },
                });
                await Onyx.merge(bankAccountKey, {
                    12345: {
                        accountData: {
                            addressName: 'Test Company',
                            accountNumber: '****1234',
                            bankAccountID: 12345,
                        },
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText('Settlement account')).toBeTruthy();
        });

        it('should display settlement frequency label', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    TRAVEL_US: {
                        paymentBankAccountID: 12345,
                        remainingLimit: 50000,
                        currentBalance: 10000,
                    },
                });
                await Onyx.merge(bankAccountKey, {
                    12345: {
                        accountData: {
                            addressName: 'Test Company',
                            accountNumber: '****1234',
                            bankAccountID: 12345,
                        },
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText('Settlement frequency')).toBeTruthy();
        });

        it('should show correct frequency value and navigate on press', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    TRAVEL_US: {
                        paymentBankAccountID: 12345,
                        remainingLimit: 50000,
                        currentBalance: 10000,
                        monthlySettlementDate: new Date(),
                    },
                });
                await Onyx.merge(bankAccountKey, {
                    12345: {
                        accountData: {
                            addressName: 'Test Company',
                            accountNumber: '****1234',
                            bankAccountID: 12345,
                        },
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByText('Monthly')).toBeTruthy();
            expect(screen.getByText('Settlement frequency')).toBeTruthy();
        });
    });

    describe('Offline-first toggle (no loading indicator)', () => {
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(WORKSPACE_ACCOUNT_ID);

        it('should NOT show loading indicator when toggle has a pending action (offline-first)', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(cardSettingsKey, {
                    TRAVEL_US: {
                        isEnabled: true,
                    },
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();
            expect(screen.queryByTestId('activity-indicator')).toBeNull();
        });

        it('should NOT show loading indicator when only isLoading is true without pendingAction (page fetch)', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(cardSettingsKey, {
                    isLoading: true,
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();
            expect(screen.queryByTestId('activity-indicator')).toBeNull();
        });
    });

    describe('Pay Balance Button', () => {
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(WORKSPACE_ACCOUNT_ID);

        it('should show Pay Balance button when user is admin, invoicing is enabled, there is a balance, and monthly settlement is enabled', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(cardSettingsKey, {
                    TRAVEL_US: {
                        isEnabled: true,
                        paymentBankAccountID: 12345,
                        currentBalance: 5000,
                        monthlySettlementDate: new Date(),
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();

            const payButton = screen.queryByText('Pay balance');
            expect(payButton).toBeTruthy();
        });

        it('should not render Pay Balance button when balance is zero', async () => {
            const travelInvoicingKey = getTravelInvoicingCardSettingsKey(WORKSPACE_ACCOUNT_ID);

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.set(travelInvoicingKey, {
                    TRAVEL_US: {
                        isEnabled: true,
                        paymentBankAccountID: 12345,
                        currentBalance: 0,
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();

            // Button should not be rendered when travelSpend is 0
            const payButton = screen.queryByText('Pay balance');
            expect(payButton).toBeNull();
        });

        it('should show confirmation modal and call payTravelInvoicingSpend on confirm', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(cardSettingsKey, {
                    TRAVEL_US: {
                        isEnabled: true,
                        paymentBankAccountID: 12345,
                        currentBalance: 5000,
                        monthlySettlementDate: new Date(),
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();

            // Pressing Pay balance should open the confirmation modal, not call the action directly
            const payButton = screen.getByText('Pay balance');
            fireEvent.press(payButton);
            await waitForBatchedUpdatesWithAct();

            expect(payTravelInvoicingSpend).not.toHaveBeenCalled();

            // The confirmation modal should be visible with the pay balance title
            // Title uses the amount: "Pay balance of $50.00?"
            expect(screen.getByText('Pay balance of $50.00?')).toBeTruthy();

            // Confirm the modal — the confirm button reuses 'Pay balance' CTA text
            // There are now two 'Pay balance' texts (the original button behind the modal and the modal's confirm button)
            const payBalanceButtons = screen.getAllByText('Pay balance');
            const confirmButton = payBalanceButtons.at(-1);
            // Press the last one which is the modal's confirm button
            if (confirmButton) {
                fireEvent.press(confirmButton);
            }
            await waitForBatchedUpdatesWithAct();

            expect(payTravelInvoicingSpend).toHaveBeenCalledWith(WORKSPACE_ACCOUNT_ID, 5000);
        });

        it('should hide Pay Balance button and show queued message when settlement is pending', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(cardSettingsKey, {
                    TRAVEL_US: {
                        isEnabled: true,
                        paymentBankAccountID: 12345,
                        currentBalance: 15000,
                        pendingSettlementAmount: 10000,
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();

            // Pay balance button should not be visible when settlement is pending
            expect(screen.queryByText('Pay balance')).toBeNull();

            // Current spend should show real balance ($150.00), not $0
            expect(screen.getByText('$150.00')).toBeTruthy();

            // Queued payment message should show the pending settlement amount
            expect(screen.getByText('Payment of $100.00 is queued and will be processed soon.')).toBeTruthy();
        });

        it('should show Pay Balance button when no settlement is pending and balance exists', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(cardSettingsKey, {
                    TRAVEL_US: {
                        isEnabled: true,
                        paymentBankAccountID: 12345,
                        currentBalance: 5000,
                        pendingSettlementAmount: 0,
                        monthlySettlementDate: new Date(),
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();

            // Pay button should be visible
            expect(screen.getByText('Pay balance')).toBeTruthy();

            // Should show real balance
            expect(screen.getByText('$50.00')).toBeTruthy();

            // No queued message
            expect(screen.queryByText(/Payment of .* is queued/)).toBeNull();
        });
    });

    describe('Currency Conversion Prompt', () => {
        const cardSettingsKey = getTravelInvoicingCardSettingsKey(WORKSPACE_ACCOUNT_ID);

        it('should prompt to update currency to USD if policy currency is not USD, and call updateGeneralSettings on confirm', async () => {
            const mockPolicyGbp = {
                ...mockPolicy,
                outputCurrency: 'GBP',
                name: 'GBP Workspace',
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicyGbp);
                await Onyx.merge(cardSettingsKey, {
                    TRAVEL_US: {
                        isEnabled: false,
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderWorkspaceTravelInvoicingSection();
            await waitForBatchedUpdatesWithAct();

            // Fire toggle change to true
            const toggleButton = screen.getByRole('switch');
            fireEvent.press(toggleButton);
            await waitForBatchedUpdatesWithAct();

            // The confirm modal should be triggered
            expect(mockShowConfirmModal).toHaveBeenCalled();

            // The updateGeneralSettings function should be called
            expect(updateGeneralSettings).toHaveBeenCalledWith(expect.objectContaining({outputCurrency: 'GBP', name: 'GBP Workspace'}), 'GBP Workspace', CONST.CURRENCY.USD);
        });
    });
});
