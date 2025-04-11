import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import {translateLocal} from '@libs/Localize';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@navigation/types';
import ExpensifyCardPage from '@pages/settings/Wallet/ExpensifyCardPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');

// Set up a global fetch mock for API requests in tests.
TestHelper.setupGlobalFetchMock();

// Create a stack navigator for the settings pages.
const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const userCardID = '1234';

// Renders the ExpensifyCardPage inside a navigation container with necessary providers.
const renderPage = (initialRouteName: typeof SCREENS.SETTINGS.WALLET.DOMAIN_CARD, initialParams: SettingsNavigatorParamList[typeof SCREENS.SETTINGS.WALLET.DOMAIN_CARD]) => {
    return render(
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.WALLET.DOMAIN_CARD}
                            component={ExpensifyCardPage}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('ExpensifyCardPage', () => {
    beforeAll(() => {
        // Initialize Onyx with required keys before running any test.
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        // Mock the useResponsiveLayout hook to control layout behavior in tests.
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        } as ResponsiveLayoutResult);
    });

    afterEach(async () => {
        // Clear Onyx data and reset all mocks after each test to ensure a clean state.
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should show the Report Fraud and Reveal details options on screen', async () => {
        // Sign in as a test user before running the test.
        await TestHelper.signInWithTestUser();

        // Add a mock card to Onyx storage to simulate a valid card being loaded.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.CARD_LIST, {
                [userCardID]: {
                    cardID: 1234,
                    state: CONST.EXPENSIFY_CARD.STATE.OPEN,
                    domainName: 'xyz',
                    nameValuePairs: {
                        isVirtual: true,
                        cardTitle: 'Test Virtual Card',
                    },
                    availableSpend: 50000,
                    fraud: null,
                },
            });
        });

        // Render the page with the specified card ID.
        const {unmount} = renderPage(SCREENS.SETTINGS.WALLET.DOMAIN_CARD, {cardID: '1234'});

        await waitForBatchedUpdatesWithAct();

        // Verify that the "Report Fraud" option is displayed on the screen.
        await waitFor(() => {
            expect(screen.getByText(translateLocal('cardPage.reportFraud'))).toBeOnTheScreen();
        });

        // Verify that the "Reveal Details" option is displayed on the screen.
        await waitFor(() => {
            expect(screen.getByText(translateLocal('cardPage.cardDetails.revealDetails'))).toBeOnTheScreen();
        });

        // Unmount the component after assertions to clean up.
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should not show the Report Fraud and Reveal details options on screen', async () => {
        // Sign in as a test user before running the test.
        await TestHelper.signInWithTestUser();

        // Add a mock card to Onyx storage with additional delegated access data.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.CARD_LIST, {
                [userCardID]: {
                    cardID: 1234,
                    state: CONST.EXPENSIFY_CARD.STATE.OPEN,
                    domainName: 'xyz',
                    nameValuePairs: {
                        isVirtual: true,
                        cardTitle: 'Test Virtual Card',
                    },
                    availableSpend: 50000,
                    fraud: null,
                },
            });

            // Add delegated access data to simulate a user without fraud reporting permissions.
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                delegatedAccess: {
                    delegate: 'test@test.com',
                },
            });
        });

        // Render the page with the specified card ID.
        const {unmount} = renderPage(SCREENS.SETTINGS.WALLET.DOMAIN_CARD, {cardID: '1234'});

        await waitForBatchedUpdatesWithAct();

        // Verify that the "Report Fraud" option is NOT displayed on the screen.
        await waitFor(() => {
            expect(screen.queryByText(translateLocal('cardPage.reportFraud'))).not.toBeOnTheScreen();
        });

        // Verify that the "Reveal Details" option is NOT displayed on the screen.
        await waitFor(() => {
            expect(screen.queryByText(translateLocal('cardPage.cardDetails.revealDetails'))).not.toBeOnTheScreen();
        });

        // Unmount the component after assertions to clean up.
        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
