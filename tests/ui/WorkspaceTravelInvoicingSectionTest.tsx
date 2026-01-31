/* eslint-disable @typescript-eslint/naming-convention */
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';
import WorkspaceTravelInvoicingSection from '@pages/workspace/travel/WorkspaceTravelInvoicingSection';
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
    },
}));

const mockPolicy: Policy = {
    ...createRandomPolicy(parseInt(POLICY_ID, 10) || 1),
    type: CONST.POLICY.TYPE.CORPORATE,
    pendingAction: null,
    role: CONST.POLICY.ROLE.ADMIN,
};

const renderWorkspaceTravelInvoicingSection = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
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
        it('should show BookOrManageYourTrip when card settings are not available', async () => {
            // Given no Travel Invoicing card settings exist
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await waitForBatchedUpdatesWithAct();
            });

            // When rendering the component
            renderWorkspaceTravelInvoicingSection();

            // Wait for component to render
            await waitForBatchedUpdatesWithAct();

            // Then the fallback component should be visible (BookOrManageYourTrip)
            expect(screen.getByText('Book or manage your trip')).toBeTruthy();
        });

        it('should show BookOrManageYourTrip when paymentBankAccountID is not set', async () => {
            // Given Travel Invoicing card settings exist but without paymentBankAccountID
            const travelInvoicingKey = getTravelInvoicingCardSettingsKey(WORKSPACE_ACCOUNT_ID);

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    remainingLimit: 50000,
                    currentBalance: 10000,
                });
                await waitForBatchedUpdatesWithAct();
            });

            // When rendering the component
            renderWorkspaceTravelInvoicingSection();

            await waitForBatchedUpdatesWithAct();

            // Then the fallback component should be visible
            expect(screen.getByText('Book or manage your trip')).toBeTruthy();
        });
    });

    describe('When Travel Invoicing is configured', () => {
        const travelInvoicingKey = getTravelInvoicingCardSettingsKey(WORKSPACE_ACCOUNT_ID);
        const bankAccountKey = ONYXKEYS.BANK_ACCOUNT_LIST;

        it('should render the section title when card settings are properly configured', async () => {
            // Given Travel Invoicing is properly configured
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    paymentBankAccountID: 12345,
                    remainingLimit: 50000,
                    currentBalance: 10000,
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

            // When rendering the component
            renderWorkspaceTravelInvoicingSection();

            await waitForBatchedUpdatesWithAct();

            // Then the section title should be visible
            expect(screen.getByText('Travel booking')).toBeTruthy();
        });

        it('should display current travel spend label when configured', async () => {
            // Given Travel Invoicing is configured with current balance
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    paymentBankAccountID: 12345,
                    remainingLimit: 50000,
                    currentBalance: 25000,
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

            // When rendering the component
            renderWorkspaceTravelInvoicingSection();

            await waitForBatchedUpdatesWithAct();

            // Then the current travel spend label should be visible
            expect(screen.getByText('Current travel spend')).toBeTruthy();
        });

        it('should display current travel limit label when configured', async () => {
            // Given Travel Invoicing is configured with remaining limit
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    paymentBankAccountID: 12345,
                    remainingLimit: 100000,
                    currentBalance: 25000,
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

            // When rendering the component
            renderWorkspaceTravelInvoicingSection();

            await waitForBatchedUpdatesWithAct();

            // Then the current travel limit label should be visible
            expect(screen.getByText('Current travel limit')).toBeTruthy();
        });

        it('should display settlement account label', async () => {
            // Given Travel Invoicing is configured with settlement account
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    paymentBankAccountID: 12345,
                    remainingLimit: 50000,
                    currentBalance: 10000,
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

            // When rendering the component
            renderWorkspaceTravelInvoicingSection();

            await waitForBatchedUpdatesWithAct();

            // Then the settlement account label should be visible
            expect(screen.getByText('Settlement account')).toBeTruthy();
        });

        it('should display settlement frequency label', async () => {
            // Given Travel Invoicing is configured
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    paymentBankAccountID: 12345,
                    remainingLimit: 50000,
                    currentBalance: 10000,
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

            // When rendering the component
            renderWorkspaceTravelInvoicingSection();

            await waitForBatchedUpdatesWithAct();

            // Then the settlement frequency label should be visible
            expect(screen.getByText('Settlement frequency')).toBeTruthy();
        });

        it('should show correct frequency value and navigate on press', async () => {
            // Given Travel Invoicing is configured with Monthly frequency (default if monthlySettlementDate exists)
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await Onyx.merge(travelInvoicingKey, {
                    paymentBankAccountID: 12345,
                    remainingLimit: 50000,
                    currentBalance: 10000,
                    monthlySettlementDate: new Date(),
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

            // When rendering the component
            renderWorkspaceTravelInvoicingSection();

            await waitForBatchedUpdatesWithAct();

            // Then it should display "Monthly"
            expect(screen.getByText('Monthly')).toBeTruthy();
            expect(screen.getByText('Settlement frequency')).toBeTruthy();
        });
    });
});
