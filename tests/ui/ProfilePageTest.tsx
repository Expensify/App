import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import type * as ReactNavigation from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import DelegateNoAccessModalProvider from '@components/DelegateNoAccessModalProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as AgentActions from '@libs/actions/Agent';
import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsSplitNavigatorParamList} from '@libs/Navigation/types';
import ProfilePage from '@pages/settings/Profile/ProfilePage';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@components/RenderHTML', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{children?: React.ReactNode}>};

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

jest.mock('@libs/actions/Agent', () => ({
    openAgentsPage: jest.fn(),
    clearAgentPromptUpdateError: jest.fn(),
    openProfilePage: jest.fn(),
    updateAgentPrompt: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: jest.fn(() => ({params: {}})),
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
        usePreventRemove: jest.fn(),
    };
});

// Replace MenuItemWithTopDescription with a simple test double that exposes props in the tree
jest.mock('@components/MenuItemWithTopDescription', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{testID: string; children?: React.ReactNode}>};
    return ({pressableTestID, brickRoadIndicator}: {pressableTestID: string; brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>}) =>
        ReactMock.createElement(Text, {testID: pressableTestID}, `${brickRoadIndicator ?? 'none'}-brickRoadIndicator`);
});

describe('ProfilePage contact method indicator', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        return Onyx.clear();
    });

    function renderPage() {
        return render(
            <NavigationContainer>
                <ComposeProviders components={[DelegateNoAccessModalProvider]}>
                    <ProfilePage
                        // @ts-expect-error - route typing is not necessary for this test
                        route={{}}
                        navigation={{}}
                    />
                </ComposeProviders>
            </NavigationContainer>,
        );
    }

    it('shows error when login list has errors', async () => {
        const email = 'user@example.com';

        // Current user provided by mocked hook uses the same email
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [email]: {
                partnerUserID: email,
                validatedDate: '',
                errorFields: {anyError: {message: 'oops'}},
            },
        });
        await waitForBatchedUpdates();

        renderPage();

        // Description for contact methods is 'contacts.contactMethods' via mocked translate
        let node = screen.getByText('error-brickRoadIndicator');
        expect(node).toBeDefined();

        // Verify that RBR disappears
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [email]: {
                partnerUserID: email,
                validatedDate: '2024-02-02',
                errorFields: null,
            },
        });

        await waitFor(() => {
            node = screen.getByTestId('contact-method-menu-item');

            // ContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
            expect(node).toHaveTextContent('none-brickRoadIndicator');
        });
    });

    it('shows info when there is an unvalidated secondary login', async () => {
        const defaultEmail = 'user@example.com';
        const otherEmail = 'other@example.com';
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [defaultEmail]: {
                partnerUserID: defaultEmail,
                validatedDate: '2024-01-01',
            },
            [otherEmail]: {
                partnerUserID: otherEmail,
                validatedDate: '',
            },
        });
        await waitForBatchedUpdates();

        renderPage();

        let node = screen.getByText('info-brickRoadIndicator');
        expect(node).toBeDefined();

        // Verify that GBR disappears
        Onyx.merge(ONYXKEYS.LOGIN_LIST, {
            [otherEmail]: {
                partnerUserID: otherEmail,
                validatedDate: '2024-02-02',
            },
        });

        await waitFor(() => {
            node = screen.getByTestId('contact-method-menu-item');

            // ContactMethodsPage sets brickRoadIndicator to 'info' for non-default unvalidated logins
            expect(node).toHaveTextContent('none-brickRoadIndicator');
        });
    });
});

const Stack = createPlatformStackNavigator<SettingsSplitNavigatorParamList>();

const renderPageWithNavigation = (initialRouteName: typeof SCREENS.SETTINGS.PROFILE.ROOT) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={initialRouteName}>
                        <Stack.Screen
                            name={SCREENS.SETTINGS.PROFILE.ROOT}
                            component={ProfilePage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
};

