import {render, screen} from '@testing-library/react-native';

import {openSubscriptionPage} from '@libs/actions/Subscription';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RestrictedActionParamList} from '@libs/Navigation/types';
import type * as SubscriptionUtils from '@libs/SubscriptionUtils';

import type ONYXKEYS from '@src/ONYXKEYS';
import WorkspaceRestrictedActionPage from '@src/pages/RestrictedAction/Workspace/WorkspaceRestrictedActionPage';
import type SCREENS from '@src/SCREENS';

import type * as ReactNavigationNative from '@react-navigation/native';
import type ReactNative from 'react-native';

import React from 'react';

import createMock from '../../../utils/createMock';

const mockIsFocused = jest.fn(() => true);
const mockShouldRestrictUserBillableActions = jest.fn<boolean, Parameters<typeof SubscriptionUtils.shouldRestrictUserBillableActions>>(() => false);

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

// Only the restriction gate is replaced. Keeping the rest of the module real means a child that starts
// importing another `SubscriptionUtils` export does not silently resolve it to `undefined`.
jest.mock('@libs/SubscriptionUtils', () => ({
    ...jest.requireActual<typeof SubscriptionUtils>('@libs/SubscriptionUtils'),
    shouldRestrictUserBillableActions: (...args: Parameters<typeof SubscriptionUtils.shouldRestrictUserBillableActions>) => mockShouldRestrictUserBillableActions(...args),
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
// The key is read from the real `ONYXKEYS` inside the factory (a top-level import cannot be referenced from a
// hoisted `jest.mock`), so renaming the constant breaks this mock loudly instead of returning `undefined`.
const mockIsLoadingSubscriptionData = jest.fn<boolean | undefined, []>(() => false);
jest.mock('@hooks/useOnyx', () => {
    const {default: actualOnyxKeys} = jest.requireActual<{default: typeof ONYXKEYS}>('@src/ONYXKEYS');
    // Mirrors the real `[value, result]` tuple so a migration to `result.status` does not read `undefined`.
    return (key: string) => [key === actualOnyxKeys.IS_LOADING_SUBSCRIPTION_DATA ? mockIsLoadingSubscriptionData() : undefined, {status: 'loaded'}];
});

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, email: 'owner@example.com'})));

// Referentially stable, like the real `usePolicy`. Returning a fresh object per render would change a
// dependency of the goBack effect on every render, re-running it no matter what the dependency array says
// and masking a removed `isFocused` dependency.
const mockPolicy = {id: 'policyID1'};
jest.mock('@hooks/usePolicy', () => jest.fn(() => mockPolicy));

// Drivable so the offline branch of the loading condition and the reconnect refetch are both reachable.
const mockIsOffline = jest.fn(() => false);
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: mockIsOffline()})));

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
        mockIsOffline.mockReturnValue(false);
    });

    it('dismisses itself when focused and the restriction no longer applies', () => {
        // Given a focused restricted action screen whose billing restriction has been resolved
        mockIsFocused.mockReturnValue(true);

        // When the page renders with fresh server data
        render(<WorkspaceRestrictedActionPage {...props} />);

        // Then it navigates back, since there is nothing left to restrict
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);

        // And the gate is asked about this policy and this user, in that order. Asserting the arguments
        // catches a refactor that reorders them or drops the grace period collection, which would otherwise
        // leave every test in this file passing against a gate that is being called wrong.
        expect(mockShouldRestrictUserBillableActions).toHaveBeenCalledWith(mockPolicy, undefined, undefined, undefined, 1);
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

    it('dismisses itself once focus returns after the restriction was lifted elsewhere', () => {
        // Given the restricted action screen mounted but covered by the Subscription page
        mockIsFocused.mockReturnValue(false);
        const {rerender} = render(<WorkspaceRestrictedActionPage {...props} />);
        expect(Navigation.goBack).not.toHaveBeenCalled();

        // When the user resolves billing there and swipes back, re-focusing this screen
        mockIsFocused.mockReturnValue(true);
        rerender(<WorkspaceRestrictedActionPage {...props} />);

        // Then the effect re-runs and dismisses the now-obsolete restriction. Without `isFocused` in the
        // effect's dependency array the guard would permanently disable auto-dismiss instead of deferring
        // it, stranding the user on a restriction that no longer applies.
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
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

    it('skips the loading indicator while offline', () => {
        // Given a focused restricted action screen with the shared loading flag set, but no connectivity
        mockShouldRestrictUserBillableActions.mockReturnValue(true);
        mockIsLoadingSubscriptionData.mockReturnValue(true);
        mockIsOffline.mockReturnValue(true);

        // When the page renders
        render(<WorkspaceRestrictedActionPage {...props} />);

        // Then it shows the restriction instead of a spinner that would never resolve: the fetch that
        // clears the flag is itself skipped while offline.
        expect(screen.getByText('owner-restriction-ui')).toBeTruthy();
    });

    it('does not fetch fresh billing data while offline', () => {
        // Given no connectivity
        mockIsOffline.mockReturnValue(true);

        // When the page mounts
        render(<WorkspaceRestrictedActionPage {...props} />);

        // Then it skips the fetch. The request would not go through, and its optimistic clear of the grace
        // period collection would lift the restriction without the server ever confirming it.
        expect(openSubscriptionPage).not.toHaveBeenCalled();
    });

    it('does not refetch on reconnect while unfocused', () => {
        // Given the restricted action screen mounted underneath the Subscription page, with no connectivity
        mockShouldRestrictUserBillableActions.mockReturnValue(true);
        mockIsFocused.mockReturnValue(false);
        mockIsOffline.mockReturnValue(true);
        const {rerender} = render(<WorkspaceRestrictedActionPage {...props} />);

        // When the device reconnects while the user is still on Subscription
        mockIsOffline.mockReturnValue(false);
        rerender(<WorkspaceRestrictedActionPage {...props} />);

        // Then this covered screen stays quiet. The focused Subscription page issues the same fetch, and
        // duplicating it here would flip the shared `isLoadingSubscriptionData` flag out from under it.
        expect(openSubscriptionPage).not.toHaveBeenCalled();
    });

    it('fetches fresh billing data once focus returns', () => {
        // Given the restricted action screen mounted underneath the Subscription page
        mockShouldRestrictUserBillableActions.mockReturnValue(true);
        mockIsFocused.mockReturnValue(false);
        const {rerender} = render(<WorkspaceRestrictedActionPage {...props} />);
        expect(openSubscriptionPage).not.toHaveBeenCalled();

        // When the user swipes back, re-focusing this screen
        mockIsFocused.mockReturnValue(true);
        rerender(<WorkspaceRestrictedActionPage {...props} />);

        // Then the deferred fetch runs, so the screen decides whether to stay up using server data rather
        // than whatever was cached before the user left for Subscription.
        expect(openSubscriptionPage).toHaveBeenCalledTimes(1);
    });
});
