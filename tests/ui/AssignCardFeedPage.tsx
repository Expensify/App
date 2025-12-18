import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AssignCardFeedPage from '@pages/workspace/companyCards/assignCard/AssignCardFeedPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Set up a global fetch mock for API requests in tests.
TestHelper.setupGlobalFetchMock();

jest.mock('@hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
    })),
);

jest.mock('react-native-permissions', () => ({
    RESULTS: {
        UNAVAILABLE: 'unavailable',
        BLOCKED: 'blocked',
        DENIED: 'denied',
        GRANTED: 'granted',
        LIMITED: 'limited',
    },
    check: jest.fn(() => Promise.resolve('granted')),
    request: jest.fn(() => Promise.resolve('granted')),
    PERMISSIONS: {
        IOS: {
            CONTACTS: 'ios.permission.CONTACTS',
        },
        ANDROID: {
            READ_CONTACTS: 'android.permission.READ_CONTACTS',
        },
    },
}));

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

jest.mock('react-native-plaid-link-sdk', () => ({
    dismissLink: jest.fn(),
    openLink: jest.fn(),
    usePlaidEmitter: jest.fn(),
}));

jest.mock('@components/FormAlertWrapper', () => 'FormAlertWrapper');
jest.mock('@components/FormAlertWithSubmitButton', () => 'FormAlertWithSubmitButton');

// Create a stack navigator for the settings pages.
const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

// Renders the AssignCardFeedPage inside a navigation container with necessary providers.
const renderPage = (initialRouteName: typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD, initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD}
                            component={AssignCardFeedPage}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('AssignCardFeedPage', () => {
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

    it('should render loading indicator and call navigation to confirmation step', async () => {
        // Sign in as a test user before running the test.
        await TestHelper.signInWithTestUser();
        const navigateSpy = jest.spyOn(Navigation, 'navigate');
        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
        };

        // Set up Onyx data BEFORE rendering
        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                data: {
                    bankName: 'vcf',
                    email: 'testaccount+1@gmail.com',
                    cardName: "Test 1's card",
                    cardNumber: '490901XXXXXX1234',
                    // cspell:disable-next-line
                    encryptedCardNumber: 'v12:74E3CA3C4C0FA02FDCF754FDSFDSF',
                    dateOption: 'fromBeginning',
                    startDate: '2024-12-27',
                },
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                isEditing: false,
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Render the page
        const {unmount} = renderPage(SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD, {
            policyID: policy.id,
            feed: CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            backTo: ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policy.id, 1234),
        });

        // Verify the page renders with loading indicator
        await waitFor(() => {
            expect(screen.getByTestId('AssignCardFeedPage')).toBeOnTheScreen();
            expect(screen.getByTestId('assign-card-loading-indicator')).toBeOnTheScreen();
        });

        // Verify navigation was called to the confirmation step
        await waitFor(() => {
            expect(navigateSpy).toHaveBeenCalled();
        });

        // Verify the navigation call contains the correct route parts
        const navigationCall = navigateSpy.mock.calls.at(0)?.[0];
        expect(navigationCall).toContain('company-cards');
        expect(navigationCall).toContain('assign-card/confirmation');
        expect(navigationCall).toContain(policy.id);

        // Unmount the component after assertions to clean up.
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should show delegate no access message when user is acting as delegate', async () => {
        // Sign in as a test user before running the test.
        await TestHelper.signInWithTestUser();
        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
        };

        // Set up Onyx data with delegate access
        await act(async () => {
            await Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {
                delegatedAccess: {
                    delegate: 'delegate@example.com',
                },
            });
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                data: {
                    bankName: 'vcf',
                    email: 'testaccount+1@gmail.com',
                },
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
            });
        });
        await waitForBatchedUpdatesWithAct();

        // Render the page
        const {unmount} = renderPage(SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD, {
            policyID: policy.id,
            feed: CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
        });

        // Verify the page renders
        await waitFor(() => {
            expect(screen.getByTestId('AssignCardFeedPage')).toBeOnTheScreen();
        });

        // Unmount the component after assertions to clean up.
        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
