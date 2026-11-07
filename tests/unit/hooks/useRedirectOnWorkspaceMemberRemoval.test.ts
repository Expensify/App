import {renderHook} from '@testing-library/react-native';

import useRedirectOnWorkspaceMemberRemoval from '@hooks/useRedirectOnWorkspaceMemberRemoval';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import type * as ReactNavigation from '@react-navigation/native';

const mockUseIsFocused = jest.fn<boolean, []>();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => mockUseIsFocused(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));

describe('useRedirectOnWorkspaceMemberRemoval', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseIsFocused.mockReturnValue(true);
    });

    it('remembers a member that resolves after the initial render', () => {
        // Given a member whose data has not loaded on the first render
        const {result, rerender} = renderHook(({isResolved}) => useRedirectOnWorkspaceMemberRemoval('1', 123, isResolved), {
            initialProps: {isResolved: false},
        });
        expect(result.current).toBe(false);
        expect(Navigation.goBack).not.toHaveBeenCalled();

        // When the member loads and later disappears during invite sync
        rerender({isResolved: true});
        rerender({isResolved: false});

        // Then the page returns to Members instead of treating the route as an invalid direct link
        expect(result.current).toBe(true);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute('1'));
    });

    it.each([
        {policyID: '1', accountID: 456},
        {policyID: '2', accountID: 123},
    ])('resets history when changing routes to $policyID/$accountID', ({policyID, accountID}) => {
        // Given a valid member on the original route
        const {result, rerender} = renderHook(({policy, account, isResolved}) => useRedirectOnWorkspaceMemberRemoval(policy, account, isResolved), {
            initialProps: {policy: '1', account: 123, isResolved: true},
        });

        // When the same page instance switches to a different unresolved member or workspace
        rerender({policy: policyID, account: accountID, isResolved: false});

        // Then the old route's history cannot redirect the new route
        expect(result.current).toBe(false);
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('waits for focus before redirecting an underlying details page', () => {
        // Given an unfocused details page underneath the Role page
        mockUseIsFocused.mockReturnValue(false);
        const {result, rerender} = renderHook(({isResolved}) => useRedirectOnWorkspaceMemberRemoval('1', 123, isResolved), {
            initialProps: {isResolved: true},
        });

        // When the member disappears, the hidden page suppresses not found without navigating over the focused page
        rerender({isResolved: false});
        expect(result.current).toBe(true);
        expect(Navigation.goBack).not.toHaveBeenCalled();
        mockUseIsFocused.mockReturnValue(true);
        rerender({isResolved: false});

        // Then returning to the details page still redirects even after multiple renders without a member
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute('1'));
    });
});
