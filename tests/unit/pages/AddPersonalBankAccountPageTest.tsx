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
    finishPersonalBankAccountEdit,
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

import getOnyxValue from '../../utils/getOnyxValue';
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
                        routes: [{name: NAVIGATORS.TAB_NAVIGATOR, state: {index: focusedTabIndex, routes: TAB_ROUTES}}, {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}],
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
        });
    });

    it('closes the RHP when the flow was started from the Home tab', async () => {
        await act(setCompletedManualBankAccountDraft);
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === SCREENS.HOME));

        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        expect(closeRHPFlowSpy).toHaveBeenCalledTimes(1);
        expect(goBackSpy).not.toHaveBeenCalled();
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    // Settings is a tab as well, so this branch was unreachable too while the switch read the root route name
    it('returns to the wallet when the flow was started from the Settings tab', async () => {
        await act(setCompletedManualBankAccountDraft);
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        expect(goBackSpy).toHaveBeenCalledTimes(1);
        const [backToRoute, options] = goBackSpy.mock.calls.at(0) ?? [];
        expect(backToRoute).toBe(ROUTES.SETTINGS_WALLET);
        expect(options?.afterTransition).toBeInstanceOf(Function);
        expect(closeRHPFlowSpy).not.toHaveBeenCalled();
    });

    it('clears completed Wallet state only after the success exit transition', async () => {
        // Given a completed Wallet setup on the success page
        let runAfterExitTransition: (() => void) | undefined;
        goBackSpy.mockImplementationOnce((_route, options) => {
            runAfterExitTransition = options?.afterTransition;
        });
        await act(async () => {
            await setCompletedManualBankAccountDraft();
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                shouldShowSuccess: true,
            });
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // When Continue starts navigating back to Wallet
        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        // Then setup prerequisites remain available to mounted routes until the transition has finished
        expect(clearPersonalBankAccount).not.toHaveBeenCalled();
        expect(clearDraftValues).not.toHaveBeenCalled();
        expect(navigateSpy).not.toHaveBeenCalled();

        act(() => runAfterExitTransition?.());

        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
        expect(clearPersonalBankAccount).toHaveBeenCalledWith();
    });

    it('clears an abandoned Wallet draft before returning from the first US setup page', async () => {
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
                routingNumber: '123456789',
                accountNumber: '1234',
            });
        });

        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        fireEvent.press(screen.getByLabelText('Back'));

        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.HOME_ADDRESS_FORM);
        expect(clearPersonalBankAccount).toHaveBeenCalledWith();
        expect(goBackSpy).toHaveBeenCalledWith();
    });

    it('updates the saved Wallet page when an earlier route becomes focused again', async () => {
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
                routingNumber: '123456789',
                accountNumber: '1234',
            });
        });

        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));
        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS);

        jest.mocked(updatePersonalBankAccountCurrentPage).mockClear();
        mockIsFocused = false;
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {isLoading: false});
            await waitForBatchedUpdatesWithAct();
        });
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalled();

        mockIsFocused = true;
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {isLoading: true});
            await waitForBatchedUpdatesWithAct();
        });

        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS);
    });

    it('updates the saved reimbursement page when an earlier route becomes focused again', async () => {
        // Given a reimbursement setup whose saved page is newer than the route returning to focus
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                exitReportID: '123',
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
                routingNumber: '123456789',
                accountNumber: '1234',
            });
        });

        // When the earlier route becomes focused
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        // Then the focused page replaces the stale resume location
        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS);
    });

    it('does not let the Wallet confirmation route overwrite a pending field edit during dismissal', async () => {
        // Given the legal-name edit is saved while the underlying confirmation route is still mounted
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
        });

        // When dismissal briefly focuses the underlying confirmation route
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // Then confirmation must not replace the exact pending edit destination
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.CONFIRMATION);
    });

    it('resumes saved Plaid progress when Plaid stores the access token at the top level', async () => {
        shouldUseInitialSubPage = false;
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

        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER);
    });

    it('does not overwrite the saved Wallet page while resume state is loading or redirecting', async () => {
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

        // When the page mounts before resume state hydration completes
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // Then the temporary first page is not persisted over the saved destination
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalled();

        // When hydration completes and the saved route finishes redirecting
        mockResumeStateLoading = false;
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {isLoading: false});
            await waitForBatchedUpdatesWithAct();
        });

        // Then only the validated saved page is persisted
        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledTimes(1);
        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER);
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT);
    });

    it('resumes saved reimbursement Plaid progress when Plaid stores the access token at the top level', async () => {
        // Given a reimbursement Plaid setup dismissed after reaching the phone-number page
        shouldUseInitialSubPage = false;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                exitReportID: '123',
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

        // When the reimbursement setup is reopened
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        // Then the saved page is restored using the top-level Plaid access token
        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER);
    });

    it('reopens the exact Wallet Plaid field edit instead of the confirmation page', async () => {
        // Given the Wallet flow was dismissed from an unconfirmed legal-name edit after connecting through Plaid
        shouldUseInitialSubPage = false;
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
                        accountNumber: '1111',
                        addressName: 'Plaid Saving',
                        plaidAccountID: 'plaid-account-1',
                        routingNumber: '123456789',
                        mask: '1111',
                        plaidAccessToken: '',
                        bankName: 'Plaid Bank',
                    },
                ],
            });
        });

        // When the Wallet Add bank account route opens without an explicit subpage
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // Then it resolves to the saved edit RHP rather than "Let's double check that everything looks right"
        expect(screen.getByDisplayValue('Alberta2')).toBeOnTheScreen();
        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME, 'edit');
    });

    it.each([CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.ADDRESS, CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER])(
        'reopens the skipped Wallet Plaid %s edit instead of confirmation',
        async (savedEditPage) => {
            // Given complete profile details normally skip Legal name, Address, and Phone in the forward flow
            shouldUseInitialSubPage = false;
            const personalBankAccountDraft = {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                selectedPlaidAccountID: 'plaid-account-1',
                legalFirstName: 'Alberta2',
                legalLastName: 'Charleson',
                addressStreet: '1 Main St',
                addressCity: 'New York',
                addressState: 'NY',
                addressZipCode: '10001',
                country: CONST.COUNTRY.US,
                phoneNumber: '+15005550006',
            };
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
                    legalFirstName: 'Alberta',
                    legalLastName: 'Charleson',
                    phoneNumber: '+15005550006',
                    addresses: [{street: '1 Main St', city: 'New York', state: 'NY', zip: '10001', country: CONST.COUNTRY.US, current: true}],
                });
                await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                    source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                    currentPage: savedEditPage,
                    currentPageAction: 'edit',
                    editDraftSnapshot: {
                        pageName: savedEditPage,
                        personalBankAccountDraft,
                    },
                });
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, personalBankAccountDraft);
                await Onyx.set(ONYXKEYS.PLAID_DATA, {
                    plaidAccessToken: 'access-token',
                    errors: {},
                    bankAccounts: [
                        {
                            accountNumber: '1111',
                            addressName: 'Plaid Saving',
                            plaidAccountID: 'plaid-account-1',
                            routingNumber: '123456789',
                            mask: '1111',
                            plaidAccessToken: '',
                            bankName: 'Plaid Bank',
                        },
                    ],
                });
            });

            // When Add bank account is reopened from Wallet
            await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

            // Then an explicit edit destination bypasses normal skip logic and remains the focused RHP
            expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(savedEditPage, 'edit');
        },
    );

    it('saves selected reimbursement Plaid account immediately', async () => {
        // Given a reimbursement Plaid setup with an available account
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {exitReportID: '123'});
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

        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        // When an account is selected
        fireEvent.press(screen.getByText('Plaid Checking'));

        // Then the selection is persisted without waiting for confirmation
        expect(updateAddPersonalBankAccountDraft).toHaveBeenCalledWith({selectedPlaidAccountID: 'plaid-account-1'});
    });

    it('saves edited reimbursement legal name draft before confirming', async () => {
        // Given a reimbursement legal-name edit with confirmed values
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME;
        initialAction = 'edit';
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                exitReportID: '123',
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
                currentPageAction: 'edit',
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
                routingNumber: '123456789',
                accountNumber: '1234',
                legalFirstName: 'Alberta',
                legalLastName: 'Charleson',
            });
        });

        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        // When the first name is edited without confirming
        fireEvent.changeText(screen.getByDisplayValue('Alberta'), 'Alberta4');
        await waitForBatchedUpdatesWithAct();

        // Then the new value is available if the RHP is dismissed and reopened
        expect(await getOnyxValue(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT)).toEqual(
            expect.objectContaining({
                legalFirstName: 'Alberta4',
                legalLastName: 'Charleson',
            }),
        );
    });

    it('does not let an outgoing edit route overwrite the confirmation resume state', async () => {
        // Given a persisted edit whose navigation remains mounted while finishing updates Onyx
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME;
        initialAction = 'edit';
        const editDraftSnapshot = {
            pageName: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
            personalBankAccountDraft: {legalFirstName: 'Alberta', legalLastName: 'Charleson'},
        };
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                exitReportID: '123',
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
                currentPageAction: 'edit',
                editDraftSnapshot,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
                routingNumber: '123456789',
                accountNumber: '1234',
                legalFirstName: 'Alberta',
                legalLastName: 'Charleson',
            });
        });
        jest.mocked(finishPersonalBankAccountEdit).mockImplementationOnce((currentPage) => {
            Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {currentPage, currentPageAction: null, editDraftSnapshot: null});
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));
        jest.mocked(updatePersonalBankAccountCurrentPage).mockClear();

        // When Confirm clears the edit state before the old route unmounts
        fireEvent.press(screen.getByText('Confirm'));
        await waitForBatchedUpdatesWithAct();

        // Then the old route cannot persist itself as the resume destination again
        expect(finishPersonalBankAccountEdit).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.CONFIRMATION);
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME, 'edit');
    });

    it('saves the pre-edit reimbursement drafts before opening an edit page', async () => {
        // Given a completed reimbursement draft displayed on the confirmation page
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
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {exitReportID: '123'});
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, personalBankAccountDraft);
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        // When the legal-name row opens its edit page
        fireEvent.press(screen.getByTestId('legal-name'), {nativeEvent: {}});

        // Then the confirmed draft is retained as the cancellation baseline
        expect(startPersonalBankAccountEdit).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME, {
            pageName: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
            personalBankAccountDraft,
            homeAddressDraft: null,
        });
    });

    it('restores the previous reimbursement legal name draft when leaving edit mode with Back', async () => {
        // Given an edit page opened from confirmation with its original values saved for cancellation
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
                exitReportID: '123',
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
                currentPageAction: 'edit',
                editDraftSnapshot,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
                routingNumber: '123456789',
                accountNumber: '1234',
                legalFirstName: 'Alberta4',
                legalLastName: 'Charleson',
            });
        });

        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        // When the reopened edit page is left with Back without confirming
        fireEvent.press(screen.getByLabelText('Back'));
        await waitForBatchedUpdatesWithAct();

        // Then the durable pre-edit snapshot is restored instead of the unconfirmed persisted value
        expect(cancelPersonalBankAccountEdit).toHaveBeenCalledWith(editDraftSnapshot, CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.CONFIRMATION);
    });

    it('restores the previous reimbursement Plaid account when leaving a reopened edit with Back', async () => {
        // Given a dismissed Plaid edit that persisted a new selection while retaining the previously confirmed selection
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT;
        initialAction = 'edit';
        const editDraftSnapshot = {
            pageName: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT,
            personalBankAccountDraft: {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                selectedPlaidAccountID: 'plaid-account-1',
            },
        };
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                exitReportID: '123',
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT,
                currentPageAction: 'edit',
                editDraftSnapshot,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                selectedPlaidAccountID: 'plaid-account-2',
            });
            await Onyx.set(ONYXKEYS.PLAID_DATA, {
                plaidAccessToken: 'access-token',
                errors: {},
                bankAccounts: [
                    {
                        accountNumber: '1111',
                        addressName: 'Plaid Checking',
                        plaidAccountID: 'plaid-account-1',
                        routingNumber: '123456789',
                        mask: '1111',
                        plaidAccessToken: '',
                        bankName: 'Plaid Bank',
                    },
                    {
                        accountNumber: '2222',
                        addressName: 'Plaid Savings',
                        plaidAccountID: 'plaid-account-2',
                        routingNumber: '123456789',
                        mask: '2222',
                        plaidAccessToken: '',
                        bankName: 'Plaid Bank',
                    },
                ],
            });
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        // When Back cancels the reopened edit without confirmation
        fireEvent.press(screen.getByLabelText('Back'));
        await waitForBatchedUpdatesWithAct();

        // Then the snapshot containing the original Plaid account is restored
        expect(cancelPersonalBankAccountEdit).toHaveBeenCalledWith(editDraftSnapshot, CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.CONFIRMATION);
    });

    it('falls back to the Plaid connection page when saved Plaid progress has no access token', async () => {
        shouldUseInitialSubPage = false;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                selectedPlaidAccountID: 'plaid-account-1',
            });
            await Onyx.set(ONYXKEYS.PLAID_DATA, {
                plaidAccessToken: '',
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

        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT);
    });

    it('redirects a Plaid deep link to the connection page when the access token is missing', async () => {
        // Given a Wallet Plaid setup without a completed connection and a URL targeting a later page
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {source: CONST.BANK_ACCOUNT.SOURCE.WALLET});
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID,
                selectedPlaidAccountID: 'plaid-account-1',
            });
            await Onyx.set(ONYXKEYS.PLAID_DATA, {
                plaidAccessToken: '',
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

        // When the deep link is opened
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // Then it returns to the Plaid connection page without persisting the invalid destination
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PLAID_BANK_ACCOUNT), {forceReplace: true});
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalled();
    });

    it('redirects a manual deep link to the account-details page when the bank details are missing', async () => {
        // Given a Wallet manual setup without routing and account numbers and a URL targeting a later page
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.CONFIRMATION;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {source: CONST.BANK_ACCOUNT.SOURCE.WALLET});
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL});
        });

        // When the deep link is opened
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        // Then it returns to the manual account-details page without persisting the invalid destination
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS), {
            forceReplace: true,
        });
        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalled();
    });

    it('does not resume a saved personal-information page that is skipped', async () => {
        shouldUseInitialSubPage = false;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
                legalFirstName: 'Ada',
                legalLastName: 'Lovelace',
            });
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {
                source: CONST.BANK_ACCOUNT.SOURCE.WALLET,
                currentPage: CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME,
            });
            await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
                routingNumber: '123456789',
                accountNumber: '1234',
                addressStreet: '1 Main St',
                addressCity: 'New York',
                addressState: 'NY',
                addressZipCode: '10001',
                country: CONST.COUNTRY.US,
            });
        });

        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        expect(updatePersonalBankAccountCurrentPage).not.toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.LEGAL_NAME);
        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER);
    });

    it('closes the RHP when the flow was started from the Search tab', async () => {
        await act(setCompletedManualBankAccountDraft);
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
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {shouldShowSuccess: true});
        });

        expect(openReport).toHaveBeenCalledTimes(1);
        expect(openReport).toHaveBeenCalledWith(expect.objectContaining({reportID: '123', shouldMarkAsRead: false}));
        expect(closeRHPFlowSpy).not.toHaveBeenCalled();
    });

    it('fetches the exit report only once and keeps the existing navigation when the flow is closed', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {exitReportID: '123', shouldShowSuccess: true});
            await setCompletedManualBankAccountDraft();
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
            await setCompletedManualBankAccountDraft();
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        expect(openReport).not.toHaveBeenCalled();
        expect(closeRHPFlowSpy).toHaveBeenCalledTimes(1);
    });
});
