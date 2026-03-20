/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react-native-a11y/has-valid-accessibility-descriptors */
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import WorkspaceInvoiceVBASection from '@pages/workspace/invoices/WorkspaceInvoiceVBASection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'testInvoicePolicy123';

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => true,
        useRoute: () => ({
            key: 'test-route',
            name: 'Workspace_Invoices',
            params: {policyID: 'testInvoicePolicy123'},
        }),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        navigate: (...args: unknown[]) => mockNavigate(...args),
        getActiveRoute: jest.fn(() => ''),
        isTopmostRouteModalScreen: jest.fn(() => false),
    },
}));

jest.mock('@libs/actions/ReimbursementAccount', () => ({
    navigateToBankAccountRoute: jest.fn(),
}));

const mockDeletePaymentBankAccount = jest.fn();
jest.mock('@userActions/BankAccounts', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    deletePaymentBankAccount: (...args: unknown[]) => mockDeletePaymentBankAccount(...args),
}));

const mockSetInvoicingTransferBankAccount = jest.fn();
jest.mock('@userActions/PaymentMethods', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    setInvoicingTransferBankAccount: (...args: unknown[]) => mockSetInvoicingTransferBankAccount(...args),
}));

const mockCloseActionModal = jest.fn((callback?: () => void) => {
    if (!callback) {
        return;
    }

    callback();
});
jest.mock('@userActions/Modal', () => ({
    close: (...args: [(() => void)?]) => mockCloseActionModal(...args),
}));

const mockShowConfirmModal = jest.fn().mockResolvedValue({action: 'CONFIRM'});
const mockCloseModal = jest.fn();

jest.mock('@hooks/useConfirmModal', () => {
    return jest.fn().mockImplementation(() => ({
        showConfirmModal: mockShowConfirmModal,
        closeModal: mockCloseModal,
    }));
});

// Mock PaymentMethodList to expose callbacks for testing
let mockCapturedOnAddBankAccountPress: (() => void) | undefined;
// eslint-disable-next-line rulesdir/no-negated-variables
let mockCapturedOnThreeDotsMenuPress: ((mockParams: Record<string, unknown>) => void) | undefined;
let mockCapturedThreeDotsMenuItems: Array<{text: string; onSelected?: () => void}> | undefined;

jest.mock('@pages/settings/Wallet/PaymentMethodList', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View, Text, Pressable} = require('react-native');
    return (mockProps: Record<string, unknown>) => {
        mockCapturedOnAddBankAccountPress = mockProps.onAddBankAccountPress as () => void;
        mockCapturedOnThreeDotsMenuPress = mockProps.onThreeDotsMenuPress as (mockP: Record<string, unknown>) => void;
        mockCapturedThreeDotsMenuItems = mockProps.threeDotsMenuItems as Array<{text: string; onSelected?: () => void}>;

        return (
            <View testID="PaymentMethodList">
                <Pressable
                    testID="add-bank-account"
                    onPress={mockProps.onAddBankAccountPress}
                >
                    <Text>Add bank account</Text>
                </Pressable>
            </View>
        );
    };
});

jest.mock('@libs/actions/Policy/Policy', () => ({
    isCurrencySupportedForGlobalReimbursement: jest.fn(() => true),
}));

jest.mock('@libs/WorkflowUtils', () => ({
    getEligibleExistingBusinessBankAccounts: jest.fn(() => []),
}));

jest.mock('@libs/ReimbursementAccountUtils', () => ({
    hasInProgressVBBA: jest.fn(() => false),
}));

const mockPolicy: Policy = {
    ...createRandomPolicy(parseInt(POLICY_ID, 10) || 1),
    id: POLICY_ID,
    type: CONST.POLICY.TYPE.CORPORATE,
    outputCurrency: CONST.CURRENCY.USD,
    pendingAction: null,
    role: CONST.POLICY.ROLE.ADMIN,
};

const renderComponent = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <WorkspaceInvoiceVBASection policyID={POLICY_ID} />
        </ComposeProviders>,
    );
};

