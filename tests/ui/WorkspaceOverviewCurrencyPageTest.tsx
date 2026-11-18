import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import Navigation from '@libs/Navigation/Navigation';

import {WorkspaceOverviewCurrencyPage} from '@pages/workspace/WorkspaceOverviewCurrencyPage';
import type {WorkspaceOverviewCurrencyPageProps} from '@pages/workspace/WorkspaceOverviewCurrencyPage';

import {updateGeneralSettings} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type ReactNative from 'react-native';

import {useRoute} from '@react-navigation/native';
import React from 'react';

import createMock from '../utils/createMock';

const POLICY_ID = 'policy123';
const mockPolicy = createMock<Policy>({
    id: POLICY_ID,
    name: 'Acme',
    outputCurrency: CONST.CURRENCY.AUD,
});
let mockEnrollmentRoute = '';
let mockIsBetaEnabled = false;
let mockIsUkEuCurrencySupported = false;
let mockIsCurrencyChangeBlockedByDirectReimbursement = false;
const mockShowConfirmModal = jest.fn();
const mockOnyxKeys = ONYXKEYS;
// The Connections page that opened the currency page on top of itself
const mockDynamicBackPath = `workspaces/${POLICY_ID}/connections`;

jest.mock('@components/CurrencySelectionList', () => {
    const {Pressable, Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({onSelect}: {onSelect: (item: CurrencyListItem) => void}) => (
        <>
            {['USD', 'GBP', 'EUR', 'AUD'].map((currencyCode) => (
                <Pressable
                    key={currencyCode}
                    testID={`currency-${currencyCode}`}
                    accessibilityRole="button"
                    onPress={() =>
                        onSelect({
                            currencyCode,
                            currencyName: currencyCode,
                            keyForList: currencyCode,
                            text: currencyCode,
                        })
                    }
                >
                    <Text>{currencyCode}</Text>
                </Pressable>
            ))}
        </>
    );
});
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));
jest.mock('@hooks/useDynamicBackPath', () => ({
    __esModule: true,
    default: () => mockDynamicBackPath,
}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string): unknown[] => {
        if (key === mockOnyxKeys.BANK_ACCOUNT_LIST || key === mockOnyxKeys.CARD_SUPPORTED_COUNTRIES) {
            return [{}];
        }
        if (key === mockOnyxKeys.REIMBURSEMENT_ACCOUNT) {
            return [{achData: {}}];
        }
        return [undefined];
    },
}));
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => mockIsBetaEnabled}),
}));
jest.mock('@hooks/useReviewWorkspaceSettingsTaskCompletion', () => ({
    __esModule: true,
    default: () => jest.fn(),
}));
jest.mock('@hooks/useShouldBlockCurrencyChange', () => ({
    __esModule: true,
    default: () => false,
}));
jest.mock('@libs/CardUtils', () => ({
    getExpensifyCardEnrollmentRoute: () => mockEnrollmentRoute,
    isCurrencySupportedForECards: () => mockIsUkEuCurrencySupported,
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        goBack: jest.fn(),
        navigate: jest.fn(),
        setNavigationActionToMicrotaskQueue: jest.fn(),
    },
}));
jest.mock('@libs/PolicyUtils', () => ({
    goBackFromInvalidPolicy: jest.fn(),
    isCurrencyChangeBlockedByDirectReimbursement: () => mockIsCurrencyChangeBlockedByDirectReimbursement,
}));
jest.mock('@libs/ReimbursementAccountUtils', () => ({
    hasInProgressUSDVBBA: () => false,
}));
jest.mock('@libs/WorkflowUtils', () => ({
    getEligibleExistingBusinessBankAccounts: () => [],
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('@userActions/BankAccounts', () => ({
    clearCorpayBankAccountFields: jest.fn(),
}));
jest.mock('@userActions/FormActions', () => ({clearDraftValues: jest.fn()}));
jest.mock('@userActions/Policy/Policy', () => ({
    isCurrencySupportedForGlobalReimbursement: () => false,
    updateGeneralSettings: jest.fn(),
}));
jest.mock('@userActions/ReimbursementAccount', () => ({
    navigateToBankAccountRoute: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
    createNavigationContainerRef: () => ({}),
    useRoute: jest.fn(),
}));

const mockUseRoute = jest.mocked(useRoute);
const mockNavigate = jest.mocked(Navigation.navigate);

function renderPage(shouldStartExpensifyCardEnrollment = true, screenName: string = SCREENS.WORKSPACE.CURRENCY) {
    mockUseRoute.mockReturnValue(createMock<ReturnType<typeof useRoute>>({name: screenName, params: {shouldStartExpensifyCardEnrollment}}));
    const props = createMock<WorkspaceOverviewCurrencyPageProps>({policy: mockPolicy});
    render(<WorkspaceOverviewCurrencyPage {...props} />);
}

describe('WorkspaceOverviewCurrencyPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockEnrollmentRoute = ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: POLICY_ID, backTo: ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(POLICY_ID)});
        mockIsBetaEnabled = false;
        mockIsUkEuCurrencySupported = false;
        mockIsCurrencyChangeBlockedByDirectReimbursement = false;
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
    });

    it('opens the add bank account flow after selecting USD when no eligible account exists', () => {
        renderPage();

        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.USD}`));

        expect(mockNavigate).toHaveBeenCalledWith(
            ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({
                policyID: POLICY_ID,
                backTo: ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(POLICY_ID),
            }),
            {forceReplace: true},
        );
    });

    it('opens the bank account selector after selecting a supported currency when an eligible account exists', () => {
        mockEnrollmentRoute = ROUTES.WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT.getRoute(POLICY_ID);
        mockIsBetaEnabled = true;
        mockIsUkEuCurrencySupported = true;
        renderPage();

        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.GBP}`));

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT.getRoute(POLICY_ID), {forceReplace: true});
    });

    it('does not start enrollment after selecting an unsupported currency', () => {
        renderPage();

        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.AUD}`));

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledWith(Navigation.goBack);
    });

    it('preserves the normal currency selection behavior outside Expensify Card enrollment', () => {
        renderPage(false);

        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.USD}`));

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledWith(Navigation.goBack);
    });

    it('sends the admin to Workflows instead of changing a currency that Direct reimbursement blocks', async () => {
        // Given a workspace whose Direct reimbursement makes the server reject the picked currency
        mockIsCurrencyChangeBlockedByDirectReimbursement = true;
        renderPage(false);

        // When the admin picks the currency and confirms the explanation
        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.GBP}`));
        await waitFor(() => expect(mockNavigate).toHaveBeenCalled());

        // Then the admin lands on the Payments tab of Workflows to change reimbursement, and no currency change reaches the server
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: 'workspace.editor.directReimbursementCurrencyTitle'}));
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS.getRoute(POLICY_ID, CONST.TAB.WORKFLOWS.PAYMENTS));
        expect(updateGeneralSettings).not.toHaveBeenCalled();
    });

    it('keeps the currency unchanged when the admin dismisses the Direct reimbursement explanation', async () => {
        // Given a blocked currency and an admin who cancels the explanation
        mockIsCurrencyChangeBlockedByDirectReimbursement = true;
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
        renderPage(false);

        // When the admin picks the currency
        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.GBP}`));
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalled());

        // Then the admin stays on the picker and nothing is sent
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(updateGeneralSettings).not.toHaveBeenCalled();
    });

    it('goes back to the page that opened it once a currency is chosen on top of that page', () => {
        // Given the currency page opened on top of the Connections page by the Digits currency prompt
        renderPage(false, SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_CURRENCY);

        // When the admin picks USD
        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.USD}`));
        jest.mocked(Navigation.setNavigationActionToMicrotaskQueue).mock.calls.at(0)?.at(0)?.();

        // Then the page closes back to the Connections page, the same page a reload keeps under it
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledWith(mockDynamicBackPath);
    });
});
