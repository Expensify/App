import {render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import type {InviteMemberListItemProps, ListItem} from '@components/SelectionList/ListItem/types';
import ListItemReportAvatar from '@components/SelectionList/ListItemComposed/primitives/ListItemReportAvatar';
import ListItemUserAvatar from '@components/SelectionList/ListItemComposed/primitives/ListItemUserAvatar';

import CONST from '@src/CONST';

import React from 'react';

const SELECTION_BUTTON_TEST_ID = `${CONST.SELECTION_BUTTON_TEST_ID}Invitee`;
const ROW_TEST_ID = `${CONST.BASE_LIST_ITEM_TEST_ID}invitee`;

// The locale store is empty in unit tests, so resolve translations to their key (plus any string parameter).
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string, param?: unknown) => (typeof param === 'string' ? `${key} ${param}` : key),
    formatPhoneNumber: (value: string) => value,
}));

// Icons load lazily in production; resolve them synchronously so icon-based assertions don't race the chunk load.
jest.mock('@hooks/useLazyAsset', () => ({
    ...jest.requireActual<Record<string, unknown>>('@hooks/useLazyAsset'),
    useMemoizedLazyExpensifyIcons: (names: string[]) => Object.fromEntries(names.map((name) => [name, name])),
}));

jest.mock('@components/SelectionList/ListItemComposed/primitives/ListItemReportAvatar', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItemComposed/primitives/ListItemUserAvatar', () => jest.fn(() => null));

const mockReportAvatar = jest.mocked(ListItemReportAvatar);
const mockUserAvatar = jest.mocked(ListItemUserAvatar);

const buildItem = (extra: Partial<ListItem> = {}): ListItem => ({
    text: 'Invitee',
    keyForList: 'invitee',
    isSelected: false,
    ...extra,
});

const renderItem = ({item = buildItem(), ...props}: Partial<InviteMemberListItemProps<ListItem>> = {}) =>
    render(
        <OnyxListItemProvider>
            <InviteMemberListItem
                item={item}
                showTooltip={false}
                onSelectRow={props.onSelectRow ?? jest.fn()}
                {...props}
            />
        </OnyxListItemProvider>,
    );

describe('InviteMemberListItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        ['hides the selection button for a disabled, unselected item', buildItem({isDisabled: true}), false],
        ['shows the selection button for a disabled, selected item', buildItem({isDisabled: true, isSelected: true}), true],
        ['shows the selection button for an enabled item', buildItem(), true],
    ])('%s', (_label, item, isButtonVisible) => {
        renderItem({item, canSelectMultiple: true});

        expect(screen.getByTestId(ROW_TEST_ID)).toBeVisible();
        const button = screen.queryByTestId(SELECTION_BUTTON_TEST_ID);
        if (isButtonVisible) {
            expect(button).toBeTruthy();
        } else {
            expect(button).toBeNull();
        }
    });

    it.each([
        [2, true],
        [1, false],
    ])('renders the title with %s line(s) when isMultilineSupported=%s', (expectedNumberOfLines, isMultilineSupported) => {
        renderItem({isMultilineSupported});

        expect(screen.getByText('Invitee').props.numberOfLines).toBe(expectedNumberOfLines);
    });

    it('renders the secondary login footer', () => {
        renderItem({item: buildItem({invitedSecondaryLogin: 'secondary@test.com'})});

        expect(screen.getByText(/secondary@test\.com/)).toBeVisible();
    });

    it.each([
        ['the user avatar from the item accountID', buildItem({accountID: 7}), mockUserAvatar, {accountID: 7}],
        [
            'the user avatar from the first icon id without an accountID',
            buildItem({icons: [{source: 'avatar.png', type: CONST.ICON_TYPE_AVATAR, name: 'User', id: 99}]}),
            mockUserAvatar,
            {accountID: 99},
        ],
        ['the report avatar when the item has a reportID', buildItem({reportID: '42', accountID: 7}), mockReportAvatar, {reportID: '42'}],
    ])('renders %s', (_label, item, expectedAvatar, expectedProps) => {
        renderItem({item});

        expect(expectedAvatar.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining(expectedProps));
    });
});
