import {render, screen} from '@testing-library/react-native';

import HighlightableMenuItem from '@components/HighlightableMenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {openPolicyInitialPage} from '@libs/actions/Policy/Policy';

import {WorkspaceInitialPage} from '@pages/workspace/WorkspaceInitialPage';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';
import type * as ReactNative from 'react-native';

import React from 'react';
import {Text as RNText} from 'react-native';

import createMock from '../utils/createMock';

const mockFullPageNotFoundView = jest.fn(({children}: {children: React.ReactNode}) => children);
let mockActiveRoute: string | undefined;
let mockIsWorkspacesTabFocused = true;

jest.mock('@libs/actions/Policy/Policy', () => ({
    clearErrors: jest.fn(),
    openPolicyInitialPage: jest.fn(),
    removeWorkspace: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    closeRHPFlow: jest.fn(),
    isNavigationReady: () => Promise.resolve(),
}));

jest.mock('@react-navigation/native', () => {
    const navigation = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...navigation,
        useFocusEffect: (callback: () => void) => callback(),
        useIsFocused: () => true,
        useNavigationState: () => mockActiveRoute,
    };
});

jest.mock('@hooks/useBeforeRemove', () => jest.fn());
jest.mock('@hooks/useCardFeedErrors', () => () => ({shouldShowRbrForWorkspaceAccountID: {}}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({convertToDisplayString: jest.fn()})}));
jest.mock('@hooks/useGetReceiptPartnersIntegrationData', () => () => ({shouldShowEnterCredentialsError: false}));
jest.mock('@hooks/useIsWorkspacesTabFocused', () => () => mockIsWorkspacesTabFocused);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: () => 'icon'}),
}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false}));
jest.mock('@hooks/usePolicyConnectionsPrefetch', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: true}));
jest.mock('@hooks/useSingleExecution', () => () => ({singleExecution: (callback: () => void) => callback, isExecuting: false}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    flexColumn: {},
    mh3: {},
    mt3: {},
    mt5: {},
    overflowVisible: {},
    pb4: {},
    pb14: {},
    ph4: {},
    ph5: {},
    pv2: {},
    sectionMenuItem: () => ({}),
    sectionTitle: {},
}));
jest.mock('@hooks/useWaitForNavigation', () => () => (callback: () => void) => callback);
jest.mock('@hooks/useWorkspaceAccountID', () => jest.fn());

jest.mock('@components/BlockingViews/FullPageNotFoundView', () => (props: {children: React.ReactNode; shouldShow: boolean}) => mockFullPageNotFoundView(props));
jest.mock('@components/HeaderWithBackButton', () => jest.fn());
jest.mock('@components/HighlightableMenuItem', () => jest.fn());
jest.mock('@components/Text', () => {
    const {Text: MockText} = jest.requireActual<typeof ReactNative>('react-native');
    return MockText;
});
jest.mock('@components/Navigation/TabBarBottomContent/useTabRootScreenWrapperProps', () => () => ({}));
jest.mock('@components/Navigation/TabBarBottomContent/useTabRootScrollProps', () => () => ({}));
jest.mock(
    '@components/OfflineWithFeedback',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

describe('WorkspaceInitialPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(HighlightableMenuItem).mockReset();
        mockActiveRoute = undefined;
        mockIsWorkspacesTabFocused = true;
    });

    it('waits for route params before fetching policy data', () => {
        const props = createMock<React.ComponentProps<typeof WorkspaceInitialPage>>({route: {params: undefined}});
        render(
            <OnyxListItemProvider>
                <WorkspaceInitialPage {...props} />
            </OnyxListItemProvider>,
        );

        expect(openPolicyInitialPage).not.toHaveBeenCalled();
    });

    it('titles each section above its first visible row and skips sections without rows', () => {
        // Given an admin of a minimal Track workspace, where Categories is the only optional feature enabled
        jest.mocked(HighlightableMenuItem).mockImplementation(({title}) => <RNText>{title}</RNText>);
        const policy = createMock<Policy>({
            id: '1',
            name: 'Track workspace',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            areCategoriesEnabled: true,
        });
        const props = createMock<React.ComponentProps<typeof WorkspaceInitialPage>>({policy, route: {params: {policyID: policy.id}}});

        // When the Workspace menu renders
        render(
            <OnyxListItemProvider>
                <WorkspaceInitialPage {...props} />
            </OnyxListItemProvider>,
        );

        // Then Overview has no title, each non-empty section is titled once, and Spend and Earn get no title because none of their features is on
        expect(screen.getAllByRole(CONST.ROLE.HEADER).map((header) => header.props.children as string)).toEqual([
            'workspace.moreFeatures.organizeSection.title',
            'workspace.moreFeatures.manageSection.title',
            'workspace.moreFeatures.configureSection.title',
        ]);
        expect(screen.getAllByText(/./).map((node) => node.props.children as string)).toEqual([
            'workspace.common.profile',
            'workspace.moreFeatures.organizeSection.title',
            'common.reports',
            'workspace.common.categories',
            'workspace.common.connections',
            'workspace.moreFeatures.manageSection.title',
            'workspace.common.members',
            'agentsPage.title',
            'workspace.common.rooms',
            'workspace.moreFeatures.configureSection.title',
            'workspace.common.moreFeatures',
        ]);
    });
});
