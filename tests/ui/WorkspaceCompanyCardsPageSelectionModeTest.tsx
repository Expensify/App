import {fireEvent, render, screen} from '@testing-library/react-native';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import WorkspaceCompanyCardsPage from '@pages/workspace/companyCards/WorkspaceCompanyCardsPage';

import SCREENS from '@src/SCREENS';

import React from 'react';

const POLICY_ID = 'policy123';

const mockClearTableSelection = jest.fn();
const mockGoBack = jest.fn();
const mockTurnOffMobileSelectionMode = jest.fn();
const mockTableProps: {current?: {isSelectionModeEnabled: boolean; isPolicyLoaded: boolean; isPageFetchPending: boolean}} = {};
let mockFeedName = 'feed-a';
let mockIsMobileSelectionModeEnabled = true;
let mockShouldUseNarrowLayout = true;
let mockIsOffline = false;
let mockPolicy: {name: string; policyAccountID?: number; employeeList: Record<string, unknown>} | undefined = {name: 'Acme', policyAccountID: 123, employeeList: {}};
let mockAllCardFeeds: Record<string, unknown> | undefined = {feed: {}};

jest.mock('@components/DecisionModal', () => () => null);

jest.mock('@components/Tables/WorkspaceCompanyCardsTable', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const ReactMock = require('react');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const MockWorkspaceCompanyCardsTable = ReactMock.forwardRef(
        ({isSelectionModeEnabled, isPolicyLoaded, isPageFetchPending}: {isSelectionModeEnabled: boolean; isPolicyLoaded: boolean; isPageFetchPending: boolean}, ref: unknown) => {
            mockTableProps.current = {isSelectionModeEnabled, isPolicyLoaded, isPageFetchPending};
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            ReactMock.useImperativeHandle(ref, () => ({clearSelection: mockClearTableSelection}));
            return <View testID="WorkspaceCompanyCardsTable" />;
        },
    );

    return {
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        default: MockWorkspaceCompanyCardsTable,
    };
});

jest.mock('@hooks/useAssignCard', () => ({
    __esModule: true,
    default: () => ({assignCard: jest.fn(), isAssigningCardDisabled: false}),
}));

jest.mock('@hooks/useCompanyCards', () => ({
    __esModule: true,
    default: () => ({
        allCardFeeds: mockAllCardFeeds,
        feedName: mockFeedName,
        selectedFeed: undefined,
        bankName: undefined,
        isFeedPending: false,
        isFeedAdded: false,
        onyxMetadata: {cardListMetadata: {status: 'loaded'}},
    }),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({login: 'admin@example.com'}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({CompanyCard: 'CompanyCard'}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useMobileSelectionMode', () => ({
    __esModule: true,
    default: () => mockIsMobileSelectionModeEnabled,
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

jest.mock('@hooks/usePolicy', () => ({
    __esModule: true,
    default: () => mockPolicy,
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}),
}));

jest.mock('@hooks/useWorkspaceDocumentTitle', () => jest.fn());

jest.mock('@libs/actions/MobileSelectionMode', () => ({
    turnOffMobileSelectionMode: () => {
        mockTurnOffMobileSelectionMode();
    },
}));
jest.mock('@libs/CardUtils', () => ({getDomainOrWorkspaceAccountID: () => 123}));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        goBack: () => {
            mockGoBack();
        },
    },
}));
jest.mock('@libs/PolicyUtils', () => ({
    canMemberWrite: () => true,
    getMemberAccountIDsForWorkspace: () => ({}),
}));

jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@pages/workspace/WorkspacePageWithSections', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {Pressable, Text, View} = require('react-native');
    return ({
        children,
        headerText,
        icon,
        onBackButtonPress,
        shouldUseHeadlineHeader,
    }: {
        children: React.ReactNode;
        headerText: string;
        icon?: unknown;
        onBackButtonPress: () => void;
        shouldUseHeadlineHeader?: boolean;
    }) => (
        <View>
            <Text testID="WorkspaceCompanyCardsPageHeader">{headerText}</Text>
            {icon !== undefined && <View testID="WorkspaceCompanyCardsPageIcon" />}
            <Text testID="WorkspaceCompanyCardsPageHeadlineMode">{String(shouldUseHeadlineHeader)}</Text>
            <Pressable
                testID="WorkspaceCompanyCardsPageBackButton"
                accessibilityRole="button"
                onPress={onBackButtonPress}
            />
            {children}
        </View>
    );
});

jest.mock('@userActions/CompanyCards', () => ({
    openPolicyCompanyCardsFeed: jest.fn(),
    openPolicyCompanyCardsPage: jest.fn(),
}));

jest.mock('@src/types/utils/isLoadingOnyxValue', () => ({
    __esModule: true,
    default: () => false,
}));

type WorkspaceCompanyCardsPageScreenProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS>;

