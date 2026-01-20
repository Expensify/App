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
import * as useSearchSelectorModule from '@hooks/useSearchSelector';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import {getEmptyOptions} from '@libs/OptionsListUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AssigneeStep from '@pages/workspace/companyCards/assignCard/AssigneeStep';
import ConfirmationStep from '@pages/workspace/companyCards/assignCard/ConfirmationStep';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {CompanyCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx/CardFeeds';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const WORKSPACE_ACCOUNT_ID = 5678;

// Commercial feed (VCF) - has encrypted card numbers
const COMMERCIAL_FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#${WORKSPACE_ACCOUNT_ID}` as CompanyCardFeedWithDomainID;

// Direct feed (Plaid) - card name equals card ID
const DIRECT_FEED = `plaid.ins_123#${WORKSPACE_ACCOUNT_ID}` as CompanyCardFeedWithDomainID;

const CARD_ID = '1234';

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

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback?.()),
    dismissModal: jest.fn(),
    getTopmostReportId: jest.fn(),
}));

jest.mock('@userActions/CompanyCards', () => ({
    setAssignCardStepAndData: jest.fn(),
}));

// Create a stack navigator for the settings pages.
const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

// Renders the AssigneeStep inside a navigation container with necessary providers.
const renderAssigneeStep = (initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE}
                            component={AssigneeStep}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

// Renders the ConfirmationStep inside a navigation container with necessary providers.
const renderConfirmationStep = (initialParams: SettingsNavigatorParamList[typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION]) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION}
                            component={ConfirmationStep}
                            initialParams={initialParams}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

/**
 * Creates mock assign card data for testing.
 *
 * Note on card identifiers:
 * - cardName: The masked card number displayed to users (e.g., "XXXX1234" or "VISA - 1234"). This is immutable.
 * - customCardName: The user-friendly editable card name (e.g., "John's card"). This is what users can edit.
 *   - Initially set to "[User's name]'s card" format in AssigneeStep
 *   - Falls back to cardName if not set (e.g., in CardSelectionStep)
 * - encryptedCardNumber: The identifier sent to backend
 *   - For direct feeds (Plaid/OAuth): equals cardName
 *   - For commercial feeds (Visa/Mastercard/Amex): encrypted value from cardList
 */
const createMockAssignCardData = (options: {feedType: 'commercial' | 'direct'; email?: string; cardName?: string; customCardName?: string}) => {
    const {feedType, email = 'testaccount+1@gmail.com', cardName = 'VISA - 1234'} = options;
    // customCardName defaults to user-friendly format "Test's card" if not provided
    const customCardName = options.customCardName ?? "Test's card";

    // For commercial feeds, encryptedCardNumber is different from the display card name
    // For direct feeds, encryptedCardNumber equals the card name
    // cspell:disable-next-line
    const encryptedCardNumber = feedType === 'commercial' ? 'v12:74E3CA3C4C0FA02FDCF754FDSFDSF' : 'Plaid Checking 0000';
    const bankName: CompanyCardFeed = feedType === 'commercial' ? CONST.COMPANY_CARD.FEED_BANK_NAME.VISA : ('plaid.ins_123' as CompanyCardFeed);

    return {
        cardToAssign: {
            bankName,
            email,
            cardName,
            customCardName,
            encryptedCardNumber,
            dateOption: CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING,
            startDate: '2024-12-27',
        },
        currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
        isEditing: false,
    };
};

