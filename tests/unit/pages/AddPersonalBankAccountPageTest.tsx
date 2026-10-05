import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {AddPersonalBankAccountNavigatorParamList, RightModalNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import AddPersonalBankAccountPage from '@pages/AddPersonalBankAccountPage';

import {
    cancelPersonalBankAccountEdit,
    clearPersonalBankAccount,
    startPersonalBankAccountEdit,
    updateAddPersonalBankAccountDraft,
    updatePersonalBankAccountCurrentPage,
} from '@userActions/BankAccounts';
import type * as FormActions from '@userActions/FormActions';
import {clearDraftValues} from '@userActions/FormActions';
import {openReport} from '@userActions/Report';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ValueOf} from 'type-fest';

import {PortalProvider} from '@gorhom/portal';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import * as ReactNavigation from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('react-native-plaid-link-sdk', () => ({
    create: jest.fn(),
    dismissLink: jest.fn(),
    open: jest.fn(),
    openLink: jest.fn(),
    usePlaidEmitter: jest.fn(),
}));

jest.mock('@userActions/BankAccounts', () => ({
    addPersonalBankAccount: jest.fn(),
    cancelPersonalBankAccountEdit: jest.fn(),
    clearPersonalBankAccount: jest.fn(),
    finishPersonalBankAccountEdit: jest.fn(),
    startPersonalBankAccountEdit: jest.fn(),
    updateAddPersonalBankAccountDraft: jest.fn(),
    updatePersonalBankAccountCurrentPage: jest.fn(),
}));

jest.mock('@userActions/FormActions', () => ({
    ...jest.requireActual<typeof FormActions>('@userActions/FormActions'),
    clearDraftValues: jest.fn(),
}));

jest.mock('@userActions/PaymentMethods', () => ({
    continueSetup: jest.fn(),
}));

jest.mock('@userActions/Report', () => ({
    openReport: jest.fn(),
}));

let mockResumeStateLoading: boolean | undefined;
jest.mock(
    '@src/types/utils/isLoadingOnyxValue',
    () =>
        (...args: Parameters<typeof isLoadingOnyxValue>) =>
            mockResumeStateLoading ?? args.some((result) => result.status === 'loading'),
);

const closeRHPFlowSpy = jest.spyOn(Navigation, 'closeRHPFlow').mockImplementation(() => {});
const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
const dismissModalWithReportSpy = jest.spyOn(Navigation, 'dismissModalWithReport').mockImplementation(() => {});

let mockIsFocused = true;

jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNavigation,
        useIsFocused: () => mockIsFocused,
    };
});

