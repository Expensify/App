import {render, screen} from '@testing-library/react-native';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type {isArchivedPolicy} from '@libs/PolicyUtils/policyType';

import WorkspaceExpensifyCardFeedSelectorPage from '@pages/workspace/expensifyCard/WorkspaceExpensifyCardFeedSelectorPage';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {ExpensifyCardSettings, Policy} from '@src/types/onyx';

import type ReactNative from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';

import createMock from '../utils/createMock';

const POLICY_ID = 'policy123';
const ARCHIVED_FUND_ID = 11;
const ACTIVE_FUND_ID = 22;

// Mutable so a test can back the mocked hooks with feeds from other workspaces and the policies that own them.
let mockPrimaryFeeds: Array<{settingsKey: string; fundID: number; settings: ExpensifyCardSettings}> = [];
let mockOtherFeeds: Array<{settingsKey: string; fundID: number; settings: ExpensifyCardSettings}> = [];
let mockPolicies: OnyxCollection<Policy>;
let mockCanMemberWrite = false;
const mockPolicyCollectionKey = ONYXKEYS.COLLECTION.POLICY;

jest.mock('@components/BlockingViews/BlockingView', () => {
    const {Text, View} = jest.requireActual<typeof ReactNative>('react-native');
    return ({title, subtitle}: {title: string; subtitle: string}) => (
        <View>
            <Text>{title}</Text>
            <Text>{subtitle}</Text>
        </View>
    );
});
jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessActions: () => ({}),
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
}));
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock(
    '@components/FixedFooter',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/LockedAccountModalProvider', () => ({
    useLockedAccountActions: () => ({}),
    useLockedAccountState: () => ({isAccountLocked: false}),
}));
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
jest.mock('@hooks/useCanEnrollNewExpensifyCardProgram', () => ({
    __esModule: true,
    default: () => ({canEnrollNewCardProgram: false}),
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({login: 'member@example.com'}),
}));
jest.mock('@hooks/useDefaultFundID', () => ({
    __esModule: true,
    default: () => 1,
}));
jest.mock('@hooks/useExpensifyCardFeedsForFeedSelector', () => ({
    __esModule: true,
    default: () => ({primaryFeeds: mockPrimaryFeeds, otherFeeds: mockOtherFeeds}),
}));
jest.mock('@libs/ExpensifyCardFeedSelectorUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- partial mock of the real module
    const actual = jest.requireActual('@libs/ExpensifyCardFeedSelectorUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- spread the real module and override the feed name
    return {
        ...actual,
        getExpensifyCardFeedDescription: (_settings: unknown, _policies: unknown, _domains: unknown, fundID: number) => `Feed ${fundID}`,
    };
});
jest.mock('@components/SelectionList', () => {
    const {Text, View} = jest.requireActual<typeof ReactNative>('react-native');
    return ({data}: {data: Array<{keyForList: string; text: string}>}) => (
        <View>
            {data.map((item) => (
                <Text key={item.keyForList}>{item.text}</Text>
            ))}
        </View>
    );
});
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({item}: {item: {text: string}}) => <Text>{item.text}</Text>;
});
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Plus: 'Plus'}),
    useMemoizedLazyIllustrations: () => ({
        ExpensifyCardImage: 'ExpensifyCardImage',
        Telescope: 'Telescope',
    }),
}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => (key === mockPolicyCollectionKey ? [mockPolicies] : [undefined]),
}));
jest.mock('@hooks/usePolicy', () => ({
    __esModule: true,
    default: () => ({id: POLICY_ID}),
}));
jest.mock('@hooks/usePrimaryContactMethod', () => ({
    __esModule: true,
    default: () => 'member@example.com',
}));
jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({flex1: {flex: 1}}),
}));
jest.mock('@libs/PolicyUtils', () => ({
    canEditWorkspaceSettings: () => false,
    canMemberWrite: () => mockCanMemberWrite,
    // The archived check is what this page relies on to drop feeds, so keep the real one
    isArchivedPolicy: jest.requireActual<{isArchivedPolicy: typeof isArchivedPolicy}>('@libs/PolicyUtils/policyType').isArchivedPolicy,
}));
jest.mock('@navigation/Navigation', () => ({
    __esModule: true,
    default: {goBack: jest.fn(), navigate: jest.fn()},
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('@selectors/Account', () => ({isUserValidatedSelector: jest.fn()}));
jest.mock('@userActions/CompanyCards', () => ({
    linkCardFeedToPolicy: jest.fn(),
}));

type FeedSelectorScreenProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SELECT_FEED>;
const route: FeedSelectorScreenProps['route'] = {
    key: 'workspace-expensify-card-select-feed',
    name: SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SELECT_FEED,
    params: {policyID: POLICY_ID},
};
const navigation = createMock<FeedSelectorScreenProps['navigation']>({});

describe('WorkspaceExpensifyCardFeedSelectorPage', () => {
    beforeEach(() => {
        mockPrimaryFeeds = [];
        mockOtherFeeds = [];
        mockPolicies = undefined;
        mockCanMemberWrite = false;
    });

    it('shows an empty state when no feeds or actions are available', () => {
        render(
            <WorkspaceExpensifyCardFeedSelectorPage
                route={route}
                navigation={navigation}
            />,
        );

        expect(screen.getByText('workspace.expensifyCard.noCardFeedsAvailable')).toBeOnTheScreen();
        expect(screen.getByText('workspace.expensifyCard.noCardFeedsAvailableDescription')).toBeOnTheScreen();
    });

    it('does not offer a feed from an archived workspace for linking', () => {
        // Given two feeds from other workspaces the admin manages, one backing an archived workspace and one an active workspace
        mockCanMemberWrite = true;
        mockOtherFeeds = [
            {settingsKey: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${ARCHIVED_FUND_ID}`, fundID: ARCHIVED_FUND_ID, settings: {}},
            {settingsKey: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${ACTIVE_FUND_ID}`, fundID: ACTIVE_FUND_ID, settings: {}},
        ];
        mockPolicies = {
            [`${ONYXKEYS.COLLECTION.POLICY}archived`]: createMock<Policy>({id: 'archived', policyAccountID: ARCHIVED_FUND_ID, archivedDate: '2026-10-28 00:00:00.000'}),
            [`${ONYXKEYS.COLLECTION.POLICY}active`]: createMock<Policy>({id: 'active', policyAccountID: ACTIVE_FUND_ID}),
        };

        // When the feed selector renders
        render(
            <WorkspaceExpensifyCardFeedSelectorPage
                route={route}
                navigation={navigation}
            />,
        );

        // Then only the active workspace's feed is listed, because the backend rejects issuing cards on an archived workspace's feed
        expect(screen.getByText(`Feed ${ACTIVE_FUND_ID}`)).toBeOnTheScreen();
        expect(screen.queryByText(`Feed ${ARCHIVED_FUND_ID}`)).not.toBeOnTheScreen();
    });

    it('shows the empty state when the only feed from other workspaces belongs to an archived workspace', () => {
        // Given the only feed from another workspace backs an archived workspace
        mockCanMemberWrite = true;
        mockOtherFeeds = [{settingsKey: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${ARCHIVED_FUND_ID}`, fundID: ARCHIVED_FUND_ID, settings: {}}];
        mockPolicies = {
            [`${ONYXKEYS.COLLECTION.POLICY}archived`]: createMock<Policy>({id: 'archived', policyAccountID: ARCHIVED_FUND_ID, archivedDate: '2026-10-28 00:00:00.000'}),
        };

        // When the feed selector renders
        render(
            <WorkspaceExpensifyCardFeedSelectorPage
                route={route}
                navigation={navigation}
            />,
        );

        // Then there is nothing to pick, so the page says no feeds are available instead of offering a dead-end feed
        expect(screen.getByText('workspace.expensifyCard.noCardFeedsAvailable')).toBeOnTheScreen();
        expect(screen.queryByText(`Feed ${ARCHIVED_FUND_ID}`)).not.toBeOnTheScreen();
    });

    it('does not offer a feed already linked to this workspace once its own workspace is archived', () => {
        // Given two feeds linked to this workspace, one whose own workspace was archived after the link and one still active.
        // The archived one stays a primary feed because this workspace is still in its linked policies.
        mockCanMemberWrite = true;
        mockPrimaryFeeds = [
            {settingsKey: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${ARCHIVED_FUND_ID}`, fundID: ARCHIVED_FUND_ID, settings: {}},
            {settingsKey: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${ACTIVE_FUND_ID}`, fundID: ACTIVE_FUND_ID, settings: {}},
        ];
        mockPolicies = {
            [`${ONYXKEYS.COLLECTION.POLICY}archived`]: createMock<Policy>({id: 'archived', policyAccountID: ARCHIVED_FUND_ID, archivedDate: '2026-10-28 00:00:00.000'}),
            [`${ONYXKEYS.COLLECTION.POLICY}active`]: createMock<Policy>({id: 'active', policyAccountID: ACTIVE_FUND_ID}),
        };

        // When the feed selector renders
        render(
            <WorkspaceExpensifyCardFeedSelectorPage
                route={route}
                navigation={navigation}
            />,
        );

        // Then only the active feed can be picked, because the backend rejects issuing cards on an archived workspace's feed
        expect(screen.getByText(`Feed ${ACTIVE_FUND_ID}`)).toBeOnTheScreen();
        expect(screen.queryByText(`Feed ${ARCHIVED_FUND_ID}`)).not.toBeOnTheScreen();
    });
});