describe('WorkspaceInvoiceVBASection - Modal Features', () => {
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

    describe('Currency Change Confirm Modal', () => {
        it('should show currency change confirm modal when currency is not supported for global reimbursement', async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const {isCurrencySupportedForGlobalReimbursement} = require('@libs/actions/Policy/Policy');
            (isCurrencySupportedForGlobalReimbursement as jest.Mock).mockReturnValue(false);

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    outputCurrency: 'GBP',
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            // Trigger the add bank account press
            mockCapturedOnAddBankAccountPress?.();
            await waitForBatchedUpdatesWithAct();

            // Verify showConfirmModal was called with currency change prompt
            expect(mockShowConfirmModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    danger: true,
                    shouldShowCancelButton: true,
                }),
            );
        });

        it('should navigate to currency page when user confirms currency change', async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const {isCurrencySupportedForGlobalReimbursement} = require('@libs/actions/Policy/Policy');
            (isCurrencySupportedForGlobalReimbursement as jest.Mock).mockReturnValue(false);
            mockShowConfirmModal.mockResolvedValue({action: 'CONFIRM'});

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    outputCurrency: 'GBP',
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            mockCapturedOnAddBankAccountPress?.();
            await waitForBatchedUpdatesWithAct();

            // Allow promise to resolve
            await act(async () => {
                await Promise.resolve();
            });

            // Verify navigation to currency change route
            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should reset payment method data when user dismisses currency change modal', async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const {isCurrencySupportedForGlobalReimbursement} = require('@libs/actions/Policy/Policy');
            (isCurrencySupportedForGlobalReimbursement as jest.Mock).mockReturnValue(false);
            mockShowConfirmModal.mockResolvedValue({action: 'CLOSE'});

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    outputCurrency: 'GBP',
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            mockCapturedOnAddBankAccountPress?.();
            await waitForBatchedUpdatesWithAct();

            // Allow promise to resolve
            await act(async () => {
                await Promise.resolve();
            });

            // Should NOT navigate when modal is dismissed
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should not show currency modal when currency is supported', async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const {isCurrencySupportedForGlobalReimbursement} = require('@libs/actions/Policy/Policy');
            (isCurrencySupportedForGlobalReimbursement as jest.Mock).mockReturnValue(true);

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            mockCapturedOnAddBankAccountPress?.();
            await waitForBatchedUpdatesWithAct();

            // Should NOT show confirm modal when currency is supported
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });
    });

    describe('Delete Payment Method Confirm Modal', () => {
        it('should include a delete menu item in three dots menu', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            // Simulate pressing a payment method to populate the three dots menu
            mockCapturedOnThreeDotsMenuPress?.({
                event: {currentTarget: document.createElement('div')},
                accountData: {bankAccountID: 12345, addressName: 'Test Bank'},
                accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                methodID: 12345,
                icon: undefined,
                description: 'Test Bank Account',
            });

            await waitForBatchedUpdatesWithAct();

            // The delete menu item should be present
            const deleteItem = mockCapturedThreeDotsMenuItems?.find((item) => item.text === 'Delete');
            expect(deleteItem).toBeDefined();
        });

        it('should show delete confirm modal when delete menu item is selected', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            // Simulate pressing a payment method
            mockCapturedOnThreeDotsMenuPress?.({
                event: {currentTarget: document.createElement('div')},
                accountData: {bankAccountID: 12345, addressName: 'Test Bank'},
                accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                methodID: 12345,
                icon: undefined,
                description: 'Test Bank Account',
            });

            await waitForBatchedUpdatesWithAct();

            // Press the delete menu item
            const deleteItem = mockCapturedThreeDotsMenuItems?.find((item) => item.text === 'Delete');
            deleteItem?.onSelected?.();
            await waitForBatchedUpdatesWithAct();

            // closeModal from @userActions/Modal should be called first, then showConfirmModal
            expect(mockCloseActionModal).toHaveBeenCalled();
            expect(mockShowConfirmModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    danger: true,
                    shouldShowCancelButton: true,
                }),
            );
        });

        it('should call deletePaymentBankAccount when user confirms deletion', async () => {
            mockShowConfirmModal.mockResolvedValue({action: 'CONFIRM'});

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            // Simulate pressing a payment method
            mockCapturedOnThreeDotsMenuPress?.({
                event: {currentTarget: document.createElement('div')},
                accountData: {bankAccountID: 12345, addressName: 'Test Bank'},
                accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                methodID: 12345,
                icon: undefined,
                description: 'Test Bank Account',
            });

            await waitForBatchedUpdatesWithAct();

            // Press the delete menu item
            const deleteItem = mockCapturedThreeDotsMenuItems?.find((item) => item.text === 'Delete');
            deleteItem?.onSelected?.();

            // Allow promises to resolve
            await act(async () => {
                await Promise.resolve();
                await Promise.resolve();
            });

            expect(mockDeletePaymentBankAccount).toHaveBeenCalledWith(12345, undefined);
        });

        it('should not delete when user dismisses the delete confirm modal', async () => {
            mockShowConfirmModal.mockResolvedValue({action: 'CLOSE'});

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            // Simulate pressing a payment method
            mockCapturedOnThreeDotsMenuPress?.({
                event: {currentTarget: document.createElement('div')},
                accountData: {bankAccountID: 12345, addressName: 'Test Bank'},
                accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                methodID: 12345,
                icon: undefined,
                description: 'Test Bank Account',
            });

            await waitForBatchedUpdatesWithAct();

            const deleteItem = mockCapturedThreeDotsMenuItems?.find((item) => item.text === 'Delete');
            deleteItem?.onSelected?.();

            await act(async () => {
                await Promise.resolve();
                await Promise.resolve();
            });

            // Should NOT call delete when modal is dismissed
            expect(mockDeletePaymentBankAccount).not.toHaveBeenCalled();
        });
    });

    describe('Make Default Payment Method', () => {
        it('should include set default menu item when payment method is not default', async () => {
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
                    ...mockPolicy,
                    invoice: {bankAccount: {transferBankAccountID: 99999}},
                });
                await waitForBatchedUpdatesWithAct();
            });

            renderComponent();
            await waitForBatchedUpdatesWithAct();

            // Simulate pressing a non-default payment method (different methodID than transferBankAccountID)
            mockCapturedOnThreeDotsMenuPress?.({
                event: {currentTarget: document.createElement('div')},
                accountData: {bankAccountID: 12345, addressName: 'Test Bank'},
                accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                methodID: 12345,
                icon: undefined,
                description: 'Test Bank Account',
            });

            await waitForBatchedUpdatesWithAct();

            // The set default menu item should be present
            const setDefaultItem = mockCapturedThreeDotsMenuItems?.find((item) => item.text === 'Make default payment method');
            expect(setDefaultItem).toBeDefined();
        });
    });
});
