import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {navigateToConciergeChat} from '@libs/actions/Report';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import ConciergePage from '@pages/ConciergePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Report', () => ({
    navigateToConciergeChat: jest.fn(() => Promise.resolve()),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));

const mockNavigateToConciergeChat = jest.mocked(navigateToConciergeChat);

const ACCOUNT_ID = 12345;
const CONCIERGE_REPORT_ID = '98765';

type ConciergeStackParamList = {
    [SCREENS.CONCIERGE]: undefined;
};

const Stack = createPlatformStackNavigator<ConciergeStackParamList>();

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.CONCIERGE}
                            component={ConciergePage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

async function seedSignedInAccount(hasCompletedGuidedSetupFlow: boolean) {
    await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, authToken: 'token'});
    await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
    await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
    await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow});
}

describe('ConciergePage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('opens the Concierge chat for an account that has finished onboarding', async () => {
        // Given a signed-in account whose report data is loaded and onboarding is done
        await act(async () => {
            await seedSignedInAccount(true);
        });

        // When the page mounts
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it redirects to the chat, which is its whole job
        expect(mockNavigateToConciergeChat).toHaveBeenCalledWith(expect.objectContaining({conciergeReportID: CONCIERGE_REPORT_ID, shouldDismissModal: true}));
    });

    it('waits for onboarding to finish before opening the Concierge chat', async () => {
        // Given a new account that lands on this page while onboarding is still open on top of it
        await act(async () => {
            await seedSignedInAccount(false);
        });
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it does not redirect, because the redirect dismisses the top modal and would close onboarding
        expect(mockNavigateToConciergeChat).not.toHaveBeenCalled();

        // When onboarding completes
        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the chat opens
        expect(mockNavigateToConciergeChat).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['a workspace member', ONYXKEYS.HAS_NON_PERSONAL_POLICY, true],
        ['an invited user', ONYXKEYS.NVP_INTRO_SELECTED, {inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE}],
    ] as const)('opens the Concierge chat for %s who never finished onboarding', async (_, key, value) => {
        // Given an account the app never sends to onboarding, so its onboarding flag stays false for good
        await act(async () => {
            await seedSignedInAccount(false);
            await Onyx.set(key, value);
        });

        // When the page mounts
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then it redirects instead of waiting for an onboarding that will never open
        expect(mockNavigateToConciergeChat).toHaveBeenCalledTimes(1);
    });
});