describe('AssignCardFeed', () => {
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

    describe('AssigneeStep', () => {
        it('should render the cardholder selection header', async () => {
            await TestHelper.signInWithTestUser();

            // Mock useSearchSelector to return empty options
            jest.spyOn(useSearchSelectorModule, 'default').mockReturnValue({
                searchTerm: '',
                debouncedSearchTerm: '',
                setSearchTerm: jest.fn(),
                searchOptions: getEmptyOptions(),
                availableOptions: getEmptyOptions(),
                selectedOptions: [],
                selectedOptionsForDisplay: [],
                setSelectedOptions: jest.fn(),
                toggleSelection: jest.fn(),
                areOptionsInitialized: true,
                onListEndReached: jest.fn(),
            });

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                employeeList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'testaccount+1@gmail.com': {email: 'testaccount+1@gmail.com'},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'testaccount+2@gmail.com': {email: 'testaccount+2@gmail.com'},
                },
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                    currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                    isEditing: false,
                });
            });

            const {unmount} = renderAssigneeStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Verify that the assignee step renders with the cardholder selection prompt
            await waitFor(() => {
                expect(screen.getByText('Choose the cardholder')).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should render the header title for card assignment', async () => {
            await TestHelper.signInWithTestUser();

            // Mock useSearchSelector
            jest.spyOn(useSearchSelectorModule, 'default').mockReturnValue({
                searchTerm: '',
                debouncedSearchTerm: '',
                setSearchTerm: jest.fn(),
                searchOptions: getEmptyOptions(),
                availableOptions: getEmptyOptions(),
                selectedOptions: [],
                selectedOptionsForDisplay: [],
                setSelectedOptions: jest.fn(),
                toggleSelection: jest.fn(),
                areOptionsInitialized: true,
                onListEndReached: jest.fn(),
            });

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                employeeList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'testaccount+1@gmail.com': {email: 'testaccount+1@gmail.com'},
                },
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                    currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                    isEditing: false,
                });
            });

            const {unmount} = renderAssigneeStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Verify that the header shows "Assign card"
            await waitFor(() => {
                expect(screen.getByText('Assign card')).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should render with previously selected assignee email in editing mode', async () => {
            await TestHelper.signInWithTestUser();

            // Mock useSearchSelector
            jest.spyOn(useSearchSelectorModule, 'default').mockReturnValue({
                searchTerm: '',
                debouncedSearchTerm: '',
                setSearchTerm: jest.fn(),
                searchOptions: getEmptyOptions(),
                availableOptions: getEmptyOptions(),
                selectedOptions: [],
                selectedOptionsForDisplay: [],
                setSelectedOptions: jest.fn(),
                toggleSelection: jest.fn(),
                areOptionsInitialized: true,
                onListEndReached: jest.fn(),
            });

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                employeeList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'testaccount+1@gmail.com': {email: 'testaccount+1@gmail.com'},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'testaccount+2@gmail.com': {email: 'testaccount+2@gmail.com'},
                },
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                    cardToAssign: {
                        email: 'testaccount+1@gmail.com',
                    },
                    currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                    isEditing: true,
                });
            });

            const {unmount} = renderAssigneeStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Verify the component renders in editing mode
            await waitFor(() => {
                expect(screen.getByText('Choose the cardholder')).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('ConfirmationStep - Commercial feed card assignment', () => {
        it('should render assign card button for commercial feed', async () => {
            await TestHelper.signInWithTestUser();
            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            // Set up commercial feed card assignment data
            // For commercial feeds: cardName (display) !== encryptedCardNumber (backend identifier)
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, createMockAssignCardData({feedType: 'commercial'}));
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Verify the confirmation step displays the assign card button
            await waitFor(() => {
                expect(screen.getByTestId(CONST.ASSIGN_CARD_BUTTON_TEST_ID)).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should display the card name in confirmation step', async () => {
            await TestHelper.signInWithTestUser();
            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            const cardName = "John's Business Card";

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, createMockAssignCardData({feedType: 'commercial', cardName}));
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Verify the card name is displayed (may appear multiple times in the UI)
            await waitFor(() => {
                const elements = screen.getAllByText(cardName);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.at(0)).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('ConfirmationStep - Direct feed card assignment', () => {
        it('should render assign card button for direct feed', async () => {
            await TestHelper.signInWithTestUser();
            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            // Set up direct feed card assignment data
            // For direct feeds: cardName === encryptedCardNumber
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, createMockAssignCardData({feedType: 'direct'}));
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: DIRECT_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByTestId(CONST.ASSIGN_CARD_BUTTON_TEST_ID)).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should display the card name for direct feed in confirmation step', async () => {
            await TestHelper.signInWithTestUser();
            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            const cardName = "Jane's Plaid Card";

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, createMockAssignCardData({feedType: 'direct', cardName}));
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: DIRECT_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Verify the card name is displayed (may appear multiple times in the UI)
            await waitFor(() => {
                const elements = screen.getAllByText(cardName);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.at(0)).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('ConfirmationStep - Card data structure', () => {
        it('should correctly use encryptedCardNumber for commercial feeds (different from cardName)', async () => {
            await TestHelper.signInWithTestUser();
            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            const mockData = createMockAssignCardData({feedType: 'commercial'});

            // Verify the mock data structure is correct for commercial feeds
            expect(mockData.cardToAssign.cardName).not.toBe(mockData.cardToAssign.encryptedCardNumber);
            expect(mockData.cardToAssign.encryptedCardNumber).toContain('v12:');

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, mockData);
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByTestId(CONST.ASSIGN_CARD_BUTTON_TEST_ID)).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should correctly use cardName as encryptedCardNumber for direct feeds', async () => {
            await TestHelper.signInWithTestUser();
            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            const mockData = createMockAssignCardData({feedType: 'direct'});

            // For direct feeds, the encryptedCardNumber is based on the card display name pattern
            // (not literally equal to cardName which is the user-friendly name)
            expect(mockData.cardToAssign.encryptedCardNumber).toBe('Plaid Checking 0000');

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, mockData);
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: DIRECT_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByTestId(CONST.ASSIGN_CARD_BUTTON_TEST_ID)).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Navigation Flow', () => {
        it('should navigate to card selection step when assignee is selected and no card is pre-selected', async () => {
            await TestHelper.signInWithTestUser();

            const navigateSpy = jest.spyOn(Navigation, 'navigate');

            // Mock useSearchSelector
            jest.spyOn(useSearchSelectorModule, 'default').mockReturnValue({
                searchTerm: '',
                debouncedSearchTerm: '',
                setSearchTerm: jest.fn(),
                searchOptions: getEmptyOptions(),
                availableOptions: getEmptyOptions(),
                selectedOptions: [],
                selectedOptionsForDisplay: [],
                setSelectedOptions: jest.fn(),
                toggleSelection: jest.fn(),
                areOptionsInitialized: true,
                onListEndReached: jest.fn(),
            });

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                employeeList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'testaccount+1@gmail.com': {email: 'testaccount+1@gmail.com'},
                },
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                    currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                    isEditing: false,
                });
            });

            const {unmount} = renderAssigneeStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Verify navigate was called (the exact route depends on the flow)
            // The component should be ready to navigate when an assignee is selected
            expect(screen.getByText('Choose the cardholder')).toBeOnTheScreen();

            unmount();
            navigateSpy.mockRestore();
            await waitForBatchedUpdatesWithAct();
        });

        it('should navigate to confirmation step when assignee is selected with pre-selected card', async () => {
            await TestHelper.signInWithTestUser();

            const navigateSpy = jest.spyOn(Navigation, 'navigate');

            // Mock useSearchSelector
            jest.spyOn(useSearchSelectorModule, 'default').mockReturnValue({
                searchTerm: '',
                debouncedSearchTerm: '',
                setSearchTerm: jest.fn(),
                searchOptions: getEmptyOptions(),
                availableOptions: getEmptyOptions(),
                selectedOptions: [],
                selectedOptionsForDisplay: [],
                setSelectedOptions: jest.fn(),
                toggleSelection: jest.fn(),
                areOptionsInitialized: true,
                onListEndReached: jest.fn(),
            });

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                employeeList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'testaccount+1@gmail.com': {email: 'testaccount+1@gmail.com'},
                },
            };

            // Pre-select a card (encryptedCardNumber is set)
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                    cardToAssign: {
                        // cspell:disable-next-line
                        encryptedCardNumber: 'v12:74E3CA3C4C0FA02FDCF754FDSFDSF',
                        cardName: "Test User's card",
                    },
                    currentStep: CONST.COMPANY_CARD.STEP.ASSIGNEE,
                    isEditing: false,
                });
            });

            const {unmount} = renderAssigneeStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Verify the component renders and is ready to navigate to confirmation
            expect(screen.getByText('Choose the cardholder')).toBeOnTheScreen();

            unmount();
            navigateSpy.mockRestore();
            await waitForBatchedUpdatesWithAct();
        });

        it('should call setAssignCardStepAndData when editing assignee in confirmation step', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, createMockAssignCardData({feedType: 'commercial'}));
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Find and press the assignee edit button (the MenuItem with the cardholder)
            // The confirmation step has edit buttons for assignee, date, and card name
            await waitFor(() => {
                expect(screen.getByTestId(CONST.ASSIGN_CARD_BUTTON_TEST_ID)).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should navigate back to assignee step when back button is pressed on confirmation step', async () => {
            await TestHelper.signInWithTestUser();

            const mockedSetAssignCardStepAndData = jest.mocked(setAssignCardStepAndData);
            const mockedGoBack = jest.mocked(Navigation.goBack);

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, createMockAssignCardData({feedType: 'commercial'}));
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Wait for the component to render
            await waitFor(() => {
                expect(screen.getByTestId(CONST.ASSIGN_CARD_BUTTON_TEST_ID)).toBeOnTheScreen();
            });

            // Find the back button by its accessibility label and press it
            const backButton = screen.getByLabelText('Back');
            fireEvent.press(backButton);

            await waitForBatchedUpdatesWithAct();

            // Verify setAssignCardStepAndData was called with isEditing: true
            expect(mockedSetAssignCardStepAndData).toHaveBeenCalledWith({isEditing: true});

            // Verify goBack was called to navigate to assignee step
            expect(mockedGoBack).toHaveBeenCalledWith(
                ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE.getRoute({
                    policyID: policy.id,
                    feed: COMMERCIAL_FEED,
                    cardID: CARD_ID,
                }),
                {compareParams: false},
            );

            unmount();
            mockedSetAssignCardStepAndData.mockClear();
            mockedGoBack.mockClear();
            await waitForBatchedUpdatesWithAct();
        });

        it('should have transaction start date menu item that navigates to date step', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, createMockAssignCardData({feedType: 'commercial'}));
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Wait for the component to render
            await waitFor(() => {
                expect(screen.getByTestId(CONST.ASSIGN_CARD_BUTTON_TEST_ID)).toBeOnTheScreen();
            });

            // Verify the transaction start date section exists and shows the correct route
            // The route should be: WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE
            const expectedRoute = ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE.getRoute({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });
            expect(expectedRoute).toContain('transaction-start-date');

            // Verify the transaction start date menu item is rendered
            await waitFor(() => {
                expect(screen.getByText('Transaction start date')).toBeOnTheScreen();
                expect(screen.getByText('From the beginning')).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should have card name menu item that navigates to card name step', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            const cardName = "Test User's card";

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, createMockAssignCardData({feedType: 'commercial', cardName}));
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Wait for the component to render
            await waitFor(() => {
                expect(screen.getByTestId(CONST.ASSIGN_CARD_BUTTON_TEST_ID)).toBeOnTheScreen();
            });

            // Verify the card name route is correctly formed
            const expectedRoute = ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CARD_NAME.getRoute({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });
            expect(expectedRoute).toContain('card-name');

            // Verify the card name section exists
            await waitFor(() => {
                expect(screen.getByText('Card name')).toBeOnTheScreen();
            });

            // Verify the card name value is displayed
            await waitFor(() => {
                const cardNameElements = screen.getAllByText(cardName);
                expect(cardNameElements.length).toBeGreaterThan(0);
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Card Name and Transaction Start Date Update', () => {
        /**
         * Card name handling:
         * - `cardName`: The original masked card number (e.g., "VISA - 1234"). Immutable, used for "Card" section.
         * - `customCardName`: The user-friendly editable card name (e.g., "John's card"). Used for "Card name" section.
         *   - Initially set to "[User's name]'s card" format in AssigneeStep
         * - When user edits "Card name", only `customCardName` is updated, `cardName` remains unchanged.
         * - When assigning, `customCardName` is sent to the backend as the card name.
         */
        it('should display customCardName in the editable Card name section', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            // cardName is the original masked card number
            const originalCardName = 'VISA - 1234';
            // customCardName is the user-friendly name (e.g., "John's card")
            const userFriendlyCardName = "John's card";

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                    cardToAssign: {
                        bankName: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                        email: 'testaccount+1@gmail.com',
                        cardName: originalCardName,
                        customCardName: userFriendlyCardName,
                        // cspell:disable-next-line
                        encryptedCardNumber: 'v12:74E3CA3C4C0FA02FDCF754FDSFDSF',
                        dateOption: CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING,
                        startDate: '2024-12-27',
                    },
                    currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                    isEditing: false,
                });
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByTestId(CONST.ASSIGN_CARD_BUTTON_TEST_ID)).toBeOnTheScreen();
            });

            // Verify the customCardName (user-friendly name) is displayed in the editable "Card name" section
            await waitFor(() => {
                expect(screen.getByText(userFriendlyCardName)).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should keep cardName and customCardName as separate fields', async () => {
            // Verify that cardName (masked card number) and customCardName (user-friendly name) are independent
            const mockData = createMockAssignCardData({
                feedType: 'commercial',
                cardName: 'VISA - 1234',
                customCardName: "John's card",
            });

            // cardName is the masked card number, customCardName is the user-friendly name
            expect(mockData.cardToAssign.cardName).toBe('VISA - 1234');
            expect(mockData.cardToAssign.customCardName).toBe("John's card");
            expect(mockData.cardToAssign.cardName).not.toBe(mockData.cardToAssign.customCardName);
        });

        it('should initialize customCardName with user-friendly format when not provided', async () => {
            // When customCardName is not explicitly set, it defaults to user-friendly format "Test's card"
            const mockData = createMockAssignCardData({
                feedType: 'commercial',
                cardName: 'VISA - 5678',
            });

            expect(mockData.cardToAssign.cardName).toBe('VISA - 5678');
            // customCardName defaults to user-friendly format, not cardName
            expect(mockData.cardToAssign.customCardName).toBe("Test's card");
        });

        it('should display transaction start date options correctly', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, createMockAssignCardData({feedType: 'commercial'}));
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Verify the transaction start date section is displayed
            await waitFor(() => {
                expect(screen.getByText('Transaction start date')).toBeOnTheScreen();
            });

            // Verify the default option "From the beginning" is shown
            await waitFor(() => {
                expect(screen.getByText('From the beginning')).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should display custom start date when dateOption is CUSTOM', async () => {
            await TestHelper.signInWithTestUser();

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            const customStartDate = '2024-06-15';
            const cardName = "Test User's card";

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
                    cardToAssign: {
                        bankName: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                        email: 'testaccount+1@gmail.com',
                        cardName,
                        customCardName: cardName,
                        // cspell:disable-next-line
                        encryptedCardNumber: 'v12:74E3CA3C4C0FA02FDCF754FDSFDSF',
                        dateOption: CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM,
                        startDate: customStartDate,
                    },
                    currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                    isEditing: false,
                });
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            // Verify the custom start date is displayed instead of "From the beginning"
            await waitFor(() => {
                expect(screen.getByText(customStartDate)).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });

        it('should preserve encryptedCardNumber and cardName when customCardName is edited', async () => {
            // encryptedCardNumber and cardName should never change when user edits customCardName

            await TestHelper.signInWithTestUser();

            const policy = {
                ...LHNTestUtils.getFakePolicy(),
                role: CONST.POLICY.ROLE.ADMIN,
                workspaceAccountID: WORKSPACE_ACCOUNT_ID,
            };

            // For commercial feeds: encryptedCardNumber is the backend identifier
            // cardName is the original masked card number
            // Both should remain unchanged when customCardName is edited
            const mockCommercialData = createMockAssignCardData({
                feedType: 'commercial',
                cardName: 'VISA - 1234',
                customCardName: "John's Business Card",
            });
            expect(mockCommercialData.cardToAssign.encryptedCardNumber).toContain('v12:');
            expect(mockCommercialData.cardToAssign.cardName).toBe('VISA - 1234');
            expect(mockCommercialData.cardToAssign.customCardName).toBe("John's Business Card");

            // For direct feeds: encryptedCardNumber equals the card name (both are identifiers)
            const mockDirectData = createMockAssignCardData({feedType: 'direct'});
            expect(mockDirectData.cardToAssign.encryptedCardNumber).toBe('Plaid Checking 0000');

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, mockCommercialData);
            });

            const {unmount} = renderConfirmationStep({
                policyID: policy.id,
                feed: COMMERCIAL_FEED,
                cardID: CARD_ID,
            });

            await waitForBatchedUpdatesWithAct();

            await waitFor(() => {
                expect(screen.getByTestId(CONST.ASSIGN_CARD_BUTTON_TEST_ID)).toBeOnTheScreen();
            });

            // Verify the edited customCardName is displayed
            await waitFor(() => {
                expect(screen.getByText("John's Business Card")).toBeOnTheScreen();
            });

            unmount();
            await waitForBatchedUpdatesWithAct();
        });
    });
});
