import {render} from '@testing-library/react-native';

import AccountAvatar from '@components/Avatar/connected/AccountAvatar';
import PolicyAvatar from '@components/Avatar/connected/PolicyAvatar';
import ReportAvatar from '@components/Avatar/connected/ReportAvatar';
import {AvatarTooltipsProvider} from '@components/Avatar/tooltips/AvatarTooltipContext';
import ListItemComposed from '@components/SelectionList/ListItemComposed';
import {ListItemContext} from '@components/SelectionList/ListItemContext';

import type {ReactNode} from 'react';

import React from 'react';

jest.mock('@components/Avatar/connected/ReportAvatar', () => jest.fn(() => null));
jest.mock('@components/Avatar/connected/AccountAvatar', () => jest.fn(() => null));
jest.mock('@components/Avatar/connected/PolicyAvatar', () => jest.fn(() => null));
jest.mock('@components/Avatar/tooltips/AvatarTooltipContext', () => ({
    AvatarTooltipsProvider: jest.fn(({children}: {children: ReactNode}) => children),
}));
jest.mock('@components/SelectionList/ListItemComposed/hooks/useListItemAvatarColors', () => ({
    useListItemSubscriptAvatarBorderColor: jest.fn(() => '#border'),
    useListItemSecondaryAvatarContainerStyle: jest.fn(() => [{backgroundColor: '#secondary'}]),
}));

const mockReportAvatar = jest.mocked(ReportAvatar);
const mockAccountAvatar = jest.mocked(AccountAvatar);
const mockPolicyAvatar = jest.mocked(PolicyAvatar);
const mockAvatarTooltipsProvider = jest.mocked(AvatarTooltipsProvider);

const renderWithContext = (children: ReactNode, shouldShowTooltip = true) =>
    render(
        <ListItemContext.Provider value={{shouldShowTooltip, isFocusVisible: false, isDisabled: false, isInteractive: true, shouldDisableAccessibleGrouping: false}}>
            {children}
        </ListItemContext.Provider>,
    );

describe('ListItemComposed avatar primitives', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('ReportAvatar forwards the report and the context-driven colors to the connected avatar', () => {
        renderWithContext(
            <ListItemComposed.ReportAvatar
                reportID="42"
                fallbackDisplayName="Report row"
            />,
        );

        expect(mockReportAvatar.mock.calls.at(0)?.at(0)).toEqual(
            expect.objectContaining({
                reportID: '42',
                fallbackDisplayName: 'Report row',
                subscriptAvatarBorderColor: '#border',
                secondaryAvatarContainerStyle: [{backgroundColor: '#secondary'}],
            }),
        );
    });

    it('UserAvatar forwards the account to the connected avatar', () => {
        renderWithContext(
            <ListItemComposed.UserAvatar
                accountID={7}
                fallbackDisplayName="User row"
            />,
        );

        expect(mockAccountAvatar.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({accountID: 7, fallbackDisplayName: 'User row'}));
    });

    it('WorkspaceAvatar forwards the policy, subscript account, and the context-driven border color to the connected avatar', () => {
        renderWithContext(
            <ListItemComposed.WorkspaceAvatar
                policyID="policy-1"
                accountID={7}
                fallbackDisplayName="Workspace row"
            />,
        );

        expect(mockPolicyAvatar.mock.calls.at(0)?.at(0)).toEqual(
            expect.objectContaining({policyID: 'policy-1', accountID: 7, fallbackDisplayName: 'Workspace row', subscriptAvatarBorderColor: '#border'}),
        );
    });

    it.each([
        [true, true],
        [false, false],
    ])('enables avatar tooltips when the context shouldShowTooltip=%s', (shouldShowTooltip, expectedEnabled) => {
        renderWithContext(<ListItemComposed.UserAvatar accountID={7} />, shouldShowTooltip);

        expect(mockAvatarTooltipsProvider.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({isEnabled: expectedEnabled}));
    });
});
