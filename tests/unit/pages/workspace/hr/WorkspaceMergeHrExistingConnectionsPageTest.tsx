import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ConnectToHRFlow from '@components/ConnectToHRFlow';
import type {MenuItemWithLink} from '@components/MenuItemList';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';

import {copyExistingPolicyConnection} from '@libs/actions/connections';
import {getMergeSetupLink} from '@libs/actions/connections/merge';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import WorkspaceMergeHrExistingConnectionsPage from '@pages/workspace/hr/merge/WorkspaceMergeHrExistingConnectionsPage';

import CONST from '@src/CONST';
import MERGE_HR_PROVIDERS from '@src/CONST/MERGE_HR_PROVIDERS';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type Policy from '@src/types/onyx/Policy';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';
// eslint-disable-next-line no-restricted-imports -- Native text keeps the mocked menu independent of app providers.
import {Text} from 'react-native';

import createRandomPolicy from '../../../../utils/collections/policies';
import createMock from '../../../../utils/createMock';

const MockText = Text;
const mockShowReadOnlyModal = jest.fn();
const mockDatetimeToRelative = jest.fn(() => '2 hours ago');
let mockMenuItems: MenuItemWithLink[] = [];
let mockPolicies: OnyxCollection<Policy>;
let mockSelectedPolicies: unknown;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string, provider?: string, date?: string) => (key === 'workspace.common.lastSyncDate' ? `${provider} - Last synced ${date}` : key),
    datetimeToRelative: mockDatetimeToRelative,
}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => jest.fn());
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({}),
}));
jest.mock('@libs/actions/connections', () => ({
    copyExistingPolicyConnection: jest.fn(),
}));
jest.mock('@libs/actions/connections/merge', () => ({
    getMergeSetupLink: jest.fn(() => 'https://example.com/new-workday'),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));
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
jest.mock('@components/HeaderWithBackButton', () => ({onBackButtonPress}: {onBackButtonPress: () => void}) => <MockText onPress={onBackButtonPress}>Back</MockText>);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children, shouldBeBlocked}: React.PropsWithChildren<{shouldBeBlocked?: boolean}>) =>
            shouldBeBlocked ? <MockText>Not found</MockText> : children,
);
jest.mock('@components/MenuItemList', () => ({menuItems}: {menuItems: MenuItemWithLink[]}) => {
    mockMenuItems = menuItems;
    return menuItems.map((item) => (
        <MockText
            key={item.key ?? item.title}
            onPress={(event) => {
                item.onPress?.(event);
            }}
        >
            {item.title}
        </MockText>
    ));
});

function makeSourcePolicy(id: number, integration: MergeHRProviderSlug = 'workday', successfulDate = '2026-09-07 10:00:00'): Policy {
    return {
        ...createRandomPolicy(id),
        name: `Workspace ${id}`,
        role: CONST.POLICY.ROLE.ADMIN,
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: {
                config: {
                    integration,
                    approvalMode: null,
                    finalApprover: null,
                    groups: null,
                },
                lastSync: {
                    successfulDate,
                    isSuccessful: true,
                    isAuthenticationError: false,
                    source: 'NEWEXPENSIFY',
                },
            },
        },
    };
}

function renderPage(providerSlug: MergeHRProviderSlug = 'workday') {
    return render(
        <WorkspaceMergeHrExistingConnectionsPage
            navigation={createMock<PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_MERGE_EXISTING_CONNECTIONS>['navigation']>({})}
            route={{
                key: 'existing-hr',
                name: SCREENS.WORKSPACE.HR_MERGE_EXISTING_CONNECTIONS,
                params: {policyID: '1', providerSlug},
            }}
        />,
    );
}

