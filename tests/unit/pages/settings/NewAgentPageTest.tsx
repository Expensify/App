import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import useNetwork from '@hooks/useNetwork';
import useSuggestedAgents from '@hooks/useSuggestedAgents';

import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import NewAgentPage from '@pages/settings/Agents/NewAgentPage';

import {clearNewAgentTemplate, setNewAgentTemplate} from '@userActions/Agent';

import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type SuggestedAgent from '@src/types/onyx/SuggestedAgent';

import React from 'react';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Bot: 'Bot'})),
    useMemoizedLazyIllustrations: jest.fn(() => ({Lightbulb: 'Lightbulb'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useNetwork');
jest.mock('@hooks/useSuggestedAgents');
jest.mock('@hooks/useTheme', () => jest.fn(() => ({icon: '#000'})));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);
jest.mock('@userActions/Agent', () => ({
    setNewAgentTemplate: jest.fn(() => Promise.resolve()),
    clearNewAgentTemplate: jest.fn(() => Promise.resolve()),
    getAgenTemplates: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));
jest.mock('@components/Avatar', () => jest.fn(() => null));
jest.mock('@components/ActivityIndicator', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: React.ComponentType<{testID?: string}>}>('react-native');
    return jest.fn(() => ReactModule.createElement(View, {testID: 'new-agent-templates-loading-indicator'}));
});
jest.mock('@components/BlockingViews/BlockingView', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({title, subtitle}: {title: string; subtitle?: string}) =>
        ReactModule.createElement(ReactModule.Fragment, null, ReactModule.createElement(Text, null, title), subtitle ? ReactModule.createElement(Text, null, subtitle) : null);
});
jest.mock('@components/ButtonComposed', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<{
        Pressable: React.ComponentType<{accessibilityRole?: string; onPress?: () => void; children?: React.ReactNode}>;
        Text: React.ComponentType<{children?: React.ReactNode}>;
    }>('react-native');
    function MockButton({children, onPress}: {children: React.ReactNode; onPress?: () => void}) {
        return ReactModule.createElement(Pressable, {accessibilityRole: 'button', onPress}, children);
    }
    MockButton.Icon = () => null;
    MockButton.Text = ({children}: {children: React.ReactNode}) => ReactModule.createElement(Text, null, children);
    return MockButton;
});
jest.mock('@components/Text', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    return ({children}: {children: React.ReactNode}) => ReactModule.createElement(Text, null, children);
});
jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});
jest.mock('@components/ScrollView', () => {
    function MockScrollView({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScrollView;
});
jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeader({title}: {title: string}) {
        return title;
    }
    return MockHeader;
});

const mockedUseSuggestedAgents = jest.mocked(useSuggestedAgents);
const mockedUseNetwork = jest.mocked(useNetwork);
const mockNavigate = jest.mocked(Navigation.navigate);
const mockSetNewAgentTemplate = jest.mocked(setNewAgentTemplate);
const mockClearNewAgentTemplate = jest.mocked(clearNewAgentTemplate);

type NewAgentRouteProp = PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.NEW>;
type NewAgentNavigationProp = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.NEW>['navigation'];

function makeRoute(params: NewAgentRouteProp['params'] = {}): NewAgentRouteProp {
    return {key: 'Settings_Agents_New-test', name: SCREENS.SETTINGS.AGENTS.NEW, params};
}

function renderNewAgentPage(routeParams: NewAgentRouteProp['params'] = {}) {
    return render(
        <NewAgentPage
            route={makeRoute(routeParams)}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- NewAgentPage only reads `route`; navigation is a required screen prop the test never exercises
            navigation={{} as NewAgentNavigationProp}
        />,
    );
}

const TEMPLATES: SuggestedAgent[] = [
    {id: 't1', name: 'Cheapskate Charlie', description: 'Watches spend.', prompt: 'Reject pricey expenses.'},
    {id: 't2', name: 'Enforcer Eliza', description: 'Keeps records clean.', prompt: 'Require receipts.'},
];

