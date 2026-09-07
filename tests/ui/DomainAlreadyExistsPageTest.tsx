import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';

import DomainAlreadyExistsPage from '@pages/domain/DomainAlreadyExistsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const DOMAIN_ACCOUNT_ID = 4242;
const CURRENT_USER_ACCOUNT_ID = 1;

const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});

const Stack = createPlatformStackNavigator<WorkspacesDomainModalNavigatorParamList>();

function getRequestAdminshipOnyxData() {
    const calls = apiWriteSpy.mock.calls.filter(([command]) => command === WRITE_COMMANDS.REQUEST_DOMAIN_ADMINSHIP);
    const [, , onyxData] = TestHelper.getRequiredWriteCall(calls, -1);
    return onyxData;
}

function renderDomainAlreadyExistsPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACES_DOMAIN_ALREADY_EXISTS}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACES_DOMAIN_ALREADY_EXISTS}
                            component={DomainAlreadyExistsPage}
                            initialParams={{domainAccountID: DOMAIN_ACCOUNT_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('DomainAlreadyExistsPage', () => {
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
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('enables the button when there is no pending request, and pressing it sends the request and navigates back after success', async () => {
        // Given no pending adminship request exists yet
        renderDomainAlreadyExistsPage();
        await waitForBatchedUpdatesWithAct();

        const button = screen.getByRole('button', {name: TestHelper.translateLocal('domain.domainAlreadyExists.requestAccess')});
        expect(button).not.toBeDisabled();

        // When the user presses the button
        fireEvent.press(button);
        await waitForBatchedUpdatesWithAct();

        // Then the request is sent, but the user stays on the page while it is pending
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.REQUEST_DOMAIN_ADMINSHIP, {domainAccountID: DOMAIN_ACCOUNT_ID}, expect.anything());
        expect(goBackSpy).not.toHaveBeenCalled();

        const onyxData = getRequestAdminshipOnyxData();
        const pendingActionsKey = `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${DOMAIN_ACCOUNT_ID}` as const;
        const optimisticPendingUpdate = TestHelper.getRequiredOnyxUpdate(onyxData, 'optimisticData', pendingActionsKey, Onyx.METHOD.MERGE);
        expect(optimisticPendingUpdate.value).toEqual({requestAdminship: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        await act(async () => {
            await Onyx.merge(pendingActionsKey, {requestAdminship: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        });
        await waitForBatchedUpdatesWithAct();

        // When the request succeeds, the user is taken back to the domains list
        const successPendingUpdate = TestHelper.getRequiredOnyxUpdate(onyxData, 'successData', pendingActionsKey, Onyx.METHOD.MERGE);
        expect(successPendingUpdate.value).toEqual({requestAdminship: null});
        await act(async () => {
            await Onyx.merge(pendingActionsKey, {requestAdminship: null});
        });
        await waitForBatchedUpdatesWithAct();

        expect(goBackSpy).toHaveBeenCalledWith(ROUTES.DOMAINS_LIST.getRoute());
    });

    it('reports the entry as transient when the add domain page already dropped it, so a failed request leaves nothing behind', async () => {
        // Given a domain entry that only carries the flow (no accountID, because the add domain page dropped it)
        renderDomainAlreadyExistsPage();
        await waitForBatchedUpdatesWithAct();

        // When the user presses the button
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('domain.domainAlreadyExists.requestAccess')}));
        await waitForBatchedUpdatesWithAct();

        // Then the failure data drops the whole entry instead of rolling back just the requester
        const failureUpdate = TestHelper.getRequiredOnyxUpdate(getRequestAdminshipOnyxData(), 'failureData', `${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, Onyx.METHOD.SET);
        expect(failureUpdate.value).toBeNull();
    });

    it('rolls back only the requester when the domain is one the user can see', async () => {
        // Given a real domain entry the user can see
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {accountID: DOMAIN_ACCOUNT_ID, email: `admin@domain.com`});
        });
        renderDomainAlreadyExistsPage();
        await waitForBatchedUpdatesWithAct();

        // When the user presses the button
        fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('domain.domainAlreadyExists.requestAccess')}));
        await waitForBatchedUpdatesWithAct();

        // Then the failure data keeps the entry and only clears the requester
        TestHelper.getRequiredOnyxUpdate(getRequestAdminshipOnyxData(), 'failureData', `${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, Onyx.METHOD.MERGE);
    });

    it('disables the button and shows "Request sent" when a request is already pending for the current user', async () => {
        // Given a pending adminship request already exists for the current user
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
                accountID: DOMAIN_ACCOUNT_ID,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                domain_adminRequesters: {[CURRENT_USER_ACCOUNT_ID]: 'read'},
            });
        });
        renderDomainAlreadyExistsPage();
        await waitForBatchedUpdatesWithAct();

        // Then the button is disabled and labelled "Request sent"
        const button = screen.getByRole('button', {name: TestHelper.translateLocal('domain.requestSent')});
        expect(button).toBeDisabled();
        expect(screen.queryByRole('button', {name: TestHelper.translateLocal('domain.domainAlreadyExists.requestAccess')})).toBeNull();
    });
});
