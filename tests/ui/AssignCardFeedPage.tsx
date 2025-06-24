import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
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

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
}));

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
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
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

    it('should navigate to the member details page as the assignee email has not changed', async () => {
        // Sign in as a test user before running the test.
        await TestHelper.signInWithTestUser();
        const goBack = jest.spyOn(Navigation, 'goBack');
        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
            areTagsEnabled: true,
            requiresTag: true,
        };

        // Add mock policy and mock the assign card details
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
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
                currentStep: 'Confirmation',
                isEditing: false,
            });
        });

        // Render the page with the specified policyID and backTo param
        const {unmount} = renderPage(SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD, {
            policyID: policy.id,
            feed: CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            backTo: ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policy?.id, 1234),
        });

        await waitForBatchedUpdatesWithAct();

        // Verify that Assign card button is visible on the screen
        await waitFor(() => {
            expect(screen.getByTestId('assignCardButtonTestID')).toBeOnTheScreen();
        });

        // Click the Assign Card button
        const assignCardButton = screen.getByTestId('assignCardButtonTestID');

        // Create a mock event object that matches GestureResponderEvent.
        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: assignCardButton,
            currentTarget: assignCardButton,
        };
        fireEvent.press(assignCardButton, mockEvent);

        // Verify that we navigate to the member details page as the card assignee has not changed
        await waitFor(() => {
            expect(goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policy.id, 1234));
        });

        // Unmount the component after assertions to clean up.
        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('should navigate to the company cards page as the assignee email has changed', async () => {
        // Sign in as a test user before running the test.
        await TestHelper.signInWithTestUser();
        const navigate = jest.spyOn(Navigation, 'navigate');
        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
            areTagsEnabled: true,
            requiresTag: true,
        };

        // Add mock policy and mock the assign card details
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
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
                currentStep: 'Confirmation',
                isEditing: false,
            });
        });
        // Render the page with the specified policyID and backTo param
        const {unmount} = renderPage(SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD, {
            policyID: policy.id,
            feed: CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX,
            backTo: ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policy?.id, 1234),
        });

        await waitForBatchedUpdatesWithAct();

        // Mock the action of changing the assignee of the card
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                data: {
                    email: 'testaccount+2@gmail.com',
                },
            });
        });

        // Verify that Assign card button is visible on the screen
        await waitFor(() => {
            expect(screen.getByTestId('assignCardButtonTestID')).toBeOnTheScreen();
        });

        // Click the Assign Card button
        const assignCardButton = screen.getByTestId('assignCardButtonTestID');

        // Create a mock event object that matches GestureResponderEvent
        const mockEvent = {
            nativeEvent: {},
            type: 'press',
            target: assignCardButton,
            currentTarget: assignCardButton,
        };
        fireEvent.press(assignCardButton, mockEvent);

        await waitForBatchedUpdatesWithAct();

        // Verify that we navigate to the company cards page as the card assignee has changed
        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policy.id), {forceReplace: true});
        });
        // Unmount the component after assertions to clean up.
        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
