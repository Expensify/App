import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation, {navigationRef} from '@navigation/Navigation';
import createPlatformStackNavigator from '@navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {DomainSplitNavigatorParamList} from '@navigation/types';

import DomainGroupsPage from '@pages/domain/Groups/DomainGroupsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';

const Stack = createPlatformStackNavigator<DomainSplitNavigatorParamList>();
const domainAccountID = 424242;
const adminAccountID = 1;
const adminAccessKey = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${adminAccountID}` as const;

describe('DomainGroupsPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
    });

    it.each([
        {validated: false, buttonText: 'domain.verifyDomain.title', expectedRoute: ROUTES.DOMAIN_MEMBERS_VERIFY.getRoute(domainAccountID, 'groups')},
        {validated: true, buttonText: 'domain.groups.createNewGroupButton', expectedRoute: ROUTES.DOMAIN_GROUP_CREATE.getRoute(domainAccountID)},
    ] as const)('opens the appropriate flow when domain verification is $validated', async ({validated, buttonText, expectedRoute}) => {
        // Given a domain admin whose domain may still need verification
        await TestHelper.signInWithTestUser(adminAccountID);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {email: '+@example.com', validated, [adminAccessKey]: adminAccountID});
        });
        const navigate = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        render(
            <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
                <PortalProvider>
                    <NavigationContainer ref={navigationRef}>
                        <Stack.Navigator>
                            <Stack.Screen
                                name={SCREENS.DOMAIN.GROUPS}
                                component={DomainGroupsPage}
                                initialParams={{domainAccountID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </PortalProvider>
            </ComposeProviders>,
        );

        // When the admin selects the action shown for their domain
        fireEvent.press(await screen.findByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal(buttonText)}));

        // Then only an admin of a verified domain reaches the group form
        expect(navigate).toHaveBeenCalledWith(expectedRoute);
    });
});
