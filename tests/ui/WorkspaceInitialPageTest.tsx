import {render, waitFor} from '@testing-library/react-native';

import {openPolicyInitialPage} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';

import {WorkspaceInitialPage} from '@pages/workspace/WorkspaceInitialPage';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

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

jest.mock('@hooks/useCardFeedErrors', () => () => ({shouldShowRbrForWorkspaceAccountID: {}}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({convertToDisplayString: jest.fn()})}));
jest.mock('@hooks/useGetReceiptPartnersIntegrationData', () => () => ({shouldShowEnterCredentialsError: false}));
jest.mock('@hooks/useIsWorkspacesTabFocused', () => () => mockIsWorkspacesTabFocused);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: () => 'icon'}),
}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => false}));
jest.mock('@hooks/usePolicyConnectionsPrefetch', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: true}));
jest.mock('@hooks/useSingleExecution', () => () => ({singleExecution: (callback: () => void) => callback, isExecuting: false}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    flexColumn: {},
    mh3: {},
    mt3: {},
    overflowVisible: {},
    pb4: {},
    pb14: {},
    ph5: {},
    pv2: {},
    sectionMenuItem: () => ({}),
}));
jest.mock('@hooks/useWaitForNavigation', () => () => (callback: () => void) => callback);
jest.mock('@hooks/useWorkspaceAccountID', () => jest.fn());

jest.mock('@components/BlockingViews/FullPageNotFoundView', () => (props: {children: React.ReactNode; shouldShow: boolean}) => mockFullPageNotFoundView(props));
jest.mock('@components/HeaderWithBackButton', () => jest.fn());
jest.mock('@components/HighlightableMenuItem', () => jest.fn());
jest.mock('@components/Navigation/TabBarBottomContent', () => jest.fn());
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
        mockActiveRoute = undefined;
        mockIsWorkspacesTabFocused = true;
    });

    it('waits for route params before fetching policy data, showing Not Found, or closing the RHP', async () => {
        const props = createMock<React.ComponentProps<typeof WorkspaceInitialPage>>({route: {params: undefined}});
        render(<WorkspaceInitialPage {...props} />);

        expect(openPolicyInitialPage).not.toHaveBeenCalled();
        expect(mockFullPageNotFoundView).toHaveBeenCalledWith(expect.objectContaining({shouldShow: false}));
        await waitFor(() => expect(Navigation.closeRHPFlow).not.toHaveBeenCalled());
    });

    it('evaluates closing the RHP independently for each policy', async () => {
        mockActiveRoute = 'inaccessible-workspace-route';
        const firstProps = createMock<React.ComponentProps<typeof WorkspaceInitialPage>>({route: {params: {policyID: 'policy-1'}}});
        const {rerender} = render(<WorkspaceInitialPage {...firstProps} />);
        await waitFor(() => expect(Navigation.closeRHPFlow).toHaveBeenCalledTimes(1));

        const secondProps = createMock<React.ComponentProps<typeof WorkspaceInitialPage>>({route: {params: {policyID: 'policy-2'}}});
        rerender(<WorkspaceInitialPage {...secondProps} />);
        await waitFor(() => expect(Navigation.closeRHPFlow).toHaveBeenCalledTimes(2));
    });

    it('does not retain Not Found after the route policy changes', () => {
        const firstProps = createMock<React.ComponentProps<typeof WorkspaceInitialPage>>({route: {params: {policyID: 'policy-1'}}});
        const {rerender} = render(<WorkspaceInitialPage {...firstProps} />);
        expect(mockFullPageNotFoundView).toHaveBeenLastCalledWith(expect.objectContaining({shouldShow: true}));

        mockIsWorkspacesTabFocused = false;
        const secondProps = createMock<React.ComponentProps<typeof WorkspaceInitialPage>>({route: {params: {policyID: 'policy-2'}}});
        rerender(<WorkspaceInitialPage {...secondProps} />);

        expect(mockFullPageNotFoundView).toHaveBeenLastCalledWith(expect.objectContaining({shouldShow: false}));
    });
});
