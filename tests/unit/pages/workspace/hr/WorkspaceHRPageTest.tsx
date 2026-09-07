import {fireEvent, render, screen} from '@testing-library/react-native';

import ConnectToHRFlow from '@components/ConnectToHRFlow';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import {getHRCards} from '@pages/workspace/hr/utils';
import type {HRCardDescriptor} from '@pages/workspace/hr/utils';
import WorkspaceHRPage from '@pages/workspace/hr/WorkspaceHRPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type Policy from '@src/types/onyx/Policy';

import type * as ReactNavigationNative from '@react-navigation/native';
import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';
// eslint-disable-next-line no-restricted-imports -- Native text keeps the mocked card independent of app providers.
import {Text} from 'react-native';

import createRandomPolicy from '../../../../utils/collections/policies';
import createMock from '../../../../utils/createMock';

const MockText = Text;
const mockShowReadOnlyModal = jest.fn();
const mockShowConfirmModal = jest.fn();
let mockPolicies: OnyxCollection<Policy>;
let mockSelectedProviders: unknown;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    localeCompare: (a: string, b: string) => a.localeCompare(b),
}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => jest.fn());
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useStyleUtils', () => () => ({getWidthStyle: jest.fn()}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({
    shouldUseNarrowLayout: false,
}));
jest.mock('@hooks/useWorkspaceDocumentTitle', () => jest.fn());
jest.mock('@hooks/useHRSyncResultsPage', () => jest.fn());
jest.mock('@hooks/useMergeHRInitialSyncingModal', () => jest.fn());
jest.mock('@hooks/usePersonalDetailByLogin', () => ({
    usePersonalDetailsByLogins: () => ({}),
}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({}),
}));
jest.mock('@hooks/useConfirmModal', () => () => ({
    showConfirmModal: mockShowConfirmModal,
}));
jest.mock('@hooks/useSearchResults', () => (items: HRCardDescriptor[]) => ['', jest.fn(), items]);
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useIsFocused: () => true,
}));
jest.mock('@libs/actions/PolicyConnections', () => ({
    openPolicyHRPage: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));
jest.mock('@pages/workspace/hr/utils', () => ({getHRCards: jest.fn()}));
jest.mock('@components/ConnectToHRFlow', () => jest.fn(() => null));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/Section',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/CollapsibleSection',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@components/SearchBar/CompactSearchBar', () => () => null);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@pages/workspace/hr/HRProviderCard', () => ({card, handleConnect}: {card: HRCardDescriptor; handleConnect: () => void}) => (
    <MockText onPress={handleConnect}>{card.displayName}</MockText>
));

const card: HRCardDescriptor = {
    key: 'not-a-provider-slug',
    connectionName: CONST.POLICY.CONNECTIONS.NAME.MERGE_HR,
    mergeSlug: 'workday',
    displayName: 'Workday',
    icon: '',
    setupLink: 'https://example.com/connect-workday',
    isConnected: false,
    isSyncInProgress: false,
    hasError: false,
    needsReconnect: false,
};

const sourcePolicy: Policy = {
    ...createRandomPolicy(2),
    role: CONST.POLICY.ROLE.ADMIN,
    connections: {
        [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
            config: {
                integration: 'workday',
                approvalMode: null,
                finalApprover: null,
                groups: null,
            },
        },
    },
};

function renderPage() {
    return render(
        <WorkspaceHRPage
            navigation={createMock<PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.HR>['navigation']>({})}
            route={{
                key: 'hr',
                name: SCREENS.WORKSPACE.HR,
                params: {policyID: '1'},
            }}
        />,
    );
}

describe('WorkspaceHRPage connection routing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(usePolicy).mockReturnValue({...createRandomPolicy(1), connections: {}});
        mockPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}2`]: sourcePolicy};
        jest.mocked(useOnyx).mockImplementation((key, options) => {
            if (key !== ONYXKEYS.COLLECTION.POLICY) {
                return [undefined, {status: 'loaded'}];
            }
            mockSelectedProviders = options?.selector ? options.selector(mockPolicies) : mockPolicies;
            return [mockSelectedProviders ?? undefined, {status: 'loaded'}];
        });
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        jest.mocked(usePolicyFeatureWriteAccess).mockReturnValue({
            canWrite: true,
            showReadOnlyModal: mockShowReadOnlyModal,
            withReadOnlyFallback: jest.fn(),
        });
        jest.mocked(getHRCards).mockReturnValue([card]);
    });

    it('opens the provider-specific picker when another admin workspace matches', () => {
        renderPage();
        fireEvent.press(screen.getByText('Workday'));

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_HR_MERGE_EXISTING_CONNECTIONS.getRoute('1', 'workday'));
        expect(ConnectToHRFlow).not.toHaveBeenCalled();
        expect(mockSelectedProviders).toEqual(['workday']);
    });

    it('launches the current connection flow directly with no matching workspace', () => {
        mockPolicies = undefined;
        renderPage();
        fireEvent.press(screen.getByText('Workday'));

        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(ConnectToHRFlow).toHaveBeenCalledWith(expect.objectContaining({setupLink: card.setupLink}), undefined);
    });

    it('preserves reconnect even when another matching connection exists', () => {
        jest.mocked(getHRCards).mockReturnValue([{...card, isConnected: true, needsReconnect: true}]);
        renderPage();
        fireEvent.press(screen.getByText('Workday'));

        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(ConnectToHRFlow).toHaveBeenCalledWith(expect.objectContaining({setupLink: card.setupLink}), undefined);
    });

    it.each([{archivedDate: '2026-09-07 10:00:00'}, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}])(
        'launches a new connection directly when the only matching workspace is inactive (%j)',
        (inactiveState) => {
            mockPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}2`]: {...sourcePolicy, ...inactiveState}};
            renderPage();
            fireEvent.press(screen.getByText('Workday'));

            expect(mockSelectedProviders).toEqual([]);
            expect(Navigation.navigate).not.toHaveBeenCalled();
            expect(ConnectToHRFlow).toHaveBeenCalled();
        },
    );

    it('preserves the already-connected warning', () => {
        jest.mocked(getHRCards).mockReturnValue([card, {...card, key: 'gusto', displayName: 'Gusto', isConnected: true}]);
        renderPage();
        fireEvent.press(screen.getByText('Workday'));

        expect(mockShowConfirmModal).toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(ConnectToHRFlow).not.toHaveBeenCalled();
    });

    it('enforces feature-write access before opening the picker or connection flow', () => {
        jest.mocked(usePolicyFeatureWriteAccess).mockReturnValue({
            canWrite: false,
            showReadOnlyModal: mockShowReadOnlyModal,
            withReadOnlyFallback: jest.fn(),
        });
        renderPage();
        fireEvent.press(screen.getByText('Workday'));

        expect(mockShowReadOnlyModal).toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(ConnectToHRFlow).not.toHaveBeenCalled();
    });

    it('does not connect or reconnect while offline', () => {
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});
        jest.mocked(getHRCards).mockReturnValue([{...card, isConnected: true, needsReconnect: true}]);
        renderPage();
        fireEvent.press(screen.getByText('Workday'));

        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(ConnectToHRFlow).not.toHaveBeenCalled();
    });
});