describe('WorkspaceMergeHrExistingConnectionsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMenuItems = [];
        jest.mocked(usePolicy).mockReturnValue({...createRandomPolicy(1), connections: {}});
        mockPolicies = {
            [`${ONYXKEYS.COLLECTION.POLICY}2`]: makeSourcePolicy(2),
            [`${ONYXKEYS.COLLECTION.POLICY}3`]: makeSourcePolicy(3, 'bamboohr'),
        };
        jest.mocked(useOnyx).mockImplementation((_key, options) => {
            mockSelectedPolicies = options?.selector ? options.selector(mockPolicies) : mockPolicies;
            return [mockSelectedPolicies ?? undefined, {status: 'loaded'}];
        });
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        jest.mocked(usePolicyFeatureWriteAccess).mockReturnValue({
            canWrite: true,
            showReadOnlyModal: mockShowReadOnlyModal,
            withReadOnlyFallback: jest.fn(),
        });
    });

    it('shows only matching workspaces with provider branding and relative successful sync time', () => {
        renderPage();

        expect(screen.getByText('Workspace 2')).toBeOnTheScreen();
        expect(screen.queryByText('Workspace 3')).not.toBeOnTheScreen();
        expect(mockSelectedPolicies).toEqual([mockPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}2`]]);
        expect(mockMenuItems.at(0)).toEqual(
            expect.objectContaining({
                icon: MERGE_HR_PROVIDERS.workday.iconUrl,
                description: 'Workday - Last synced 2 hours ago',
            }),
        );
        expect(mockDatetimeToRelative).toHaveBeenCalledWith('2026-09-07 10:00:00');
    });

    it('uses the provider name alone when the connection has never synced', () => {
        const source = makeSourcePolicy(2, 'workday', '');
        mockPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}2`]: source};
        renderPage();

        expect(mockMenuItems.at(0)?.description).toBe('Workday');
        expect(mockDatetimeToRelative).not.toHaveBeenCalled();
    });

    it.each([{archivedDate: '2026-09-07 10:00:00'}, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}])(
        'excludes inactive matching workspaces from its subscription (%j)',
        (inactiveState) => {
            mockPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}2`]: {...makeSourcePolicy(2), ...inactiveState}};
            renderPage();

            expect(mockSelectedPolicies).toEqual([]);
            expect(screen.queryByText('Workspace 2')).not.toBeOnTheScreen();
            expect(screen.getByText('workspace.common.createNewConnection')).toBeOnTheScreen();
        },
    );

    it('copies the chosen connection to the current workspace and returns to HR', () => {
        renderPage();
        fireEvent.press(screen.getByText('Workspace 2'));

        expect(copyExistingPolicyConnection).toHaveBeenCalledWith('2', '1', CONST.POLICY.CONNECTIONS.NAME.MERGE_HR);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_HR.getRoute('1'));
        expect(ConnectToHRFlow).not.toHaveBeenCalled();
    });

    it('allows a new provider connection instead of reuse', () => {
        renderPage();
        fireEvent.press(screen.getByText('workspace.common.createNewConnection'));

        expect(getMergeSetupLink).toHaveBeenCalledWith('1', 'workday');
        expect(ConnectToHRFlow).toHaveBeenCalledWith(expect.objectContaining({setupLink: 'https://example.com/new-workday'}), undefined);
        expect(copyExistingPolicyConnection).not.toHaveBeenCalled();
    });

    it('still allows a new connection when the reusable list becomes empty', () => {
        mockPolicies = undefined;
        renderPage();
        fireEvent.press(screen.getByText('workspace.common.createNewConnection'));

        expect(ConnectToHRFlow).toHaveBeenCalled();
    });

    it('keeps the new connection flow mounted until completion and then returns to HR', () => {
        const page = renderPage();
        fireEvent.press(screen.getByText('workspace.common.createNewConnection'));
        jest.mocked(usePolicy).mockReturnValue(makeSourcePolicy(1));
        page.rerender(
            <WorkspaceMergeHrExistingConnectionsPage
                navigation={createMock<PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.HR_MERGE_EXISTING_CONNECTIONS>['navigation']>({})}
                route={{key: 'existing-hr', name: SCREENS.WORKSPACE.HR_MERGE_EXISTING_CONNECTIONS, params: {policyID: '1', providerSlug: 'workday'}}}
            />,
        );

        expect(screen.queryByText('Not found')).not.toBeOnTheScreen();
        const [flowProps] = jest.mocked(ConnectToHRFlow).mock.calls.at(-1) ?? [];
        act(() => flowProps?.onDone?.());
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_HR.getRoute('1'));
    });

    it.each(['', 'unknown', 'constructor'])('blocks invalid provider routes (%s)', (providerSlug) => {
        // @ts-expect-error Deep links can supply invalid provider slugs at runtime.
        renderPage(providerSlug);

        expect(screen.getByText('Not found')).toBeOnTheScreen();
        expect(ConnectToHRFlow).not.toHaveBeenCalled();
        expect(getMergeSetupLink).not.toHaveBeenCalled();
        expect(copyExistingPolicyConnection).not.toHaveBeenCalled();
    });

    it('blocks stale picker routes once the target already has an HR connection', () => {
        jest.mocked(usePolicy).mockReturnValue(makeSourcePolicy(1));
        renderPage();

        expect(screen.getByText('Not found')).toBeOnTheScreen();
    });

    it('guards both reuse and create actions offline, even when their handlers are invoked', () => {
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});
        renderPage();
        fireEvent.press(screen.getByText('Workspace 2'));
        fireEvent.press(screen.getByText('workspace.common.createNewConnection'));

        expect(mockMenuItems.every((item) => item.disabled)).toBe(true);
        expect(copyExistingPolicyConnection).not.toHaveBeenCalled();
        expect(ConnectToHRFlow).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('guards both reuse and create actions with feature-write access', () => {
        jest.mocked(usePolicyFeatureWriteAccess).mockReturnValue({
            canWrite: false,
            showReadOnlyModal: mockShowReadOnlyModal,
            withReadOnlyFallback: jest.fn(),
        });
        renderPage();
        fireEvent.press(screen.getByText('Workspace 2'));
        fireEvent.press(screen.getByText('workspace.common.createNewConnection'));

        expect(mockShowReadOnlyModal).toHaveBeenCalledTimes(2);
        expect(copyExistingPolicyConnection).not.toHaveBeenCalled();
        expect(ConnectToHRFlow).not.toHaveBeenCalled();
    });

    it('returns to HR when the back button is pressed', () => {
        renderPage();
        fireEvent.press(screen.getByText('Back'));

        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_HR.getRoute('1'));
    });
});
