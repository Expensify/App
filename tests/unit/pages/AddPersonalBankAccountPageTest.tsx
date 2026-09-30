import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {AddPersonalBankAccountNavigatorParamList, RightModalNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import AddPersonalBankAccountPage from '@pages/AddPersonalBankAccountPage';

import {addPersonalBankAccount} from '@userActions/BankAccounts';
import {openReport} from '@userActions/Report';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PrivatePersonalDetails} from '@src/types/onyx';

import type {NavigatorScreenParams} from '@react-navigation/native';

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
}));

jest.mock('@userActions/PaymentMethods', () => ({
    continueSetup: jest.fn(),
}));

jest.mock('@userActions/Report', () => ({
    openReport: jest.fn(),
}));

jest.mock('@components/ValidateCodeActionModal/ValidateCodeActionContent', () => jest.fn(() => null));

const SUB_PAGE_NAMES = CONST.ADD_PERSONAL_BANK_ACCOUNT.SUB_PAGE_NAMES;

const SAVED_PRIVATE_PERSONAL_DETAILS: PrivatePersonalDetails = {
    legalFirstName: 'Jane',
    legalLastName: 'Doe',
    phoneNumber: '+14155550123',
    addresses: [{street: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94103', country: CONST.COUNTRY.US, current: true}],
};

const MANUAL_BANK_ACCOUNT_DRAFT = {
    setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
    routingNumber: '011000015',
    accountNumber: '1234567890',
};

const closeRHPFlowSpy = jest.spyOn(Navigation, 'closeRHPFlow').mockImplementation(() => {});
const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
const dismissModalWithReportSpy = jest.spyOn(Navigation, 'dismissModalWithReport').mockImplementation(() => {});

type TestRootParamList = {
    [NAVIGATORS.TAB_NAVIGATOR]: NavigatorScreenParams<TabNavigatorParamList>;
    [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<RightModalNavigatorParamList>;
};

const RootStack = createRootStackNavigator<TestRootParamList>();
const TabNav = createBottomTabNavigator<TabNavigatorParamList>();
const AddPersonalBankAccountStack = createPlatformStackNavigator<AddPersonalBankAccountNavigatorParamList>();

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

/** Renders the real page on the given substep (the success substep by default, so pressing the primary button runs the flow's exit logic). */
function TestRightModalNavigator({subPage}: {subPage: string}) {
    return (
        <AddPersonalBankAccountStack.Navigator>
            <AddPersonalBankAccountStack.Screen
                name={SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT}
                component={AddPersonalBankAccountPage}
                initialParams={{subPage}}
            />
        </AddPersonalBankAccountStack.Navigator>
    );
}

/**
 * Mounts the page inside the RHP with the given tab focused underneath, so it resolves the active tab from
 * an attached navigationRef, as it does in the app.
 */
async function renderPageOverTab(focusedTabIndex: number, subPage: string = SUB_PAGE_NAMES.SUCCESS) {
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
                        <RootStack.Screen name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}>{() => <TestRightModalNavigator subPage={subPage} />}</RootStack.Screen>
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
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {shouldShowSuccess: true});
        });

        expect(openReport).toHaveBeenCalledTimes(1);
        expect(openReport).toHaveBeenCalledWith(expect.objectContaining({reportID: '123', shouldMarkAsRead: false}));
        expect(closeRHPFlowSpy).not.toHaveBeenCalled();
    });

    it('fetches the exit report only once and keeps the existing navigation when the flow is closed', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {exitReportID: '123', shouldShowSuccess: true});
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

    describe('magic code for personal details changes', () => {
        const settingsTabIndex = TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);

        it('adds the bank account without a magic code when the saved personal details are unchanged', async () => {
            // Given a user whose saved name, address, and phone number are all used as-is by the bank account flow
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, MANUAL_BANK_ACCOUNT_DRAFT);
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);

            // When they confirm the bank account
            fireEvent.press(screen.getByText('Confirm'));

            // Then it is added straight away, because nothing in their private personal details changes
            expect(addPersonalBankAccount).toHaveBeenCalledTimes(1);
            expect(jest.mocked(addPersonalBankAccount).mock.lastCall?.[5]).toBeUndefined();
            expect(navigateSpy).not.toHaveBeenCalled();
        });

        it('asks for a magic code before adding the bank account when the phone number changes', async () => {
            // Given a user who entered a phone number different from the one saved in their private personal details
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);

            // When they confirm the bank account
            fireEvent.press(screen.getByText('Confirm'));

            // Then they are sent to the magic code step first, as in Profile > Private, and nothing is submitted yet
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(SUB_PAGE_NAMES.VALIDATE_CODE, undefined));
            expect(addPersonalBankAccount).not.toHaveBeenCalled();
        });

        it('asks for a magic code when the saved phone number is not in E.164 format', async () => {
            // Given a user whose saved phone number is formatted differently from the E.164 number the flow submits
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {...SAVED_PRIVATE_PERSONAL_DETAILS, phoneNumber: '(415) 555-0123'});
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, MANUAL_BANK_ACCOUNT_DRAFT);
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);

            // When they confirm the bank account
            fireEvent.press(screen.getByText('Confirm'));

            // Then they are asked for a magic code, since saving the submitted number changes what the backend has stored
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(SUB_PAGE_NAMES.VALIDATE_CODE, undefined));
            expect(addPersonalBankAccount).not.toHaveBeenCalled();
        });

        it('asks for a magic code when a new user enters personal details for the first time', async () => {
            // Given a new user with no saved private personal details who entered a name, address, and phone number
            await act(async () => {
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                    ...MANUAL_BANK_ACCOUNT_DRAFT,
                    legalFirstName: 'Jane',
                    legalLastName: 'Doe',
                    addressStreet: '123 Main St',
                    addressCity: 'San Francisco',
                    addressState: 'CA',
                    addressZipCode: '94103',
                    country: 'US',
                    phoneNumber: '+14155550123',
                });
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);

            // When they confirm the bank account
            fireEvent.press(screen.getByText('Confirm'));

            // Then they must enter a magic code, since the flow would write those details to their profile
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(SUB_PAGE_NAMES.VALIDATE_CODE, undefined));
            expect(addPersonalBankAccount).not.toHaveBeenCalled();
        });

        it('adds the bank account with the entered magic code', async () => {
            // Given a user on the magic code step after changing their phone number
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.VALIDATE_CODE);

            // When they submit the magic code
            const validateCodeContentProps = jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0];
            act(() => {
                validateCodeContentProps?.handleSubmitForm('123456');
            });

            // Then the bank account is added with the new phone number and the magic code, so the backend can verify it
            expect(addPersonalBankAccount).toHaveBeenCalledTimes(1);
            const [accountData, , , , , validateCode] = jest.mocked(addPersonalBankAccount).mock.lastCall ?? [];
            expect(accountData).toEqual(expect.objectContaining({phoneNumber: '+14155550199'}));
            expect(validateCode).toBe('123456');
        });
    });
});