describe('ProfilePage - agent account', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en' as const);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    async function setupUser(email: string) {
        const accountID = 123;
        await TestHelper.signInWithTestUser(accountID, email);

        const personalDetails: PersonalDetailsList = {
            [accountID]: {
                accountID,
                login: email,
                displayName: email,
                avatar: 'https://example.com/avatar.png',
                avatarThumbnail: 'https://example.com/avatar.png',
            } as PersonalDetails,
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        await waitForBatchedUpdatesWithAct();
    }

    it('hides contact methods, pronouns, timezone and private section for agent account', async () => {
        await setupUser('agent_123@expensify.ai');

        renderPageWithNavigation(SCREENS.SETTINGS.PROFILE.ROOT);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('contact-method-menu-item')).toBeNull();
        expect(screen.queryByTestId('pronouns-menu-item')).toBeNull();
        expect(screen.queryByTestId('timezone-menu-item')).toBeNull();
        expect(screen.queryByText('Private')).toBeNull();
    });

    it('shows contact methods, pronouns, timezone and private section for non-agent account', async () => {
        await setupUser('user@expensify.com');

        renderPageWithNavigation(SCREENS.SETTINGS.PROFILE.ROOT);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('contact-method-menu-item')).toBeDefined();
        expect(screen.getByTestId('pronouns-menu-item')).toBeDefined();
        expect(screen.getByTestId('timezone-menu-item')).toBeDefined();
        expect(screen.getByText('Private')).toBeDefined();
    });

    it('shows AI prompt section with prompt text for agent account', async () => {
        const accountID = 123;
        await setupUser('agent_123@expensify.ai');

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, {
                prompt: 'Reject gambling expenses.',
                pendingAction: null,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderPageWithNavigation(SCREENS.SETTINGS.PROFILE.ROOT);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('ai-prompt-input')).toBeDefined();
        expect(screen.getByTestId('ai-prompt-input').props.value).toBe('Reject gambling expenses.');
        expect(screen.getByTestId('save-prompt-button')).toBeDefined();
    });

    it('hides AI prompt section for non-agent account', async () => {
        await setupUser('user@expensify.com');

        renderPageWithNavigation(SCREENS.SETTINGS.PROFILE.ROOT);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('ai-prompt-input')).toBeNull();
        expect(screen.queryByTestId('save-prompt-button')).toBeNull();
    });

    it('calls openProfilePage on mount for agent account', async () => {
        const mockOpenProfilePage = jest.mocked(AgentActions.openProfilePage);
        await setupUser('agent_123@expensify.ai');

        renderPageWithNavigation(SCREENS.SETTINGS.PROFILE.ROOT);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenProfilePage).toHaveBeenCalledTimes(1);
    });

    it('does not call openProfilePage on mount for non-agent account', async () => {
        const mockOpenProfilePage = jest.mocked(AgentActions.openProfilePage);
        await setupUser('user@expensify.com');

        renderPageWithNavigation(SCREENS.SETTINGS.PROFILE.ROOT);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenProfilePage).not.toHaveBeenCalled();
    });

    it('calls updateAgentPrompt when saving non-empty prompt', async () => {
        const accountID = 123;
        const mockUpdateAgentPrompt = jest.mocked(AgentActions.updateAgentPrompt);
        await setupUser('agent_123@expensify.ai');

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, {
                prompt: 'Reject gambling expenses.',
                pendingAction: null,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderPageWithNavigation(SCREENS.SETTINGS.PROFILE.ROOT);
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(screen.getByTestId('ai-prompt-input'), 'Updated prompt text');
        fireEvent.press(screen.getByTestId('save-prompt-button'));
        await waitForBatchedUpdatesWithAct();

        expect(mockUpdateAgentPrompt).toHaveBeenCalledWith(accountID, 'Updated prompt text', 'Reject gambling expenses.');
        expect(screen.getByTestId('ai-prompt-input')).toBeDefined();
    });

    it('shows loading state on save button while prompt update is pending', async () => {
        const accountID = 123;
        await setupUser('agent_123@expensify.ai');

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, {
                prompt: 'Reject gambling expenses.',
                pendingAction: 'update',
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderPageWithNavigation(SCREENS.SETTINGS.PROFILE.ROOT);
        await waitForBatchedUpdatesWithAct();

        const saveButtonProps = screen.getByTestId('save-prompt-button').props as {accessibilityState?: {disabled?: boolean}};
        expect(saveButtonProps.accessibilityState?.disabled).toBe(true);
    });

    it('does not call updateAgentPrompt when saving blank prompt', async () => {
        const accountID = 123;
        const mockUpdateAgentPrompt = jest.mocked(AgentActions.updateAgentPrompt);
        await setupUser('agent_123@expensify.ai');

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${accountID}`, {
                prompt: 'Reject gambling expenses.',
                pendingAction: null,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderPageWithNavigation(SCREENS.SETTINGS.PROFILE.ROOT);
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(screen.getByTestId('ai-prompt-input'), '   ');
        fireEvent.press(screen.getByTestId('save-prompt-button'));
        await waitForBatchedUpdatesWithAct();

        expect(mockUpdateAgentPrompt).not.toHaveBeenCalled();
        expect(screen.getByTestId('ai-prompt-input')).toBeDefined();
    });
});

describe('ProfilePage - SMS domain handling', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en' as const);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('should not display @expensify.sms domain for phone number users', async () => {
        const phoneNumber = '+15857527441';
        const accountID = 123;

        await TestHelper.signInWithTestUser(accountID, `${phoneNumber}@expensify.sms`);

        const personalDetails: PersonalDetailsList = {
            [accountID]: {
                accountID,
                login: `${phoneNumber}@expensify.sms`,
                displayName: `${phoneNumber}@expensify.sms`,
                avatar: 'https://example.com/avatar.png',
                avatarThumbnail: 'https://example.com/avatar.png',
            } as PersonalDetails,
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        await waitForBatchedUpdatesWithAct();

        renderPageWithNavigation(SCREENS.SETTINGS.PROFILE.ROOT);

        await waitForBatchedUpdatesWithAct();

        // Get the component tree and stringify to check for @expensify.sms
        const tree = screen.toJSON();
        const treeString = JSON.stringify(tree);

        // Verify @expensify.sms is NOT present in the display name field
        // The display name field should show the formatted phone number without the domain
        expect(treeString).not.toContain(`${phoneNumber}@expensify.sms`);
        expect(treeString).not.toContain('@expensify.sms');
    });

    it('should not display @expensify.sms domain when user has custom display name', async () => {
        const phoneNumber = '+15857527441';
        const accountID = 123;
        const customDisplayName = 'John Doe';

        await TestHelper.signInWithTestUser(accountID, `${phoneNumber}@expensify.sms`);

        const personalDetails: PersonalDetailsList = {
            [accountID]: {
                accountID,
                login: `${phoneNumber}@expensify.sms`,
                displayName: customDisplayName,
                firstName: 'John',
                lastName: 'Doe',
                avatar: 'https://example.com/avatar.png',
                avatarThumbnail: 'https://example.com/avatar.png',
            } as PersonalDetails,
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });

        await waitForBatchedUpdatesWithAct();

        renderPageWithNavigation(SCREENS.SETTINGS.PROFILE.ROOT);

        await waitForBatchedUpdatesWithAct();

        // Verify @expensify.sms is NOT present anywhere on the page
        const tree = screen.toJSON();
        const treeString = JSON.stringify(tree);
        expect(treeString).not.toContain('@expensify.sms');
        expect(treeString).not.toContain(`${phoneNumber}@expensify.sms`);
    });
});
