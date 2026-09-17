import {act, cleanup, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';

import WorkspacesVerifyDomainPage from '@pages/domain/WorkspacesVerifyDomainPage';

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

jest.mock('@components/RenderHTML', () => () => null);

const DOMAIN_ACCOUNT_ID = 123456;
const DOMAIN_EMAIL = 'user@test.com';
const DOMAIN_NAME = 'test.com';
const TEST_USER_ACCOUNT_ID = 1;

// Makes the signed-in test user an admin of the domain
const DOMAIN_ADMIN_ACCESS = {
    [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: TEST_USER_ACCOUNT_ID,
};

const apiReadSpy = jest.spyOn(API, 'read').mockImplementation(() => {});
const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
// Runs the follow-up right away so the redirect target can be asserted without a real dismiss transition
const dismissModalSpy = jest.spyOn(Navigation, 'dismissModal').mockImplementation(({afterTransition} = {}) => afterTransition?.());

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

    beforeEach(async () => {
        await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID);
        // The sign-in helper goes through the mocked API.read, so the session has to be set directly
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_USER_ACCOUNT_ID, email: 'test@user.com'});
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        // Unmount first, otherwise clearing the domain looks like losing access to it and schedules a redirect into the next test
        cleanup();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
        // Cleared last so a redirect this test queued on the microtask queue has already run and cannot count against the next one
        apiReadSpy.mockClear();
        navigateSpy.mockClear();
        dismissModalSpy.mockClear();
    });

    it('renders the DNS verification screen for a non-admin on an already-validated domain instead of NotFoundPage', async () => {
        // Given an already-validated domain the current user is not an admin of
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

    it('renders NotFoundPage for an admin on an already-validated domain and skips the code fetch', async () => {
        // Given an already-validated domain the current user is an admin of
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
                accountID: DOMAIN_ACCOUNT_ID,
                email: DOMAIN_EMAIL,
                validated: true,
                ...DOMAIN_ADMIN_ACCESS,
            });
        });
        await waitForBatchedUpdatesWithAct();

        // When the verify-domain page is deep-linked
        renderVerifyDomainPage();
        await waitForBatchedUpdatesWithAct();

        // Then the verify screen is not shown (NotFoundPage), and no validation code is fetched
        expect(screen.queryByTestId('BaseVerifyDomainPage')).toBeNull();
        expect(apiReadSpy).not.toHaveBeenCalledWith(READ_COMMANDS.GET_DOMAIN_VALIDATE_CODE, expect.anything(), expect.anything());
    });

    it('renders the DNS verification screen for an admin on a not-yet-validated domain', async () => {
        // Given a domain the current user is an admin of but that is NOT yet validated
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
                accountID: DOMAIN_ACCOUNT_ID,
                email: DOMAIN_EMAIL,
                validated: false,
                ...DOMAIN_ADMIN_ACCESS,
            });
        });
        await waitForBatchedUpdatesWithAct();

        // When the verify-domain page is opened
        renderVerifyDomainPage();
        await waitForBatchedUpdatesWithAct();

        // Then the verify screen renders
        expect(screen.getByTestId('BaseVerifyDomainPage')).toBeTruthy();
        expect(apiReadSpy).toHaveBeenCalledWith(READ_COMMANDS.GET_DOMAIN_VALIDATE_CODE, {domainName: DOMAIN_NAME}, expect.anything());
    });
    it('sends the requester to the domain exists page when the domain is taken away mid-verification', async () => {
        // Given a domain the requester can see while their adminship request is open
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
                accountID: DOMAIN_ACCOUNT_ID,
                email: DOMAIN_EMAIL,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                domain_adminRequesters: {[TEST_USER_ACCOUNT_ID]: 'read'},
            });
        });
        await waitForBatchedUpdatesWithAct();
        renderVerifyDomainPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('BaseVerifyDomainPage')).toBeTruthy();

        // When an admin denies the request, which takes the domain away from the requester
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, null);
        });

        // Then there is nothing left to verify, so the requester is sent to the domain exists page instead of a not found page
        await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACES_DOMAIN_ALREADY_EXISTS.getRoute(DOMAIN_ACCOUNT_ID)));
        expect(dismissModalSpy).toHaveBeenCalled();
        expect(screen.queryByTestId('BaseVerifyDomainPage')).toBeNull();
        expect(screen.queryByText(TestHelper.translateLocal('notFound.notHere'))).toBeNull();
    });

    it('sends the requester to the domain page when their adminship request is approved mid-verification', async () => {
        // Given a validated domain the requester can see while their adminship request is open
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
                accountID: DOMAIN_ACCOUNT_ID,
                email: DOMAIN_EMAIL,
                validated: true,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                domain_adminRequesters: {[TEST_USER_ACCOUNT_ID]: 'read'},
            });
        });
        await waitForBatchedUpdatesWithAct();
        renderVerifyDomainPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('BaseVerifyDomainPage')).toBeTruthy();

        // When an admin approves the request, which makes the requester an admin
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                domain_adminRequesters: {[TEST_USER_ACCOUNT_ID]: null},
                ...DOMAIN_ADMIN_ACCESS,
            });
        });

        // Then the RHP is dismissed instead of leaving the new admin on a not found page
        await waitFor(() => expect(dismissModalSpy).toHaveBeenCalled());
        expect(navigateSpy).not.toHaveBeenCalled();
        expect(screen.queryByTestId('BaseVerifyDomainPage')).toBeNull();
        expect(screen.queryByText(TestHelper.translateLocal('notFound.notHere'))).toBeNull();
    });

    it('shows the success screen instead of dismissing when the user verifies the domain themselves', async () => {
        // Given a validated domain the current user is not yet an admin of
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
                accountID: DOMAIN_ACCOUNT_ID,
                email: DOMAIN_EMAIL,
                validated: true,
            });
        });
        await waitForBatchedUpdatesWithAct();
        renderVerifyDomainPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('BaseVerifyDomainPage')).toBeTruthy();

        // When their DNS check passes, which makes them an admin and marks the verification as succeeded in the same update
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
                isValidationPending: null,
                hasValidationSucceeded: true,
                ...DOMAIN_ADMIN_ACCESS,
            });
        });

        // Then they move on to the verified screen and the RHP is not dismissed from under them
        await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACES_DOMAIN_VERIFIED.getRoute(DOMAIN_ACCOUNT_ID), {forceReplace: true}));
        expect(dismissModalSpy).not.toHaveBeenCalled();
    });

    it('renders NotFoundPage for a domain that was never there and does not redirect', async () => {
        // Given no domain entry at all, as when the verify page is deep-linked for a domain the user cannot see

        // When the verify-domain page is opened
        renderVerifyDomainPage();
        await waitForBatchedUpdatesWithAct();

        // Then the not found page is shown, nothing is fetched and the user is not sent anywhere
        expect(screen.getByText(TestHelper.translateLocal('notFound.notHere'))).toBeTruthy();
        expect(navigateSpy).not.toHaveBeenCalled();
        expect(apiReadSpy).not.toHaveBeenCalledWith(READ_COMMANDS.GET_DOMAIN_VALIDATE_CODE, expect.anything(), expect.anything());
    });
});
