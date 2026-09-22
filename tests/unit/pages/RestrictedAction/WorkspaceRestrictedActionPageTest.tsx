import {render} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RestrictedActionParamList} from '@libs/Navigation/types';
import WorkspaceRestrictedActionPage from '@src/pages/RestrictedAction/Workspace/WorkspaceRestrictedActionPage';
import type SCREENS from '@src/SCREENS';

import type * as ReactNavigationNative from '@react-navigation/native';

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

// The restriction is resolved, so `isLoadingSubscriptionData` must be `false` for the effect under test to run.
jest.mock('@hooks/useOnyx', () => (key: string) => [key === 'isLoadingSubscriptionData' ? false : undefined]);

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, email: 'owner@example.com'})));
jest.mock('@hooks/usePolicy', () => jest.fn(() => ({id: 'policyID1'})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

jest.mock('@src/pages/RestrictedAction/Workspace/WorkspaceOwnerRestrictedAction', () => {
    function MockWorkspaceOwnerRestrictedAction() {
        return null;
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
});
