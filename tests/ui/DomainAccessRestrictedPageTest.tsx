import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';

import DomainAccessRestrictedPage from '@pages/domain/DomainAccessRestrictedPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type ReactNative from 'react-native';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

const DOMAIN_ACCOUNT_ID = 4242;
const CURRENT_USER_ACCOUNT_ID = 1;
const DOMAIN_EMAIL = 'admin@domain.com';

const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

const Stack = createPlatformStackNavigator<WorkspacesDomainModalNavigatorParamList>();

function getRequestAdminshipOnyxData() {
    const calls = apiWriteSpy.mock.calls.filter(([command]) => command === WRITE_COMMANDS.REQUEST_DOMAIN_ADMINSHIP);
    const [, , onyxData] = TestHelper.getRequiredWriteCall(calls, -1);
    return onyxData;
}

function renderDomainAccessRestrictedPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACES_DOMAIN_ACCESS_RESTRICTED}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACES_DOMAIN_ACCESS_RESTRICTED}
                            component={DomainAccessRestrictedPage}
                            initialParams={{domainAccountID: DOMAIN_ACCOUNT_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('DomainAccessRestrictedPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en');
        });
        await TestHelper.signInWithTestUser(CURRENT_USER_ACCOUNT_ID);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@user.com'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {accountID: DOMAIN_ACCOUNT_ID, email: DOMAIN_EMAIL});
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('enables the request access button when there is no pending request, and pressing it sends the request without navigating away', async () => {
        // Given no pending adminship request exists yet for a real, listed domain
        renderDomainAccessRestrictedPage();
        await waitForBatchedUpdatesWithAct();

        const button = screen.getByRole('button', {name: TestHelper.translateLocal('domain.accessRestricted.requestAdminAccess')});
        expect(button).not.toBeDisabled();

        // When the user presses the button
        fireEvent.press(button);
        await waitForBatchedUpdatesWithAct();

        // Then the request is sent as a non-transient entry, since this page is only reachable for a domain already in the list
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.REQUEST_DOMAIN_ADMINSHIP, {domainAccountID: DOMAIN_ACCOUNT_ID}, expect.anything());

        const onyxData = getRequestAdminshipOnyxData();
        const pendingActionsKey = `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${DOMAIN_ACCOUNT_ID}` as const;
        const optimisticPendingUpdate = TestHelper.getRequiredOnyxUpdate(onyxData, 'optimisticData', pendingActionsKey, Onyx.METHOD.MERGE);
        expect(optimisticPendingUpdate.value).toEqual({requestAdminship: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
    });

    it('rolls back only the requester on failure instead of dropping the whole domain entry', async () => {
        // Given a real domain entry the user can see (set in beforeEach)
        renderDomainAccessRestrictedPage();
        await waitForBatchedUpdatesWithAct();

        // When the user presses the button
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('domain.accessRestricted.requestAdminAccess')}));
        await waitForBatchedUpdatesWithAct();

        // Then the failure data is a MERGE that only clears the requester, never a SET that drops the entry
        const failureUpdate = TestHelper.getRequiredOnyxUpdate(getRequestAdminshipOnyxData(), 'failureData', `${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, Onyx.METHOD.MERGE);
        expect(failureUpdate.value).toEqual({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            domain_adminRequesters: {[CURRENT_USER_ACCOUNT_ID]: null},
        });
    });

    it('disables the button and shows "Request sent" when a request is already pending for the current user', async () => {
        // Given a pending adminship request already exists for the current user
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
                accountID: DOMAIN_ACCOUNT_ID,
                email: DOMAIN_EMAIL,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                domain_adminRequesters: {[CURRENT_USER_ACCOUNT_ID]: 'read'},
            });
        });
        renderDomainAccessRestrictedPage();
        await waitForBatchedUpdatesWithAct();

        // Then the secondary button is disabled and labelled "Request sent"
        const button = screen.getByRole('button', {name: TestHelper.translateLocal('domain.requestSent')});
        expect(button).toBeDisabled();
        expect(screen.queryByRole('button', {name: TestHelper.translateLocal('domain.accessRestricted.requestAdminAccess')})).toBeNull();

        // And the primary "Verify yourself" button remains available
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('domain.accessRestricted.verifyYourself')})).not.toBeDisabled();
    });
});
