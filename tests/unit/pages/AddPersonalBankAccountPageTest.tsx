import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {AddPersonalBankAccountNavigatorParamList, RightModalNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import AddPersonalBankAccountPage from '@pages/AddPersonalBankAccountPage';

import {clearPersonalBankAccount, updatePersonalBankAccountCurrentPage} from '@userActions/BankAccounts';
import type * as FormActions from '@userActions/FormActions';
import {clearDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigation from '@react-navigation/native';
import type {NavigatorScreenParams} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';

import {PortalProvider} from '@gorhom/portal';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
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
    clearPersonalBankAccount: jest.fn(),
    updatePersonalBankAccountCurrentPage: jest.fn(),
}));

jest.mock('@userActions/FormActions', () => ({
    ...jest.requireActual<typeof FormActions>('@userActions/FormActions'),
    clearDraftValues: jest.fn(),
}));

jest.mock('@userActions/PaymentMethods', () => ({
    continueSetup: jest.fn(),
}));

const closeRHPFlowSpy = jest.spyOn(Navigation, 'closeRHPFlow').mockImplementation(() => {});
const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
let mockIsFocused = true;

jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNavigation,
        useIsFocused: () => mockIsFocused,
    };
});

type TestRootParamList = {
    [NAVIGATORS.TAB_NAVIGATOR]: NavigatorScreenParams<TabNavigatorParamList>;
    [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<RightModalNavigatorParamList>;
};

const RootStack = createRootStackNavigator<TestRootParamList>();
const TabNav = createBottomTabNavigator<TabNavigatorParamList>();
const AddPersonalBankAccountStack = createPlatformStackNavigator<AddPersonalBankAccountNavigatorParamList>();
let initialSubPage: ValueOf<typeof CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES> = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.SUCCESS;
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
                initialParams={shouldUseInitialSubPage ? {subPage: initialSubPage} : undefined}
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
                <NavigationContainer
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
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );

    await waitForBatchedUpdatesWithAct();
}

describe('AddPersonalBankAccountPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsFocused = true;
        initialSubPage = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.SUCCESS;
        shouldUseInitialSubPage = true;
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
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

        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
        expect(closeRHPFlowSpy).not.toHaveBeenCalled();
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

    it('resumes saved Plaid progress when the selected account has an access token', async () => {
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
                        plaidAccessToken: 'access-token',
                        bankName: 'Plaid Bank',
                    },
                ],
            });
        });

        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR));

        expect(updatePersonalBankAccountCurrentPage).toHaveBeenCalledWith(CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES.PHONE_NUMBER);
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
});