const route: WorkspaceCompanyCardsPageScreenProps['route'] = {
    key: 'workspace-company-cards',
    name: SCREENS.WORKSPACE.COMPANY_CARDS,
    params: {policyID: POLICY_ID},
};
// The screen does not read navigation; this inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as WorkspaceCompanyCardsPageScreenProps['navigation'];

function getWorkspaceCompanyCardsPage() {
    return (
        <WorkspaceCompanyCardsPage
            route={route}
            navigation={navigation}
        />
    );
}

function resetMocks() {
    jest.clearAllMocks();
    mockTableProps.current = undefined;
    mockFeedName = 'feed-a';
    mockIsMobileSelectionModeEnabled = true;
    mockShouldUseNarrowLayout = true;
    mockIsOffline = false;
    mockPolicy = {name: 'Acme', policyAccountID: 123, employeeList: {}};
    mockAllCardFeeds = {feed: {}};
}

describe('WorkspaceCompanyCardsPage selection mode', () => {
    beforeEach(resetMocks);

    it('uses the focused select header and table controls in narrow-layout selection mode', () => {
        render(getWorkspaceCompanyCardsPage());

        expect(screen.getByText('common.selectMultiple')).toBeTruthy();
        expect(screen.queryByTestId('WorkspaceCompanyCardsPageIcon')).toBeNull();
        expect(screen.getByText('false')).toBeTruthy();
        expect(mockTableProps.current?.isSelectionModeEnabled).toBe(true);
    });

    it('keeps the normal company cards header when the layout is not narrow', () => {
        mockShouldUseNarrowLayout = false;

        render(getWorkspaceCompanyCardsPage());

        expect(screen.getByText('workspace.common.companyCards')).toBeTruthy();
        expect(screen.queryByTestId('WorkspaceCompanyCardsPageIcon')).toBeNull();
        expect(screen.getByText('true')).toBeTruthy();
        expect(mockTableProps.current?.isSelectionModeEnabled).toBe(false);
    });

    it('clears the selected rows and exits selection mode from the back button', () => {
        render(getWorkspaceCompanyCardsPage());

        fireEvent.press(screen.getByTestId('WorkspaceCompanyCardsPageBackButton'));

        expect(mockClearTableSelection).toHaveBeenCalledTimes(1);
        expect(mockTurnOffMobileSelectionMode).toHaveBeenCalledTimes(1);
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('does not exit selection mode when the feed changes', () => {
        const {rerender} = render(getWorkspaceCompanyCardsPage());

        mockFeedName = 'feed-b';
        rerender(getWorkspaceCompanyCardsPage());

        expect(mockTurnOffMobileSelectionMode).not.toHaveBeenCalled();
        expect(mockClearTableSelection).not.toHaveBeenCalled();
    });
});

describe('WorkspaceCompanyCardsPage isPolicyLoaded', () => {
    beforeEach(resetMocks);

    it('reports the policy as loaded once its account ID has been returned', () => {
        render(getWorkspaceCompanyCardsPage());

        expect(mockTableProps.current?.isPolicyLoaded).toBe(true);
    });

    it('reports the policy as not loaded while a freshly created workspace has no account ID yet', () => {
        mockPolicy = {name: 'Acme', employeeList: {}};

        render(getWorkspaceCompanyCardsPage());

        expect(mockTableProps.current?.isPolicyLoaded).toBe(false);
    });

    it('reports the policy as loaded when its account ID resolved to 0, so the feeds load error can surface', () => {
        mockPolicy = {name: 'Acme', policyAccountID: 0, employeeList: {}};

        render(getWorkspaceCompanyCardsPage());

        expect(mockTableProps.current?.isPolicyLoaded).toBe(true);
    });

    it('reports the policy as loaded offline, where the account ID can never resolve', () => {
        mockPolicy = {name: 'Acme', employeeList: {}};
        mockIsOffline = true;

        render(getWorkspaceCompanyCardsPage());

        expect(mockTableProps.current?.isPolicyLoaded).toBe(true);
    });

    it('reports the policy as not loaded when there is no policy at all', () => {
        mockPolicy = undefined;

        render(getWorkspaceCompanyCardsPage());

        expect(mockTableProps.current?.isPolicyLoaded).toBe(false);
    });
});

describe('WorkspaceCompanyCardsPage isPageFetchPending', () => {
    beforeEach(resetMocks);

    it('reports the page fetch as pending while no feeds are cached for the workspace', () => {
        mockAllCardFeeds = undefined;

        render(getWorkspaceCompanyCardsPage());

        expect(mockTableProps.current?.isPageFetchPending).toBe(true);
    });

    it('reports the page fetch as settled once feeds are cached, since it is no longer re-fetched', () => {
        render(getWorkspaceCompanyCardsPage());

        expect(mockTableProps.current?.isPageFetchPending).toBe(false);
    });
});
