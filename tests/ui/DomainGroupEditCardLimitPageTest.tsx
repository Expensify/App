import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DomainGroupDetailsPage from '@pages/domain/Groups/DomainGroupDetailsPage';
import DomainGroupEditCardLimitPage from '@pages/domain/Groups/DomainGroupEditCardLimitPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {DomainSecurityGroup} from '@src/types/onyx';
import type Domain from '@src/types/onyx/Domain';
import type {SecurityGroupKey} from '@src/types/onyx/Domain';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/RenderHTML', () => () => null);

const DOMAIN_ACCOUNT_ID = 123456;
const TEST_USER_ACCOUNT_ID = 1;
const GROUP_ID = 'group1';
const STORED_LIMIT_CENTS = 50000;

// Makes the signed-in test user an admin of the domain, so DomainNotFoundPageWrapper renders the page
const DOMAIN_ADMIN_ACCESS = {
    [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: TEST_USER_ACCOUNT_ID,
};

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const getSaveLabel = () => TestHelper.translateLocal('common.save');
const getCardLimitLabel = () => TestHelper.translateLocal('workspace.expensifyCard.cardLimit');

/** Merges a security group entry for the domain, so the pages under test find an existing group. */
async function setUpSecurityGroup(group: Partial<DomainSecurityGroup>) {
    const securityGroupKey: SecurityGroupKey = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${GROUP_ID}`;
    const domainUpdate: Partial<Domain> = {};
    domainUpdate[securityGroupKey] = {
        name: 'Group',
        enableRestrictedPrimaryLogin: false,
        enableRestrictedPolicyCreation: false,
        shared: {},
        ...group,
    };
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, domainUpdate);
    });
    await waitForBatchedUpdatesWithAct();
}

/** Gives the domain an Expensify Card program, which is what makes the card limit row available. */
async function setUpExpensifyCardSettings() {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${DOMAIN_ACCOUNT_ID}`, {paymentBankAccountID: 1});
    });
    await waitForBatchedUpdatesWithAct();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- The pages under test take different route props.
function renderPage(screenName: keyof SettingsNavigatorParamList, component: React.ComponentType<any>) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrencyListContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={screenName}>
                        <Stack.Screen
                            name={screenName}
                            component={component}
                            initialParams={{domainAccountID: DOMAIN_ACCOUNT_ID, groupID: GROUP_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

/** Opens the card limit page and waits for the form to be interactive. */
async function renderEditCardLimitPage() {
    renderPage(SCREENS.DOMAIN.GROUP_EDIT_CARD_LIMIT, DomainGroupEditCardLimitPage);
    await waitForBatchedUpdatesWithAct();
    await waitFor(() => {
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()})).toBeOnTheScreen();
    });
}

async function pressSave() {
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()}));
    await waitForBatchedUpdatesWithAct();
}

