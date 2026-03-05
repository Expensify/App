/* eslint-disable @typescript-eslint/naming-convention */
import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
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
import RefreshCardFeedConnectionPage from '@pages/workspace/companyCards/RefreshCardFeedConnectionPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx/CardFeeds';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const WORKSPACE_ACCOUNT_ID = 5678;
const POLICY_ID = LHNTestUtils.getFakePolicy().id;
const DIRECT_FEED = `oauth.chase.com#${WORKSPACE_ACCOUNT_ID}` as CompanyCardFeedWithDomainID;

TestHelper.setupGlobalFetchMock();

jest.mock('@hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
    })),
);

jest.mock('react-native-permissions', () => ({
    RESULTS: {UNAVAILABLE: 'unavailable', BLOCKED: 'blocked', DENIED: 'denied', GRANTED: 'granted', LIMITED: 'limited'},
    check: jest.fn(() => Promise.resolve('granted')),
    request: jest.fn(() => Promise.resolve('granted')),
    PERMISSIONS: {IOS: {CONTACTS: 'ios.permission.CONTACTS'}, ANDROID: {READ_CONTACTS: 'android.permission.READ_CONTACTS'}},
}));

jest.mock('@rnmapbox/maps', () => ({default: jest.fn(), MarkerView: jest.fn(), setAccessToken: jest.fn()}));

jest.mock('react-native-plaid-link-sdk', () => ({dismissLink: jest.fn(), openLink: jest.fn(), usePlaidEmitter: jest.fn()}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    closeRHPFlow: jest.fn(),
    dismissModal: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback?.()),
    getTopmostReportId: jest.fn(),
}));

const mockClearAssignCardStepAndData = jest.fn();

jest.mock('@userActions/CompanyCards', () => ({
    setAssignCardStepAndData: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    clearAssignCardStepAndData: (...args: unknown[]) => mockClearAssignCardStepAndData(...args),
    setAddNewCompanyCardStepAndData: jest.fn(),
}));

let capturedOnRefreshComplete: (() => void) | undefined;
jest.mock('@pages/workspace/companyCards/BankConnection', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View, Text} = require('react-native');
    return {
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        default: ({onRefreshComplete, isRefreshConnectionFlow}: {onRefreshComplete?: () => void; isRefreshConnectionFlow?: boolean}) => {
            capturedOnRefreshComplete = onRefreshComplete;
            return (
                <View testID="BankConnection">
                    <Text>{isRefreshConnectionFlow ? 'refresh-mode' : 'normal-mode'}</Text>
                </View>
            );
        },
    };
});

jest.mock('@pages/workspace/companyCards/addNew/PlaidConnectionStep', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return {
        __esModule: true,
        default: () => <View testID="PlaidConnectionStep" />,
    };
});

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderRefreshPage = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.COMPANY_CARDS_REFRESH_CARD_FEED_CONNECTION}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.COMPANY_CARDS_REFRESH_CARD_FEED_CONNECTION}
                            component={RefreshCardFeedConnectionPage}
                            initialParams={{
                                policyID: POLICY_ID,
                                feed: DIRECT_FEED,
                            }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('RefreshCardFeedConnection', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        capturedOnRefreshComplete = undefined;
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            isSmallScreenWidth: false,
            shouldUseNarrowLayout: false,
        } as ResponsiveLayoutResult);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    describe('Step rendering', () => {
        it('should show loading page when no step is set', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {...LHNTestUtils.getFakePolicy(), role: CONST.POLICY.ROLE.ADMIN, workspaceAccountID: WORKSPACE_ACCOUNT_ID};

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
            });

            const {unmount} = renderRefreshPage();
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByText('Assign new cards')).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should render BankConnection when step is BANK_CONNECTION', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {...LHNTestUtils.getFakePolicy(), role: CONST.POLICY.ROLE.ADMIN, workspaceAccountID: WORKSPACE_ACCOUNT_ID};

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION});
            });

            const {unmount} = renderRefreshPage();
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByTestId('BankConnection')).toBeOnTheScreen();
                expect(screen.getByText('refresh-mode')).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should render PlaidConnectionStep when step is PLAID_CONNECTION', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {...LHNTestUtils.getFakePolicy(), role: CONST.POLICY.ROLE.ADMIN, workspaceAccountID: WORKSPACE_ACCOUNT_ID};

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {currentStep: CONST.COMPANY_CARD.STEP.PLAID_CONNECTION});
            });

            const {unmount} = renderRefreshPage();
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByTestId('PlaidConnectionStep')).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Success view', () => {
        it('should show success confirmation when onRefreshComplete is called', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {...LHNTestUtils.getFakePolicy(), role: CONST.POLICY.ROLE.ADMIN, workspaceAccountID: WORKSPACE_ACCOUNT_ID};

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION});
            });

            const {unmount} = renderRefreshPage();
            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByTestId('BankConnection')).toBeOnTheScreen();
            });

            expect(capturedOnRefreshComplete).toBeDefined();

            // Simulate BankConnection calling onRefreshComplete after successful re-auth
            act(() => {
                capturedOnRefreshComplete?.();
            });

            await waitFor(() => {
                expect(screen.getByText('Connection refreshed')).toBeOnTheScreen();
                expect(screen.getByTestId('confirmation-primary-button')).toBeOnTheScreen();
            });

            // BankConnection should no longer be rendered
            expect(screen.queryByTestId('BankConnection')).toBeNull();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should dismiss modal when Got it button is pressed', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {...LHNTestUtils.getFakePolicy(), role: CONST.POLICY.ROLE.ADMIN, workspaceAccountID: WORKSPACE_ACCOUNT_ID};

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION});
            });

            const {unmount} = renderRefreshPage();
            await waitForBatchedUpdatesWithAct();

            // Trigger the success view
            act(() => {
                capturedOnRefreshComplete?.();
            });

            await waitFor(() => {
                expect(screen.getByTestId('confirmation-primary-button')).toBeOnTheScreen();
            });

            // Press the "Got it" button
            fireEvent.press(screen.getByTestId('confirmation-primary-button'));

            expect(Navigation.dismissModal).toHaveBeenCalled();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should dismiss modal when back button is pressed on success view', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {...LHNTestUtils.getFakePolicy(), role: CONST.POLICY.ROLE.ADMIN, workspaceAccountID: WORKSPACE_ACCOUNT_ID};

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION});
            });

            const {unmount} = renderRefreshPage();
            await waitForBatchedUpdatesWithAct();

            act(() => {
                capturedOnRefreshComplete?.();
            });

            await waitFor(() => {
                expect(screen.getByText('Connection refreshed')).toBeOnTheScreen();
            });

            const backButton = screen.getByLabelText('Back');
            fireEvent.press(backButton);

            expect(Navigation.dismissModal).toHaveBeenCalled();

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Cleanup', () => {
        it('should call clearAssignCardStepAndData on unmount', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {...LHNTestUtils.getFakePolicy(), role: CONST.POLICY.ROLE.ADMIN, workspaceAccountID: WORKSPACE_ACCOUNT_ID};

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
            });

            const {unmount} = renderRefreshPage();
            await waitForBatchedUpdatesWithAct();

            unmount();
            await waitForBatchedUpdatesWithAct();

            expect(mockClearAssignCardStepAndData).toHaveBeenCalled();
        });
    });
});
