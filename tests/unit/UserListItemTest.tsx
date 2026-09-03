import {render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import ListItemReportAvatar from '@components/SelectionList/ListItemComposed/primitives/ListItemReportAvatar';
import ListItemRightCaret from '@components/SelectionList/ListItemComposed/primitives/ListItemRightCaret';
import ListItemUserAvatar from '@components/SelectionList/ListItemComposed/primitives/ListItemUserAvatar';
import ListItemWorkspaceAvatar from '@components/SelectionList/ListItemComposed/primitives/ListItemWorkspaceAvatar';

import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';
import {View} from 'react-native';

const ROW_TEST_ID = `${CONST.BASE_LIST_ITEM_TEST_ID}test-user`;

jest.mock('@hooks/useLocalize', () => () => ({translate: jest.fn((path: string) => path), formatPhoneNumber: jest.fn((value: string) => value)}));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));

jest.mock('@components/SelectionList/ListItemComposed/primitives/ListItemReportAvatar', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItemComposed/primitives/ListItemUserAvatar', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItemComposed/primitives/ListItemWorkspaceAvatar', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItemComposed/primitives/ListItemRightCaret', () => jest.fn(() => null));

const mockReportAvatar = jest.mocked(ListItemReportAvatar);
const mockUserAvatar = jest.mocked(ListItemUserAvatar);
const mockWorkspaceAvatar = jest.mocked(ListItemWorkspaceAvatar);
const mockRightCaret = jest.mocked(ListItemRightCaret);
const mockUseOnyx = jest.mocked(useOnyx);

const workspaceIcon: Icon = {source: 'workspace.png', type: CONST.ICON_TYPE_WORKSPACE, name: 'Workspace', id: 'policy-from-icon'};
const avatarIcon: Icon = {source: 'avatar.png', type: CONST.ICON_TYPE_AVATAR, name: 'User', id: 99};

const buildItem = (extra: Partial<ListItem> = {}): ListItem => ({
    text: 'Test User',
    keyForList: 'test-user',
    ...extra,
});

const renderItem = (item: ListItem, props: Partial<React.ComponentProps<typeof UserListItem<ListItem>>> = {}) =>
    render(
        <OnyxListItemProvider>
            <UserListItem
                item={item}
                showTooltip={false}
                onSelectRow={jest.fn()}
                {...props}
            />
        </OnyxListItemProvider>,
    );

describe('UserListItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}] as unknown as ReturnType<typeof useOnyx>);
    });

    describe('avatar resolution', () => {
        it('renders the report avatar when the report exists in Onyx', () => {
            mockUseOnyx.mockReturnValue([true, {status: 'loaded'}] as unknown as ReturnType<typeof useOnyx>);
            renderItem(buildItem({reportID: '42'}));

            expect(mockReportAvatar.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({reportID: '42', fallbackDisplayName: 'Test User'}));
            expect(mockUserAvatar).not.toHaveBeenCalled();
            expect(mockWorkspaceAvatar).not.toHaveBeenCalled();
        });

        it.each([
            ['the item policyID', buildItem({policyID: 'policy-1'}), {policyID: 'policy-1'}],
            ['the workspace icon id when it is the only icon and no other IDs exist', buildItem({icons: [workspaceIcon]}), {policyID: 'policy-from-icon'}],
        ])('renders the workspace avatar from %s', (_label, item, expectedProps) => {
            renderItem(item);

            expect(mockWorkspaceAvatar.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining(expectedProps));
            expect(mockReportAvatar).not.toHaveBeenCalled();
            expect(mockUserAvatar).not.toHaveBeenCalled();
        });

        it.each([
            ['the item accountID', buildItem({accountID: 7}), 7],
            ['the second icon id when the item has no accountID', buildItem({icons: [workspaceIcon, avatarIcon]}), 99],
            ['the item accountID when its report is not in Onyx', buildItem({reportID: '42', accountID: 7}), 7],
        ])('renders the user avatar from %s', (_label, item, expectedAccountID) => {
            renderItem(item);

            expect(mockUserAvatar.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({accountID: expectedAccountID}));
            expect(mockReportAvatar).not.toHaveBeenCalled();
            expect(mockWorkspaceAvatar).not.toHaveBeenCalled();
        });

        it('renders no avatar without a report, policy, or account', () => {
            renderItem(buildItem());

            expect(mockReportAvatar).not.toHaveBeenCalled();
            expect(mockUserAvatar).not.toHaveBeenCalled();
            expect(mockWorkspaceAvatar).not.toHaveBeenCalled();
        });
    });

    it('renders item.rightElement as a plain child', () => {
        renderItem(buildItem({rightElement: <View testID="right-element" />}));

        expect(screen.getByTestId('right-element')).toBeVisible();
    });

    it.each([
        ['renders the right caret when the item asks for it', buildItem({shouldShowRightCaret: true}), 1],
        ['renders no right caret otherwise', buildItem(), 0],
    ])('%s', (_label, item, expectedCalls) => {
        renderItem(item);

        expect(mockRightCaret).toHaveBeenCalledTimes(expectedCalls);
    });

    it('renders the secondary login footer only when the item carries one', () => {
        renderItem(buildItem({invitedSecondaryLogin: 'secondary@test.com'}));

        expect(screen.getByText(/workspace.people.invitedBySecondaryLogin/)).toBeVisible();
    });

    it.each([
        ['disables the row accessibility grouping when a right-side component renders without multi-select', false, false],
        ['keeps the row accessibility grouping with multi-select', true, true],
    ])('%s', (_label, canSelectMultiple, isRowAccessible) => {
        renderItem(buildItem(), {canSelectMultiple, rightHandSideComponent: <View testID="rhs" />});

        const rowAccessible: unknown = screen.getByTestId(ROW_TEST_ID).props.accessible;
        if (isRowAccessible) {
            expect(rowAccessible).not.toBe(false);
        } else {
            expect(rowAccessible).toBe(false);
        }
    });
});