describe('Domain group card limit pages', () => {
    let apiWriteSpy: jest.SpyInstance;
    let goBackSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
                accountID: DOMAIN_ACCOUNT_ID,
                email: 'user@test.com',
                ...DOMAIN_ADMIN_ACCESS,
            });
        });
        await waitForBatchedUpdatesWithAct();
        apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    describe('DomainGroupEditCardLimitPage', () => {
        it('shows the stored card limit in whole dollars', async () => {
            // Given a group with a stored card limit
            await setUpSecurityGroup({defaultCardUnapprovedExpenseLimit: STORED_LIMIT_CENTS});

            // When the card limit page is opened
            await renderEditCardLimitPage();

            // Then the stored limit is shown in dollars
            expect(screen.getByDisplayValue('500')).toBeOnTheScreen();
        });

        it('shows a card limit of 0 when the group has no stored limit', async () => {
            // Given a group without a stored card limit, which is how the default group is stored
            await setUpSecurityGroup({});

            // When the card limit page is opened
            await renderEditCardLimitPage();

            // Then the limit is shown as 0
            expect(screen.getByDisplayValue('0')).toBeOnTheScreen();
        });

        test.each([
            {description: 'a new limit', input: '750', expectedCents: 75000},
            {description: 'a limit of 0', input: '0', expectedCents: 0},
        ])('saves $description in cents and returns to the group details', async ({input, expectedCents}) => {
            // Given a group with a stored card limit
            await setUpSecurityGroup({defaultCardUnapprovedExpenseLimit: STORED_LIMIT_CENTS});
            await renderEditCardLimitPage();

            // When a different limit is entered and saved
            fireEvent.changeText(screen.getByDisplayValue('500'), input);
            await waitForBatchedUpdatesWithAct();
            await pressSave();

            // Then the group update sends the new limit in cents
            expect(apiWriteSpy).toHaveBeenCalledTimes(1);
            const [command, parameters] = TestHelper.getRequiredWriteCall(apiWriteSpy.mock.calls, 0);
            expect(command).toBe(WRITE_COMMANDS.UPDATE_DOMAIN_SECURITY_GROUP);
            expect(parameters.settingsName).toBe('defaultCardUnapprovedExpenseLimit');
            expect(JSON.parse(String(parameters.value))).toEqual(expect.objectContaining({defaultCardUnapprovedExpenseLimit: expectedCents}));
            expect(goBackSpy).toHaveBeenCalledWith(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(DOMAIN_ACCOUNT_ID, GROUP_ID));
        });

        it('shows an error and does not save a limit that is not a whole dollar amount', async () => {
            // Given a group with a stored card limit
            await setUpSecurityGroup({defaultCardUnapprovedExpenseLimit: STORED_LIMIT_CENTS});
            await renderEditCardLimitPage();

            // When a limit with cents is entered and saved
            fireEvent.changeText(screen.getByDisplayValue('500'), '1.5');
            await waitForBatchedUpdatesWithAct();
            await pressSave();

            // Then the whole dollar error is shown and nothing is sent
            expect(screen.getByText(TestHelper.translateLocal('iou.error.invalidIntegerAmount'))).toBeOnTheScreen();
            expect(apiWriteSpy).not.toHaveBeenCalled();
            expect(goBackSpy).not.toHaveBeenCalled();
        });

        it('returns to the group details without saving when the limit is unchanged', async () => {
            // Given a group with a stored card limit
            await setUpSecurityGroup({defaultCardUnapprovedExpenseLimit: STORED_LIMIT_CENTS});
            await renderEditCardLimitPage();

            // When the stored limit is saved as is
            await pressSave();

            // Then nothing is sent and the page closes
            expect(apiWriteSpy).not.toHaveBeenCalled();
            expect(goBackSpy).toHaveBeenCalledWith(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(DOMAIN_ACCOUNT_ID, GROUP_ID));
        });
    });

    describe('DomainGroupDetailsPage', () => {
        it('shows the card limit row when the domain has Expensify Card settings', async () => {
            // Given a domain with an Expensify Card program and a group with a stored card limit
            await setUpExpensifyCardSettings();
            await setUpSecurityGroup({defaultCardUnapprovedExpenseLimit: STORED_LIMIT_CENTS});

            // When the group details page is opened
            renderPage(SCREENS.DOMAIN.GROUP_DETAILS, DomainGroupDetailsPage);
            await waitForBatchedUpdatesWithAct();

            // Then the card limit row shows the stored limit
            expect(screen.getByText(getCardLimitLabel())).toBeOnTheScreen();
            expect(screen.getByText('$500.00')).toBeOnTheScreen();
        });

        it('hides the card limit row when the domain has no Expensify Card settings', async () => {
            // Given a domain without an Expensify Card program
            await setUpSecurityGroup({defaultCardUnapprovedExpenseLimit: STORED_LIMIT_CENTS});

            // When the group details page is opened
            renderPage(SCREENS.DOMAIN.GROUP_DETAILS, DomainGroupDetailsPage);
            await waitForBatchedUpdatesWithAct();

            // Then the page renders without the card limit row
            expect(screen.getByTestId('DomainGroupDetailsPage')).toBeOnTheScreen();
            expect(screen.queryByText(getCardLimitLabel())).toBeNull();
        });
    });
});