type TestRootParamList = {
    [NAVIGATORS.TAB_NAVIGATOR]: ReactNavigation.NavigatorScreenParams<TabNavigatorParamList>;
    [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: ReactNavigation.NavigatorScreenParams<RightModalNavigatorParamList>;
};

const RootStack = createRootStackNavigator<TestRootParamList>();
const TabNav = createBottomTabNavigator<TabNavigatorParamList>();
const AddPersonalBankAccountStack = createPlatformStackNavigator<AddPersonalBankAccountNavigatorParamList>();
let initialSubPage: ValueOf<typeof CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES> = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.SUCCESS;
let initialAction: 'edit' | undefined;
let shouldUseInitialSubPage = true;

const getEmptyComponent = () => jest.fn();

const TAB_ROUTES = [
    {name: SCREENS.HOME},
    {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
    {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
    {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
    {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
];

function TestTabNavigator() {
    return (
        <TabNav.Navigator screenOptions={{headerShown: false}}>
            {TAB_ROUTES.map((route) => (
                <TabNav.Screen
                    key={route.name}
                    name={route.name}
                    component={getEmptyComponent()}
                />
            ))}
        </TabNav.Navigator>
    );
}

/** Renders the real page on the selected subpage. */
function TestRightModalNavigator() {
    return (
        <AddPersonalBankAccountStack.Navigator>
            <AddPersonalBankAccountStack.Screen
                name={SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT}
                component={AddPersonalBankAccountPage}
                initialParams={shouldUseInitialSubPage ? {subPage: initialSubPage, action: initialAction} : undefined}
            />
        </AddPersonalBankAccountStack.Navigator>
    );
}

/**
 * Mounts the page inside the RHP with the given tab focused underneath, so it resolves the active tab from
 * an attached navigationRef, as it does in the app.
 */
async function renderPageOverTab(focusedTabIndex: number) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <ReactNavigation.NavigationContainer
                    ref={navigationRef}
                    initialState={{
                        index: 1,
                        routes: [
                            {
                                name: NAVIGATORS.TAB_NAVIGATOR,
                                state: {index: focusedTabIndex, routes: TAB_ROUTES},
                            },
                            {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                        ],
                    }}
                >
                    <RootStack.Navigator>
                        <RootStack.Screen
                            name={NAVIGATORS.TAB_NAVIGATOR}
                            component={TestTabNavigator}
                        />
                        <RootStack.Screen
                            name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                            component={TestRightModalNavigator}
                        />
                    </RootStack.Navigator>
                </ReactNavigation.NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );

    await waitForBatchedUpdatesWithAct();
}

async function setCompletedManualBankAccountDraft() {
    await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
        setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
        routingNumber: '123456789',
        accountNumber: '1234',
    });
}

function getGoBackAfterTransition(): (() => void) | undefined {
    const options = goBackSpy.mock.calls.at(0)?.at(1);
    if (typeof options !== 'object' || options === null || !('afterTransition' in options)) {
        return undefined;
    }
    const {afterTransition} = options;
    return typeof afterTransition === 'function' ? afterTransition : undefined;
}

describe('AddPersonalBankAccountPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsFocused = true;
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.SUCCESS;
        initialAction = undefined;
        shouldUseInitialSubPage = true;
        mockResumeStateLoading = undefined;
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await setCompletedManualBankAccountDraft();
        });
    });

    it('closes the RHP when the flow was started from the Home tab', async () => {
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === SCREENS.HOME));

        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        expect(closeRHPFlowSpy).toHaveBeenCalledTimes(1);
        expect(goBackSpy).not.toHaveBeenCalled();
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    // Settings is a tab as well, so this branch was unreachable too while the switch read the root route name
    it('returns to the wallet when the flow was started from the Settings tab', async () => {
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        expect(goBackSpy.mock.calls.at(0)?.at(0)).toBe(ROUTES.SETTINGS_WALLET);
        expect(closeRHPFlowSpy).not.toHaveBeenCalled();
    });

    it('clears completed Wallet state only after the success exit transition', async () => {
        // Given a completed Wallet setup on the success page
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                shouldShowSuccess: true,
            });
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // When Continue starts navigating back to Wallet
        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        // Then setup prerequisites remain available until the transition has finished
        expect(clearPersonalBankAccount).not.toHaveBeenCalled();
        expect(clearDraftValues).not.toHaveBeenCalled();

        act(() => getGoBackAfterTransition()?.());

        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
        expect(clearPersonalBankAccount).toHaveBeenCalledWith();
    });

    it('clears an abandoned Wallet draft before returning from the first US setup page', async () => {
        // Given a Wallet-owned manual setup on its first page
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS,
            });
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // When the user explicitly leaves from the first page
        fireEvent.press(screen.getByLabelText('Back'));

        // Then the abandoned setup is cleared before returning to Wallet
        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
        expect(clearPersonalBankAccount).toHaveBeenCalledWith();
        expect(goBackSpy).toHaveBeenCalledWith();
    });

    it('resumes the saved page in a manual Wallet setup', async () => {
        // Given a completed manual connection saved on the phone-number page
        shouldUseInitialSubPage = false;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER,
            });
            await Onyx.merge(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                legalFirstName: 'Ada',
                legalLastName: 'Lovelace',
                addressStreet: '1 Main St',
                addressCity: 'New York',
                addressState: 'NY',
                addressZipCode: '10001',
                country: CONST.COUNTRY.US,
            });
        });

        // When the Wallet flow is reopened
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // Then it resumes and persists the exact saved page
        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER);
    });

    it('does not let the confirmation route overwrite a pending Wallet edit', async () => {
        // Given a valid Plaid connection with a legal-name edit persisted across dismissal
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.CONFIRMATION;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
                currentPageAction: 'edit',
                editDraftSnapshot: {
                    pageName: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
                    personalBankAccountDraft: {
                        setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                        selectedPlaidAccountID: 'plaid-account-1',
                        legalFirstName: 'Alberta',
                        legalLastName: 'Charleson',
                    },
                },
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                selectedPlaidAccountID: 'plaid-account-1',
                legalFirstName: 'Alberta2',
                legalLastName: 'Charleson',
            });
            await Onyx.set(ONYXKEYS.PLAID_DATA, {
                plaidAccessToken: 'access-token',
                errors: {},
                bankAccounts: [
                    {
                        accountNumber: '1234',
                        addressName: 'Plaid checking',
                        plaidAccountID: 'plaid-account-1',
                        routingNumber: '123456789',
                        mask: '1234',
                        plaidAccessToken: '',
                        bankName: 'Plaid Bank',
                    },
                ],
            });
        });

        // When dismissal briefly focuses the underlying confirmation route
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // Then confirmation does not replace the exact pending edit destination
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.CONFIRMATION);
    });

    it('resumes a validated Plaid page without overwriting it while resume state is loading', async () => {
        // Given a Wallet Plaid setup saved on the phone-number page while its resume state is still loading
        shouldUseInitialSubPage = false;
        mockResumeStateLoading = true;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                selectedPlaidAccountID: 'plaid-account-1',
                legalFirstName: 'Ada',
                legalLastName: 'Lovelace',
                addressStreet: '1 Main St',
                addressCity: 'New York',
                addressState: 'NY',
                addressZipCode: '10001',
                country: CONST.COUNTRY.US,
            });
            await Onyx.set(ONYXKEYS.PLAID_DATA, {
                plaidAccessToken: 'access-token',
                errors: {},
                bankAccounts: [
                    {
                        accountNumber: '1234',
                        addressName: 'Plaid checking',
                        plaidAccountID: 'plaid-account-1',
                        routingNumber: '123456789',
                        mask: '1234',
                        plaidAccessToken: '',
                        bankName: 'Plaid Bank',
                    },
                ],
            });
        });

        // When the page mounts before resume-state hydration completes
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // Then the temporary first page is not persisted over the saved destination
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalled();

        // When hydration completes and the saved route finishes redirecting
        mockResumeStateLoading = false;
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {isLoading: false});
            await waitForBatchedUpdatesWithAct();
        });

        // Then the top-level Plaid token validates the saved page and only that page is persisted
        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledTimes(1);
        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER);
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT);
    });

    it('redirects an incomplete Plaid deep link to the connection page', async () => {
        // Given a Wallet Plaid setup without an access token and a URL targeting a later page
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                selectedPlaidAccountID: 'plaid-account-1',
            });
            await Onyx.set(ONYXKEYS.PLAID_DATA, {
                plaidAccessToken: '',
                errors: {},
                bankAccounts: [],
            });
        });

        // When the deep link is opened
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // Then prerequisite validation redirects to Plaid without saving the invalid page
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT), {forceReplace: true});
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalled();
    });

    it('redirects an incomplete manual deep link to the account-details page', async () => {
        // Given a Wallet manual setup without routing and account numbers and a URL targeting confirmation
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.CONFIRMATION;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
            });
        });

        // When the deep link is opened
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // Then prerequisite validation redirects to manual setup without saving the invalid page
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS), {
            forceReplace: true,
        });
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalled();
    });

    it('saves a selected Wallet Plaid account immediately', async () => {
        // Given a Wallet Plaid setup with an available account
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
            });
            await Onyx.set(ONYXKEYS.PLAID_DATA, {
                plaidAccessToken: 'access-token',
                bankName: 'Plaid Bank',
                errors: {},
                bankAccounts: [
                    {
                        accountNumber: '1234',
                        addressName: 'Plaid Checking',
                        plaidAccountID: 'plaid-account-1',
                        routingNumber: '123456789',
                        mask: '1234',
                        plaidAccessToken: '',
                        bankName: 'Plaid Bank',
                    },
                ],
            });
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // When the user selects an account
        fireEvent.press(screen.getByText('Plaid Checking'));

        // Then the selection is durable even if the modal is dismissed before confirmation
        expect(updateAddPersonalBankAccountDraft).toHaveBeenCalledWith({
            selectedPlaidAccountID: 'plaid-account-1',
        });
    });

    it('restores the previous Wallet draft when leaving a reopened edit with Back', async () => {
        // Given a dismissed legal-name edit with its confirmed values saved for cancellation
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME;
        initialAction = 'edit';
        const editDraftSnapshot = {
            pageName: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
            personalBankAccountDraft: {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
                routingNumber: '123456789',
                accountNumber: '1234',
                legalFirstName: 'Alberta',
                legalLastName: 'Charleson',
            },
        };
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
                currentPageAction: 'edit',
                editDraftSnapshot,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                ...editDraftSnapshot.personalBankAccountDraft,
                legalFirstName: 'Alberta4',
            });
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // When Back cancels the reopened edit without confirmation
        fireEvent.press(screen.getByLabelText('Back'));

        // Then the durable pre-edit snapshot is restored
        expect(cancelPersonalBankAccountEdit).toHaveBeenCalledWith(editDraftSnapshot, CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.CONFIRMATION);
    });

    it('stores the confirmed Wallet draft before opening an edit page', async () => {
        // Given a completed Wallet draft displayed on confirmation
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.CONFIRMATION;
        const personalBankAccountDraft = {
            setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
            routingNumber: '123456789',
            accountNumber: '1234',
            legalFirstName: 'Alberta',
            legalLastName: 'Charleson',
            phoneNumber: '+15005550006',
        };
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, personalBankAccountDraft);
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // When the legal-name row opens its edit page
        fireEvent.press(screen.getByTestId('legal-name'), {nativeEvent: {}});

        // Then the confirmed draft is retained as the cancellation baseline
        expect(startPersonalBankAccountEdit).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME, {
            pageName: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
            personalBankAccountDraft,
            homeAddressDraft: null,
        });
    });

    it('closes the RHP when the flow was started from the Search tab', async () => {
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));

        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        expect(closeRHPFlowSpy).toHaveBeenCalledTimes(1);
        expect(goBackSpy).not.toHaveBeenCalled();
    });

    it('fetches the exit report again once the bank account is added, before the flow is closed', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {exitReportID: '123'});
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));
        expect(openReport).not.toHaveBeenCalled();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                shouldShowSuccess: true,
            });
        });

        expect(openReport).toHaveBeenCalledTimes(1);
        expect(openReport).toHaveBeenCalledWith(expect.objectContaining({reportID: '123', shouldMarkAsRead: false}));
        expect(closeRHPFlowSpy).not.toHaveBeenCalled();
    });

    it('fetches the exit report only once and keeps the existing navigation when the flow is closed', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                exitReportID: '123',
                shouldShowSuccess: true,
            });
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        fireEvent.press(screen.getByTestId('confirmation-primary-button'));
        await waitForBatchedUpdatesWithAct();

        expect(openReport).toHaveBeenCalledTimes(1);
        expect(closeRHPFlowSpy).toHaveBeenCalledTimes(1);
        expect(dismissModalWithReportSpy).not.toHaveBeenCalled();
    });

    it('does not fetch the exit report when the bank account was not added', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {exitReportID: '123'});
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        expect(openReport).not.toHaveBeenCalled();
        expect(closeRHPFlowSpy).toHaveBeenCalledTimes(1);
    });
});
