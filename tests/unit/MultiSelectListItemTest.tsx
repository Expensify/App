import {render, screen} from '@testing-library/react-native';

import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

jest.mock('@components/Avatar/AvatarFromIcon', () => jest.fn(() => null));

const mockAvatarFromIcon = jest.mocked(AvatarFromIcon);

const ICON = {
    source: 'avatar.png',
    type: CONST.ICON_TYPE_AVATAR,
    name: 'Test User',
    id: 7,
};

const CUSTOM_LEFT_ELEMENT_TEST_ID = 'custom-left-element';

function renderItem(item: ListItem) {
    render(
        <MultiSelectListItem
            item={item}
            isFocused={false}
            showTooltip={false}
            onSelectRow={jest.fn()}
        />,
    );
}

describe('MultiSelectListItem', () => {
    beforeEach(() => {
        mockAvatarFromIcon.mockClear();
    });

    it('renders as a checkbox row', () => {
        renderItem({keyForList: 'row', text: 'Row'});

        expect(screen.getByRole(CONST.ROLE.CHECKBOX)).toBeOnTheScreen();
    });

    it.each([
        ['icons only', {icons: [ICON]}, true, false],
        ['leftElement only', {leftElement: <View testID={CUSTOM_LEFT_ELEMENT_TEST_ID} />}, false, true],
        ['both icons and leftElement', {icons: [ICON], leftElement: <View testID={CUSTOM_LEFT_ELEMENT_TEST_ID} />}, false, true],
        ['neither', {}, false, false],
    ])('with %s renders avatar=%s and custom left element=%s', (_label, itemFields, expectsAvatar, expectsLeftElement) => {
        renderItem({keyForList: 'row', text: 'Row', ...itemFields});

        expect(mockAvatarFromIcon).toHaveBeenCalledTimes(expectsAvatar ? 1 : 0);
        if (expectsAvatar) {
            expect(mockAvatarFromIcon.mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({icon: ICON}));
        }
        expect(screen.queryByTestId(CUSTOM_LEFT_ELEMENT_TEST_ID) !== null).toBe(expectsLeftElement);
    });
});
