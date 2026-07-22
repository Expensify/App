import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';

import WorkspacesVerifyDomainPage from '@pages/domain/WorkspacesVerifyDomainPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/RenderHTML', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {
        Text: React.ComponentType<{children?: React.ReactNode}>;
    };

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

const DOMAIN_ACCOUNT_ID = 123456;
const DOMAIN_EMAIL = 'user@test.com';
const DOMAIN_NAME = 'test.com';
const TEST_USER_ACCOUNT_ID = 1;

// Makes the signed-in test user an admin of the domain
const DOMAIN_ADMIN_ACCESS = {
    [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: TEST_USER_ACCOUNT_ID,
};

const apiReadSpy = jest.spyOn(API, 'read').mockImplementation(() => {});

const Stack = createPlatformStackNavigator<WorkspacesDomainModalNavigatorParamList>();

function renderVerifyDomainPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACES_VERIFY_DOMAIN}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACES_VERIFY_DOMAIN}
                            component={WorkspacesVerifyDomainPage}
                            initialParams={{domainAccountID: DOMAIN_ACCOUNT_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('BaseVerifyDomainPage', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        apiReadSpy.mockClear();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('renders the DNS verification screen for a non-admin on an already-validated domain instead of NotFoundPage', async () => {
        // Given an already-validated domain the current user is not an admin of
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
                accountID: DOMAIN_ACCOUNT_ID,
                email: DOMAIN_EMAIL,
                validated: true,
            });
        });
        await waitForBatchedUpdatesWithAct();

        // When the verify-domain page is opened
        renderVerifyDomainPage();
        await waitForBatchedUpdatesWithAct();

        // Then the verify screen renders (a validated domain must not dead-end on NotFoundPage)
        expect(screen.getByTestId('BaseVerifyDomainPage')).toBeTruthy();

        // And the validation code is fetched, so the DNS TXT field is not left empty
        expect(apiReadSpy).toHaveBeenCalledWith(READ_COMMANDS.GET_DOMAIN_VALIDATE_CODE, {domainName: DOMAIN_NAME}, expect.anything());
    });
});
