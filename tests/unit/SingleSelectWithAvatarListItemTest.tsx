import {render} from '@testing-library/react-native';

import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import SingleSelectWithAvatarListItem from '@components/SelectionList/ListItem/SingleSelectWithAvatarListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/Avatar/AvatarFromIcon', () => jest.fn(() => null));

const mockAvatarFromIcon = jest.mocked(AvatarFromIcon);

const ICON = {
    source: 'avatar.png',
    type: CONST.ICON_TYPE_AVATAR,
    name: 'Test User',
    id: 7,
};

function renderItem(item: ListItem) {
    render(
        <SingleSelectWithAvatarListItem
            item={item}
            isFocused={false}
            showTooltip={false}
            onSelectRow={jest.fn()}
        />,
    );
}

describe('SingleSelectWithAvatarListItem', () => {
    beforeEach(() => {
        mockAvatarFromIcon.mockClear();
    });

    it.each([
        ['icons', {icons: [ICON]}, 1],
        ['no icons', {}, 0],
    ])('with %s renders %s default-size avatar(s)', (_label, itemFields, expectedCalls) => {
        renderItem({keyForList: 'row', text: 'Row', ...itemFields});

        expect(mockAvatarFromIcon).toHaveBeenCalledTimes(expectedCalls);
        if (expectedCalls > 0) {
            expect(mockAvatarFromIcon.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({icon: ICON, size: CONST.AVATAR_SIZE.DEFAULT}));
        }
    });
});
