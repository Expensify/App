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

import {addPersonalBankAccount, clearPersonalBankAccount, clearPersonalBankAccountErrors} from '@userActions/BankAccounts';
import {openReport} from '@userActions/Report';
import {requestValidateCodeAction} from '@userActions/User';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PrivatePersonalDetails} from '@src/types/onyx';

import type {NavigatorScreenParams} from '@react-navigation/native';

import {PortalProvider} from '@gorhom/portal';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer, StackActions} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common';
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
    clearPersonalBankAccount: jest.fn(),
    clearPersonalBankAccountErrors: jest.fn(),
}));

jest.mock('@userActions/PaymentMethods', () => ({
    continueSetup: jest.fn(),
}));

jest.mock('@userActions/Report', () => ({
    openReport: jest.fn(),
}));

jest.mock('@userActions/User', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/User'),
    requestValidateCodeAction: jest.fn(),
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
    [SCREENS.SEARCH_ROUTER.ROOT]: undefined;
};

const RootStack = createRootStackNavigator<TestRootParamList>();
const TabNav = createBottomTabNavigator<TabNavigatorParamList>();
// The flow's stack can also hold screens outside the flow, like keyboard shortcuts in the Settings stack
type TestAddPersonalBankAccountParamList = AddPersonalBankAccountNavigatorParamList & {
    [SCREENS.SETTINGS.DYNAMIC_KEYBOARD_SHORTCUTS]: undefined;
};

