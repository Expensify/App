import {render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RestrictedActionParamList} from '@libs/Navigation/types';

import WorkspaceRestrictedActionPage from '@src/pages/RestrictedAction/Workspace/WorkspaceRestrictedActionPage';
import type SCREENS from '@src/SCREENS';

import type * as ReactNavigationNative from '@react-navigation/native';
import type ReactNative from 'react-native';

import React from 'react';

import createMock from '../../../utils/createMock';

const mockIsFocused = jest.fn(() => true);
const mockShouldRestrictUserBillableActions = jest.fn(() => false);

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

jest.mock('@libs/SubscriptionUtils', () => ({
    shouldRestrictUserBillableActions: () => mockShouldRestrictUserBillableActions(),
}));

jest.mock('@libs/actions/Subscription', () => ({
    openSubscriptionPage: jest.fn(),
}));

jest.mock('@libs/PolicyUtils', () => ({
    isPolicyOwner: jest.fn(() => true),
    isPolicyAdmin: jest.fn(() => false),
    isPolicyAuditor: jest.fn(() => false),
    isPolicyUser: jest.fn(() => false),
}));

// `isLoadingSubscriptionData` gates both the goBack effect and the loading indicator, so the tests drive it.
const mockIsLoadingSubscriptionData = jest.fn<boolean | undefined, []>(() => false);
jest.mock('@hooks/useOnyx', () => (key: string) => [key === 'isLoadingSubscriptionData' ? mockIsLoadingSubscriptionData() : undefined]);

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, email: 'owner@example.com'})));
jest.mock('@hooks/usePolicy', () => jest.fn(() => ({id: 'policyID1'})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

// Renders identifiable text so the tests can tell the restriction UI apart from the loading indicator.
jest.mock('@src/pages/RestrictedAction/Workspace/WorkspaceOwnerRestrictedAction', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    function MockWorkspaceOwnerRestrictedAction() {
        return <Text>owner-restriction-ui</Text>;
    }
    return MockWorkspaceOwnerRestrictedAction;
});

jest.mock('@src/pages/RestrictedAction/Workspace/WorkspaceAdminRestrictedAction', () => {
    function MockWorkspaceAdminRestrictedAction() {
        return null;
    }
    return MockWorkspaceAdminRestrictedAction;
});

jest.mock('@src/pages/RestrictedAction/Workspace/WorkspaceUserRestrictedAction', () => {
    function MockWorkspaceUserRestrictedAction() {
        return null;
    }
    return MockWorkspaceUserRestrictedAction;
});

type PageProps = PlatformStackScreenProps<RestrictedActionParamList, typeof SCREENS.RESTRICTED_ACTION_ROOT>;

// The page only reads route.params.policyID. The navigation double just satisfies the navigator-provided prop.
const props = {
    route: createMock<PageProps['route']>({params: {policyID: 'policyID1'}}),
    navigation: createMock<PageProps['navigation']>({}),
} satisfies PageProps;

describe('WorkspaceRestrictedActionPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsFocused.mockReturnValue(true);
        mockShouldRestrictUserBillableActions.mockReturnValue(false);
        mockIsLoadingSubscriptionData.mockReturnValue(false);
    });

    it('dismisses itself when focused and the restriction no longer applies', () => {
        // Given a focused restricted action screen whose billing restriction has been resolved
        mockIsFocused.mockReturnValue(true);

        // When the page renders with fresh server data
        render(<WorkspaceRestrictedActionPage {...props} />);

        // Then it navigates back, since there is nothing left to restrict
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
    });

    it('stays put while unfocused so it cannot pop the screen the user is actually on', () => {
        // Given the restricted action screen is still mounted in the RHP but the user has moved on to
        // the Subscription page, where they just resolved the billing issue
        mockIsFocused.mockReturnValue(false);

        // When the fresh server data lifts the restriction
        render(<WorkspaceRestrictedActionPage {...props} />);

        // Then this unfocused screen must not navigate back, which would yank the Subscription page
        // out from under the user mid-payment
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('does not dismiss itself while the restriction still applies', () => {
        // Given a focused restricted action screen whose billing restriction is still in force
        mockShouldRestrictUserBillableActions.mockReturnValue(true);

        // When the page renders
        render(<WorkspaceRestrictedActionPage {...props} />);

        // Then the restriction UI stays up
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('shows the loading indicator while focused and waiting on fresh billing data', () => {
        // Given a focused restricted action screen whose billing fetch is still in flight
        mockShouldRestrictUserBillableActions.mockReturnValue(true);
        mockIsLoadingSubscriptionData.mockReturnValue(true);

        // When the page renders
        render(<WorkspaceRestrictedActionPage {...props} />);

        // Then it shows the loading indicator rather than flashing a restriction that may no longer apply
        expect(screen.queryByText('owner-restriction-ui')).toBeNull();
    });

    it('keeps the restriction UI mounted while unfocused and the shared loading flag is set', () => {
        // Given the restricted action screen still mounted in the RHP underneath the Subscription page,
        // whose own billing fetch has set the shared `isLoadingSubscriptionData` flag
        mockShouldRestrictUserBillableActions.mockReturnValue(true);
        mockIsLoadingSubscriptionData.mockReturnValue(true);
        mockIsFocused.mockReturnValue(false);

        // When the page re-renders behind the user's back
        render(<WorkspaceRestrictedActionPage {...props} />);

        // Then it must not swap its content for the loading indicator. Doing so unmounts the restriction UI
        // while it is covered, discarding state it captured on mount.
        expect(screen.getByText('owner-restriction-ui')).toBeTruthy();
    });
});
