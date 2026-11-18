import {act, render, screen, waitFor} from '@testing-library/react-native';

import Text from '@components/Text';

import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {openReportFromDeepLink} from '@libs/actions/Link';
import createRootStackNavigator from '@libs/Navigation/AppNavigator/createRootStackNavigator';
import PublicScreens from '@libs/Navigation/AppNavigator/PublicScreens';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {AuthScreensParamList, RightModalNavigatorParamList, SearchFullscreenNavigatorParamList, TabNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function mockSignInPage() {
    return <Text>Sign in</Text>;
}

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => () => false);
jest.mock('@pages/signin/SignInPage', () => mockSignInPage);
jest.mock('@pages/ConnectionCompletePage', () => () => null);
jest.mock('@pages/LogInWithShortLivedAuthTokenPage', () => () => null);
jest.mock('@pages/signin/SAMLSignInPage', () => () => null);
jest.mock('@pages/UnlinkLoginPage', () => () => null);
jest.mock('@pages/ValidateLoginPage', () => () => null);
jest.mock('@libs/Navigation/AppNavigator/Navigators/TestToolsModalNavigator', () => () => null);
jest.mock('@libs/Navigation/AppNavigator/useRootNavigatorScreenOptions', () => () => ({basicModalNavigator: {}}));

const Root = createRootStackNavigator<AuthScreensParamList>();
const Tabs = createBottomTabNavigator<TabNavigatorParamList>();
const Search = createPlatformStackNavigator<SearchFullscreenNavigatorParamList>();
const Modal = createPlatformStackNavigator<RightModalNavigatorParamList>();

function SpendPage() {
    return <Text>Spend</Text>;
}

function ReportDestination({route}: {route: {params?: {reportID?: string; reportActionID?: string}}}) {
    return (
        <Text testID="report-destination">
            {route.params?.reportID}/{route.params?.reportActionID}
        </Text>
    );
}

function SearchNavigator() {
    return (
        <Search.Navigator>
            <Search.Screen
                name={SCREENS.SEARCH.ROOT}
                component={SpendPage}
            />
        </Search.Navigator>
    );
}

function TabNavigator() {
    return (
        <Tabs.Navigator>
            <Tabs.Screen
                name={SCREENS.HOME}
                component={SpendPage}
            />
            <Tabs.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchNavigator}
            />
        </Tabs.Navigator>
    );
}

function RightModalNavigator() {
    return (
        <Modal.Navigator>
            <Modal.Screen
                name={SCREENS.RIGHT_MODAL.SEARCH_REPORT}
                component={ReportDestination}
            />
            <Modal.Screen
                name={SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT}
                component={ReportDestination}
            />
        </Modal.Navigator>
    );
}

function SignInNavigation() {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={() => Navigation.setIsNavigationReady()}
        >
            {session?.authToken ? (
                <Root.Navigator>
                    <Root.Screen
                        name={NAVIGATORS.TAB_NAVIGATOR}
                        component={TabNavigator}
                    />
                    <Root.Screen
                        name={SCREENS.CONCIERGE}
                        component={SpendPage}
                    />
                    <Root.Screen
                        name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                        component={RightModalNavigator}
                    />
                </Root.Navigator>
            ) : (
                <PublicScreens />
            )}
        </NavigationContainer>
    );
}

describe.each([
    {accountType: 'a workspace member', exemptionKey: ONYXKEYS.HAS_NON_PERSONAL_POLICY, exemptionValue: true},
    {accountType: 'an invited user without a workspace', exemptionKey: ONYXKEYS.NVP_INTRO_SELECTED, exemptionValue: {inviteType: CONST.ONBOARDING_INVITE_TYPES.INVOICE}},
] as const)('Search report navigation through sign-in for $accountType', ({exemptionKey, exemptionValue}) => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(useResponsiveLayout).mockReturnValue(CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it.each([
        [ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: '123'}), '123/'],
        [ROUTES.SEARCH_REPORT.getRoute({reportID: '123'}), '123/'],
        [ROUTES.SEARCH_REPORT.getRoute({reportID: '123', reportActionID: '456'}), '123/456'],
    ])('renders the requested report for %s when onboarding is skipped', async (route, destination) => {
        // Given a real public navigator, with leaf pages simplified so navigation rather than report fetching is under test.
        render(<SignInNavigation />);
        await screen.findByText('Sign in');
        openReportFromDeepLink(`https://new.expensify.com/${route}`, {}, false, undefined, undefined, undefined, undefined, 0, {}, undefined);
        expect(screen.queryByTestId('report-destination')).toBeNull();

        // When sign-in mounts the protected navigator and OpenApp supplies the account's onboarding exemption.
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {authToken: 'test-token', accountID: 1});
            await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(exemptionKey, exemptionValue);
            await waitForBatchedUpdates();
        });

        // Then actual navigation renders the report and action, rather than leaving only Spend visible.
        try {
            await waitFor(() => expect(screen.getByTestId('report-destination')).toHaveTextContent(destination));
            expect(getPathFromState(navigationRef.getRootState())).toBe(`/${route}`);
        } finally {
            // Drain an unfinished replay even when the assertion fails, so the next case has no pending navigation.
            await act(async () => {
                await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
                await waitForBatchedUpdates();
            });
        }
    });
});
