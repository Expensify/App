import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import type {CurrencyListItem} from '@components/CurrencySelectionList/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import Navigation from '@libs/Navigation/Navigation';
import type * as PolicyPaymentsUtils from '@libs/PolicyUtils/payments';

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
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'policy123';
const mockPolicy = createMock<Policy>({
    id: POLICY_ID,
    name: 'Acme',
    outputCurrency: CONST.CURRENCY.AUD,
});
const directReimbursementPolicy = createMock<Policy>({...mockPolicy, reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES});
let mockEnrollmentRoute = '';
let mockIsBetaEnabled = false;
let mockIsUkEuCurrencySupported = false;
const mockShowConfirmModal = jest.fn();
// The Connections page that opened the currency page on top of itself
const mockDynamicBackPath = `workspaces/${POLICY_ID}/connections`;

jest.mock('@components/CurrencySelectionList', () => {
    const {Pressable, Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({onSelect}: {onSelect: (item: CurrencyListItem) => void}) => (
        <>
            {['USD', 'GBP', 'EUR', 'AUD', 'HKD'].map((currencyCode) => (
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
    default: (): unknown[] => [undefined],
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
    // The real check runs so the tests cover the policy and currency the page passes in
    isCurrencyChangeBlockedByDirectReimbursement: (...args: Parameters<typeof PolicyPaymentsUtils.isCurrencyChangeBlockedByDirectReimbursement>) =>
        jest.requireActual<typeof PolicyPaymentsUtils>('@libs/PolicyUtils/payments').isCurrencyChangeBlockedByDirectReimbursement(...args),
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

function renderPage(shouldStartExpensifyCardEnrollment = true, screenName: string = SCREENS.WORKSPACE.CURRENCY, policy: Policy = mockPolicy) {
    mockUseRoute.mockReturnValue(createMock<ReturnType<typeof useRoute>>({name: screenName, params: {shouldStartExpensifyCardEnrollment}}));
    const props = createMock<WorkspaceOverviewCurrencyPageProps>({policy});
    render(<WorkspaceOverviewCurrencyPage {...props} />);
}

describe('WorkspaceOverviewCurrencyPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockEnrollmentRoute = ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: POLICY_ID, backTo: ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(POLICY_ID)});
        mockIsBetaEnabled = false;
        mockIsUkEuCurrencySupported = false;
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
    });

    it('opens the add bank account flow after selecting USD when no eligible account exists', async () => {
        renderPage();

        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.USD}`));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).toHaveBeenCalledWith(
            ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({
                policyID: POLICY_ID,
                backTo: ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(POLICY_ID),
            }),
            {forceReplace: true},
        );
    });

    it('opens the bank account selector after selecting a supported currency when an eligible account exists', async () => {
        mockEnrollmentRoute = ROUTES.WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT.getRoute(POLICY_ID);
        mockIsBetaEnabled = true;
        mockIsUkEuCurrencySupported = true;
        renderPage();

        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.GBP}`));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT.getRoute(POLICY_ID), {forceReplace: true});
    });

    it('does not start enrollment after selecting an unsupported currency', async () => {
        renderPage();

        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.AUD}`));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledWith(Navigation.goBack);
    });

    it('preserves the normal currency selection behavior outside Expensify Card enrollment', async () => {
        renderPage(false);

        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.USD}`));
        await waitForBatchedUpdatesWithAct();

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledWith(Navigation.goBack);
    });

    it('sends the admin to Workflows instead of changing a currency that Direct reimbursement blocks', async () => {
        // Given a workspace on Direct reimbursement, which the server won't let switch to HKD
        renderPage(false, SCREENS.WORKSPACE.CURRENCY, directReimbursementPolicy);

        // When the admin picks HKD and confirms the explanation
        fireEvent.press(screen.getByTestId('currency-HKD'));
        await waitFor(() => expect(mockNavigate).toHaveBeenCalled());

        // Then the admin lands on the Payments tab of Workflows to change reimbursement, and no currency change reaches the server
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: 'workspace.editor.directReimbursementCurrencyTitle'}));
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_WORKFLOWS.getRoute(POLICY_ID, CONST.TAB.WORKFLOWS.PAYMENTS));
        expect(updateGeneralSettings).not.toHaveBeenCalled();
    });

    it('keeps the currency unchanged when the admin dismisses the Direct reimbursement explanation', async () => {
        // Given a workspace on Direct reimbursement and an admin who cancels the explanation
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
        renderPage(false, SCREENS.WORKSPACE.CURRENCY, directReimbursementPolicy);

        // When the admin picks HKD
        fireEvent.press(screen.getByTestId('currency-HKD'));
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalled());

        // Then the admin stays on the picker and nothing is sent
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(updateGeneralSettings).not.toHaveBeenCalled();
    });

    it('changes the currency without the explanation when Direct reimbursement supports it', async () => {
        // Given a workspace on Direct reimbursement, where the server accepts GBP
        renderPage(false, SCREENS.WORKSPACE.CURRENCY, directReimbursementPolicy);

        // When the admin picks GBP
        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.GBP}`));
        await waitForBatchedUpdatesWithAct();

        // Then the change is sent with no explanation, so supported currencies are not blocked
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(updateGeneralSettings).toHaveBeenCalledWith(directReimbursementPolicy, directReimbursementPolicy.name, CONST.CURRENCY.GBP, undefined, expect.anything());
    });

    it('goes back to the page that opened it once a currency is chosen on top of that page', async () => {
        // Given the currency page opened on top of the Connections page by the Digits currency prompt
        renderPage(false, SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_CURRENCY);

        // When the admin picks USD
        fireEvent.press(screen.getByTestId(`currency-${CONST.CURRENCY.USD}`));
        await waitForBatchedUpdatesWithAct();
        jest.mocked(Navigation.setNavigationActionToMicrotaskQueue).mock.calls.at(0)?.at(0)?.();

        // Then the page closes back to the Connections page, the same page a reload keeps under it
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalledWith(mockDynamicBackPath);
    });
});