const AddPersonalBankAccountStack = createPlatformStackNavigator<TestAddPersonalBankAccountParamList>();

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
            <AddPersonalBankAccountStack.Screen
                name={SCREENS.SETTINGS.DYNAMIC_KEYBOARD_SHORTCUTS}
                component={getEmptyComponent()}
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
                        <RootStack.Screen
                            name={SCREENS.SEARCH_ROUTER.ROOT}
                            component={getEmptyComponent()}
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

    it("sends the exit report policy's full policy snapshot marker when fetching the exit report", async () => {
        // Given the exit report belongs to a workspace whose full policy snapshot is already cached
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}123`, {reportID: '123', policyID: 'policy1'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_FULL_POLICY_SNAPSHOT}policy1`, {lastModified: 456});
            await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {exitReportID: '123'});
        });
        await renderPageOverTab(TAB_ROUTES.findIndex((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        // When the bank account is added and the exit report is fetched again
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {shouldShowSuccess: true});
        });

        // Then the fetch carries the marker so Auth can skip the policy collections it already sent
        expect(openReport).toHaveBeenCalledWith(expect.objectContaining({reportID: '123', fullPolicySnapshot: {policyID: 'policy1', lastModified: 456}}));
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

            // Then it is added straight away, because their saved phone number doesn't change
            expect(addPersonalBankAccount).toHaveBeenCalledTimes(1);
            expect(jest.mocked(addPersonalBankAccount).mock.lastCall?.[2]?.validateCode).toBeUndefined();
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

        it('adds the bank account without a magic code when only the legal name and address change', async () => {
            // Given a user who entered a new legal name and address but kept their saved phone number
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {
                    ...MANUAL_BANK_ACCOUNT_DRAFT,
                    legalFirstName: 'Janet',
                    addressStreet: '456 Oak St',
                    addressCity: 'Oakland',
                    addressZipCode: '94607',
                });
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);

            // When they confirm the bank account
            fireEvent.press(screen.getByText('Confirm'));

            // Then it is added straight away, because only a phone number change needs a magic code
            expect(addPersonalBankAccount).toHaveBeenCalledTimes(1);
            expect(jest.mocked(addPersonalBankAccount).mock.lastCall?.[2]?.validateCode).toBeUndefined();
            expect(navigateSpy).not.toHaveBeenCalled();
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

            // Then they must enter a magic code, since the flow would save a phone number to their profile
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(SUB_PAGE_NAMES.VALIDATE_CODE, undefined));
            expect(addPersonalBankAccount).not.toHaveBeenCalled();
        });

        it('replaces the magic code step with the success step, so going back from success does not land on the code form', async () => {
            // Given a user on the magic code step after changing their phone number
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.VALIDATE_CODE);

            // When the bank account is added
            await act(async () => {
                await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {shouldShowSuccess: true});
            });

            // Then the success step replaces the magic code step instead of being pushed on top of it
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(SUB_PAGE_NAMES.SUCCESS, undefined), {forceReplace: true});
        });

        it('moves on to the success step when the bank account is added while another screen covers the flow', async () => {
            // Given a user who confirmed the bank account and opened another screen on top of the flow, such as the search router, while it was loading
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, MANUAL_BANK_ACCOUNT_DRAFT);
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);
            act(() => {
                navigationRef.current?.navigate(SCREENS.SEARCH_ROUTER.ROOT);
            });
            await waitForBatchedUpdatesWithAct();

            // When the bank account is added
            await act(async () => {
                await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {shouldShowSuccess: true});
            });

            // Then the flow moves on to the success step under the screen on top, so the user sees it when they close that screen, instead of a confirmation step that would submit
            // the same bank account again
            expect(navigateSpy).toHaveBeenCalledTimes(1);
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(SUB_PAGE_NAMES.SUCCESS, undefined));
        });

        it("moves on to the success step when the bank account is added while another screen in the flow's stack covers it", async () => {
            // Given a user who confirmed the bank account and opened a screen that shares the flow's stack, such as keyboard shortcuts in the Settings stack, while it was loading
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, MANUAL_BANK_ACCOUNT_DRAFT);
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);
            act(() => {
                navigationRef.dispatch(StackActions.push(SCREENS.SETTINGS.DYNAMIC_KEYBOARD_SHORTCUTS));
            });
            await waitForBatchedUpdatesWithAct();

            // When the bank account is added
            await act(async () => {
                await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {shouldShowSuccess: true});
            });

            // Then the flow's own topmost substep still moves on to the success step
            expect(navigateSpy).toHaveBeenCalledTimes(1);
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(SUB_PAGE_NAMES.SUCCESS, undefined));
        });

        it.each([SUB_PAGE_NAMES.CONFIRMATION, SUB_PAGE_NAMES.VALIDATE_CODE])('leaves the flow when the user goes back from the success step to the step under it: %s', async (subPage) => {
            // Given a user on the confirmation step, or on the magic code step it opened, whose bank account was added
            jest.mocked(clearPersonalBankAccount).mockImplementationOnce(() => {
                Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {shouldShowSuccess: null});
            });
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
            });
            await renderPageOverTab(settingsTabIndex, subPage);
            await act(async () => {
                await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {shouldShowSuccess: true});
            });

            // When a screen is opened on top of the step and closed again, as when the user goes back to it from the success step
            act(() => {
                navigationRef.current?.navigate(SCREENS.SEARCH_ROUTER.ROOT);
            });
            await waitForBatchedUpdatesWithAct();
            act(() => {
                navigationRef.current?.goBack();
            });
            await waitForBatchedUpdatesWithAct();

            // Then the flow is left, like with the success step's back button, instead of moving on to the success step again
            expect(navigateSpy).toHaveBeenCalledTimes(1);
            expect(goBackSpy).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
            expect(clearPersonalBankAccount).toHaveBeenCalledTimes(1);
        });

        it('requests the magic code for updating personal details, the reason the backend verifies it against', async () => {
            // Given a user on the magic code step after changing their phone number
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.VALIDATE_CODE);

            // When the step sends the magic code
            const validateCodeContentProps = jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0];
            validateCodeContentProps?.sendValidateCode();

            // Then the code is bound to updating personal details, as in Profile > Private, so the backend accepts it, and a recent code requested for another flow doesn't stop a new one from being sent
            expect(requestValidateCodeAction).toHaveBeenCalledWith({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.UPDATE_PERSONAL_DETAILS});
            expect(validateCodeContentProps?.validateCodeReasonCode).toBe(COMMON_CONST.VALIDATE_CODE_REASONS.UPDATE_PERSONAL_DETAILS);
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
            const [accountData, , options] = jest.mocked(addPersonalBankAccount).mock.lastCall ?? [];
            expect(accountData).toEqual(expect.objectContaining({phoneNumber: '+14155550199'}));
            expect(options?.validateCode).toBe('123456');
        });

        it('confirms the ownership details when the magic code step is reopened after the account ownership error', async () => {
            // Given a user whose first submission failed the account ownership check, and who was sent back to the confirmation step, where the error shows
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
                await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: {[Date.now()]: 'Unable to verify bank account ownership.'}});
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);

            // When they press Confirm, which clears the error and opens a new magic code screen where they submit a code
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: null});
            });
            screen.unmount();
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.VALIDATE_CODE);
            const validateCodeContentProps = jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0];
            act(() => {
                validateCodeContentProps?.handleSubmitForm('654321');
            });

            // Then the retry confirms the ownership details, so the backend doesn't return the same error again
            const [accountData] = jest.mocked(addPersonalBankAccount).mock.lastCall ?? [];
            expect(accountData).toEqual(expect.objectContaining({confirmedOwnershipDetails: true}));
        });

        it('sends the user back to the confirmation step when the magic code step gets the account ownership error', async () => {
            // Given a user on the magic code step after changing their phone number
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.VALIDATE_CODE);

            // When they submit a code and the submission fails the account ownership check
            act(() => {
                jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0]?.handleSubmitForm('123456');
            });
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {isLoading: false, errors: {[Date.now()]: 'Unable to verify bank account ownership.'}});
            });

            // And a later update re-renders the step before it is popped
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {plaidAccountID: ''});
            });

            // Then they go back once to the confirmation step with the error kept, so they confirm the ownership details while seeing them
            expect(goBackSpy).toHaveBeenCalledTimes(1);
            expect(goBackSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(SUB_PAGE_NAMES.CONFIRMATION, undefined));
            expect(clearPersonalBankAccountErrors).not.toHaveBeenCalled();
        });

        it('keeps the user on the magic code step when the account ownership error is from an earlier submission', async () => {
            // Given the account ownership error from a submission on the confirmation step, still in Onyx while it's being cleared
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
                await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: {[Date.now()]: 'Unable to verify bank account ownership.'}});
            });

            // When the magic code step opens
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.VALIDATE_CODE);

            // Then it stays open, since no code was submitted from it yet
            expect(goBackSpy).not.toHaveBeenCalled();
        });

        it('keeps the user on the magic code step for other errors', async () => {
            // Given a user on the magic code step after changing their phone number
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.VALIDATE_CODE);

            // When they submit a code and the submission fails because of the magic code
            act(() => {
                jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0]?.handleSubmitForm('123456');
            });
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: {[Date.now()]: 'Incorrect or invalid magic code. Please try again or request a new code.'}});
            });

            // Then they stay on the magic code step to try another code
            expect(goBackSpy).not.toHaveBeenCalled();
        });

        it('keeps the error for the confirmation step when the user goes back from the magic code step', async () => {
            // Given a user on the magic code step whose submission failed for a reason other than the magic code
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.VALIDATE_CODE);
            act(() => {
                jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0]?.handleSubmitForm('123456');
            });
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {isLoading: false, errors: {[Date.now()]: 'This bank account has already been added.'}});
            });

            // When they go back
            const validateCodeContentProps = jest.mocked(ValidateCodeActionContent).mock.lastCall?.[0];
            act(() => {
                validateCodeContentProps?.onClose?.();
            });

            // Then they land on the confirmation step with the error kept, so it shows next to the details to fix
            expect(validateCodeContentProps?.shouldClearErrorOnClose).toBe(false);
            expect(goBackSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(SUB_PAGE_NAMES.CONFIRMATION, undefined));
            expect(clearPersonalBankAccountErrors).not.toHaveBeenCalled();
        });

        it('clears the previous error before opening the magic code step', async () => {
            // Given a user back on the confirmation step with the account ownership error from their previous submission
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
                await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: {[Date.now()]: 'Unable to verify bank account ownership.'}});
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);

            // When they confirm the bank account
            fireEvent.press(screen.getByText('Confirm'));

            // Then the error is cleared, so the magic code step doesn't show it
            expect(clearPersonalBankAccountErrors).toHaveBeenCalledTimes(1);
            expect(navigateSpy).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_PERSONAL.getRoute(SUB_PAGE_NAMES.VALIDATE_CODE, undefined));
        });

        it('does not confirm the ownership details when the account ownership error arrives while a details step is focused', async () => {
            // Given a user who left the confirmation step for a details step while their submission was loading
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, MANUAL_BANK_ACCOUNT_DRAFT);
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS);

            // When the submission fails the account ownership check
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {isLoading: false, errors: {[Date.now()]: 'Unable to verify bank account ownership.'}});
            });

            // Then the error is cleared without confirming the details, since the user never saw it, so the next submission gets it again on the confirmation step
            expect(clearPersonalBankAccountErrors).toHaveBeenCalledTimes(1);
            const draft = await getOnyxValue(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
            expect(draft).not.toHaveProperty('confirmedOwnershipDetails');
        });

        it('asks to confirm the ownership details again after a details step is submitted', async () => {
            // Given a user who confirmed their ownership details after an account ownership error
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199', confirmedOwnershipDetails: true});
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.PHONE_NUMBER);

            // When they submit the phone number step, which may change the details they confirmed
            fireEvent.press(screen.getByText('Next'));
            await waitForBatchedUpdatesWithAct();

            // Then the confirmation is dropped, so the next submission checks ownership against the new details
            const draft = await getOnyxValue(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT);
            expect(draft).not.toHaveProperty('confirmedOwnershipDetails');
        });

        it.each(['Incorrect or invalid magic code. Please try again or request a new code.', 'Too many failed attempts. Please try again later.'])(
            'clears a magic code error once the user goes back to the confirmation step: %s',
            async (validateCodeError) => {
                // Given a user who went back to the confirmation step from the magic code step, where their code was rejected
                await act(async () => {
                    await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                    await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
                    await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: {[Date.now()]: validateCodeError}});
                });

                // When the confirmation step is shown
                await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);

                // Then the error is cleared, since it is about the magic code and not the details shown there
                expect(clearPersonalBankAccountErrors).toHaveBeenCalledTimes(1);
            },
        );

        it('keeps an error that reads like a magic code error on the confirmation step when there is no magic code step', async () => {
            // Given a user whose phone number is unchanged, so their submission had no magic code, and whose submission failed with an error that mentions failed attempts
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, MANUAL_BANK_ACCOUNT_DRAFT);
                await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: {[Date.now()]: 'Too many failed attempts. Please try again later.'}});
            });

            // When the confirmation step is shown
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);

            // Then the error stays, since it can't be about a magic code
            expect(clearPersonalBankAccountErrors).not.toHaveBeenCalled();
            expect(screen.getByText('Too many failed attempts. Please try again later.')).toBeTruthy();
        });

        it('keeps any other error on the confirmation step', async () => {
            // Given a user who went back to the confirmation step from the magic code step, where the submission failed for a reason other than the magic code
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199'});
                await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: {[Date.now()]: 'This bank account has already been added.'}});
            });

            // When the confirmation step is shown
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.CONFIRMATION);

            // Then the error stays, so it shows next to the details to fix
            expect(clearPersonalBankAccountErrors).not.toHaveBeenCalled();
            expect(screen.getByText('This bank account has already been added.')).toBeTruthy();
        });

        it('clears the error kept for the confirmation step once the user goes back to a details step, so they can go forward again', async () => {
            // Given the account ownership error kept for the confirmation step, and a user who went back from it to the bank account details step
            jest.mocked(clearPersonalBankAccountErrors).mockImplementationOnce(() => {
                Onyx.merge(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: null});
            });
            await act(async () => {
                await Onyx.set(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, SAVED_PRIVATE_PERSONAL_DETAILS);
                await Onyx.set(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {...MANUAL_BANK_ACCOUNT_DRAFT, phoneNumber: '+14155550199', confirmedOwnershipDetails: true});
                await Onyx.set(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {errors: {[Date.now()]: 'Unable to verify bank account ownership.'}});
            });
            await renderPageOverTab(settingsTabIndex, SUB_PAGE_NAMES.MANUAL_BANK_ACCOUNT_DETAILS);
            await waitForBatchedUpdatesWithAct();

            // When they submit the details step
            fireEvent.press(screen.getByText('Next'));
            await waitForBatchedUpdatesWithAct();

            // Then the error is cleared and they move on, since the details form shares the error's Onyx key and won't submit while it has one
            expect(clearPersonalBankAccountErrors).toHaveBeenCalledTimes(1);
            expect(screen.queryByText('Unable to verify bank account ownership.')).toBeNull();
            expect(navigateSpy).toHaveBeenCalledTimes(1);
        });
    });
});