describe('NewAgentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseNetwork.mockReturnValue({isOffline: false});
        mockedUseSuggestedAgents.mockReturnValue({data: TEMPLATES, isLoading: false});
        mockSetNewAgentTemplate.mockResolvedValue(undefined);
        mockClearNewAgentTemplate.mockResolvedValue(undefined);
    });

    it('always renders the build custom agent button', () => {
        renderNewAgentPage();

        expect(screen.getByText('newAgentPage.buildCustomAgent')).toBeOnTheScreen();
    });

    it('renders a card with title and description for each backend template', () => {
        renderNewAgentPage();

        expect(screen.getByText('Cheapskate Charlie')).toBeOnTheScreen();
        expect(screen.getByText('Watches spend.')).toBeOnTheScreen();
        expect(screen.getByText('Enforcer Eliza')).toBeOnTheScreen();
        expect(screen.getByText('Keeps records clean.')).toBeOnTheScreen();
    });

    it('shows a loading indicator while templates are loading and none are cached', () => {
        mockedUseSuggestedAgents.mockReturnValue({data: [], isLoading: true});
        renderNewAgentPage();

        expect(screen.getByTestId('new-agent-templates-loading-indicator')).toBeOnTheScreen();
        expect(screen.queryByText('newAgentPage.emptyTemplatesTitle')).toBeNull();
    });

    it('shows the empty state when there are no templates', () => {
        mockedUseSuggestedAgents.mockReturnValue({data: [], isLoading: false});
        renderNewAgentPage();

        expect(screen.getByText('newAgentPage.emptyTemplatesTitle')).toBeOnTheScreen();
        expect(screen.getByText('newAgentPage.emptyTemplatesSubtitle')).toBeOnTheScreen();
    });

    it('shows the offline empty state instead of a spinner when offline and still loading', () => {
        mockedUseNetwork.mockReturnValue({isOffline: true});
        mockedUseSuggestedAgents.mockReturnValue({data: [], isLoading: true});
        renderNewAgentPage();

        expect(screen.queryByTestId('new-agent-templates-loading-indicator')).toBeNull();
        expect(screen.getByText('newAgentPage.emptyTemplatesTitle')).toBeOnTheScreen();
        expect(screen.getByText('common.youAppearToBeOffline')).toBeOnTheScreen();
    });

    it('shows the offline empty subtitle when offline with no templates', () => {
        mockedUseNetwork.mockReturnValue({isOffline: true});
        mockedUseSuggestedAgents.mockReturnValue({data: [], isLoading: false});
        renderNewAgentPage();

        expect(screen.getByText('newAgentPage.emptyTemplatesTitle')).toBeOnTheScreen();
        expect(screen.getByText('common.youAppearToBeOffline')).toBeOnTheScreen();
        expect(screen.queryByText('newAgentPage.emptyTemplatesSubtitle')).toBeNull();
    });

    it('stashes the picked template and opens the builder when Add is pressed', async () => {
        renderNewAgentPage();

        const firstAddButton = screen.getAllByText('common.add').at(0);
        if (!firstAddButton) {
            throw new Error('Expected at least one template "Add" button');
        }

        fireEvent.press(firstAddButton);

        expect(mockSetNewAgentTemplate).toHaveBeenCalledWith({
            name: 'Cheapskate Charlie',
            prompt: 'Reject pricey expenses.',
            avatarID: AGENT_AVATARS.ordered.at(0)?.id,
        });
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD.getRoute());
        });
    });

    it('clears any stashed template and opens a blank builder when Build custom agent is pressed', async () => {
        renderNewAgentPage();

        fireEvent.press(screen.getByText('newAgentPage.buildCustomAgent'));

        expect(mockClearNewAgentTemplate).toHaveBeenCalledTimes(1);
        expect(mockSetNewAgentTemplate).not.toHaveBeenCalled();
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD.getRoute());
        });
    });

    it('forwards the policyID to the builder route when present', async () => {
        renderNewAgentPage({policyID: 'POL_42'});

        fireEvent.press(screen.getByText('newAgentPage.buildCustomAgent'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD.getRoute({policyID: 'POL_42'}));
        });
    });
});
